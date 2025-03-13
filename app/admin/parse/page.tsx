"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  CheckCircle,
  XCircle,
  LinkIcon,
  Settings,
  Store,
  Globe,
  Database,
  Github,
  ArrowDown,
  ShoppingCart,
  X,
} from "lucide-react"
import { createUrlProductsMany } from "@/lib/actions/product.actions"
import { formatStringWithDate, generateUniqueId } from "@/lib/utils"
import ConnectGitHubButton from "@/components/interface/ConnectGitHubButton"
import GitHubPushButton from "@/components/interface/GitHubPushButton"
import { checkIsGitHubConnected, getOwnerUser, transferOwnerUser } from "@/lib/actions/user.actions"
import StoreConfigEditor from "@/components/forms/EditStore"
import { getStoreConfig, updateStoreConfig } from "@/lib/store.config"
import ConnectVercelButton from "@/components/interface/ConnectVercel"

type Product = {
  id: string
  name: string
  images: string[]
  isAvailable: boolean
  quantity: number
  url: string
  priceToShow: number
  price: number
  category: string
  vendor: string
  description: string
  articleNumber: string
  params: { name: string; value: string }[]
}

const initialConfig = {
  name: "No Test",
  currency: "UAH",
  currency_sign: "₴",
  domain: "https://fo-scandinavia.vercel.app",
  database: "newDB",
  default_image: {
    product_card: 0,
    product_page: 0,
    checkout_page: 0,
  },
}

type Status = "idle" | "loading" | "success" | "error"

export default function ProductScraper() {
  const [url, setUrl] = useState("")
  const [links, setLinks] = useState<string[]>([])
  const [products, setProducts] = useState<(Product | null)[]>([])
  const [linkStatus, setLinkStatus] = useState<Status>("idle")
  const [productStatus, setProductStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [isGitHubConnected, setIsGitHubConnected] = useState<boolean>(false)
  const [hasGitHubRepositories, setHasGitHubRepositories] = useState<boolean>(true)
  const [isCheckingGitHub, setIsCheckingGitHub] = useState<boolean>(true)
  const [currentConfig, setCurrentConfig] = useState<typeof initialConfig | null>()
  const [configChanged, setConfigChanged] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)
  const [configSaveStatus, setConfigSaveStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)
  const [shouldCancelFetch, setShouldCancelFetch] = useState(false)
  const [existingRepos, setExistingRepos] = useState<string[]>([])
  const [isVercelConnected, setIsVercelConnected] = useState<boolean>(false)

  const fetchLinks = async () => {
    if (!url) return setError("Please enter a URL")

    setLinkStatus("loading")
    setLinks([])
    setError("")

    try {
      const response = await fetch("/api/parseRzCatalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) throw new Error("Failed to fetch links")

      const data = await response.json()
      setLinks(data.links.slice(0, 50))
      setLinkStatus("success")
    } catch (error) {
      console.error("Error fetching links:", error)
      setError("Failed to fetch links")
      setLinkStatus("error")
    }
  }

  const estimateConcurrency = () => {
    const cores = navigator.hardwareConcurrency || 4
    const totalMemory = (navigator as any)?.deviceMemory || 4

    let freeMemoryGB = 4
    if ((performance as any)?.memory) {
      const memoryInfo = (performance as any).memory
      freeMemoryGB = (totalMemory * 1024 - memoryInfo.usedJSHeapSize / 1024 / 1024) / 1024
    }

    if (cores >= 8 && freeMemoryGB >= 8) return 10
    if (cores >= 6 && freeMemoryGB >= 4) return 7
    return 5
  }

  const fetchProducts = async () => {
    if (links.length === 0) return setError("No links to parse")

    setProductStatus("loading")
    setProducts([])
    setError("")
    setProgress(0)
    setShouldCancelFetch(false)

    try {
      const totalLinks = links.length
      let completedLinks = 0
      const fetchedProducts: any[] = []
      const concurrencyLimit = estimateConcurrency()
      let linkIndex = 0
      let activeFetches = 0 // Track number of active fetches

      return new Promise<void>((resolve, reject) => {
        const processNext = async () => {
          if (shouldCancelFetch || linkIndex >= totalLinks) {
            if (activeFetches === 0) resolve() // Stop when all products are processed
            return
          }

          activeFetches++
          const url = links[linkIndex++]

          fetch(`/api/parseRzProduct?url=${encodeURIComponent(url)}`)
            .then((response) => response.json())
            .then((data) => {
              fetchedProducts.push(...data)
            })
            .catch((err) => {
              console.error(`Error parsing product at ${url}:`, err)
            })
            .finally(() => {
              activeFetches--
              completedLinks++
              setProgress(Math.round((completedLinks / totalLinks) * 100))

              if (completedLinks >= totalLinks && activeFetches === 0) {
                resolve() // Resolve only when everything is processed
              } else {
                processNext() // Fetch next link
              }
            })
        }

        // Start initial batch
        for (let i = 0; i < concurrencyLimit && i < totalLinks; i++) {
          processNext()
        }
      }).then(async () => {
        const productsWithIds = fetchedProducts.map((product) => ({
          ...product,
          id: generateUniqueId(),
        }))

        await createUrlProductsMany(productsWithIds)
        setProducts(productsWithIds)
        setProductStatus("success")
      })
    } catch (err) {
      setError("Failed to fetch product data")
      setProductStatus("error")
    }
  }

  const cancelProductFetch = () => {
    setShouldCancelFetch(true)
  }

  useEffect(() => {
    const determineConnections = async () => {
      setIsCheckingGitHub(true)
      try {
        const { connectedGit, connectedVercel } = await checkIsGitHubConnected()
        setIsGitHubConnected(connectedGit)
        setIsVercelConnected(connectedVercel)

        if (connectedGit && connectedVercel) {
          const res = await fetch("/api/github/repos")
          const data = await res.json()

          if (data.repos) {
            setHasGitHubRepositories(data.repos.length > 0)
            setExistingRepos(data.repos.map((repo: any) => repo.name))
          } else {
            setHasGitHubRepositories(false)
            setExistingRepos([])
          }

          // Load store config
          const config = await getStoreConfig()
          setCurrentConfig(config)
        }
      } catch (error) {
        console.error("Error checking connections:", error)
        setError("Failed to check connection status")
      } finally {
        setIsCheckingGitHub(false)
      }
    }

    determineConnections()
  }, [])

  const handleConfigUpdate = (newConfig: typeof initialConfig) => {
    setCurrentConfig(newConfig)
    setConfigChanged(true)
    setConfigSaved(false)
  }

  const handleConfigSave = async (newConfig: typeof initialConfig) => {
    try {
      setConfigSaveStatus("loading")
      const result = await getOwnerUser("json")

      await updateStoreConfig({ ...newConfig, database: formatStringWithDate(newConfig.name) })

      const user = JSON.parse(result)

      await transferOwnerUser({ user })
      setCurrentConfig(newConfig)
      setConfigSaved(true)
      setConfigChanged(false)
      setConfigSaveStatus("success")
    } catch (error) {
      console.error("Error updating config:", error)
      setError("Failed to update configuration")
      setConfigSaveStatus("error")
    }
  }

  if (isCheckingGitHub) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
          <p className="text-base-medium">Checking GitHub connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-heading2-bold text-center flex items-center justify-center gap-2">
            <Settings className="h-6 w-6" />
            Project hosting {}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Connection Section - Show if either GitHub or Vercel is not connected */}
          {(!isGitHubConnected || !isVercelConnected) && (
            <div className="space-y-4 bg-card p-5 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Github className="h-5 w-5 text-neutral-900" />
                <h3 className="text-heading4-medium">Integrations</h3>
              </div>

              <div className="p-6 border rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-4">
                <div className="text-center max-w-md">
                  <h4 className="text-base-semibold mb-2">Connect Your Accounts</h4>
                  <p className="text-base-regular mb-4">
                    To use the Auto Hoster, you need to connect both your GitHub and Vercel accounts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {!isGitHubConnected && <ConnectGitHubButton />}
                  {!isVercelConnected && <ConnectVercelButton />}
                </div>
              </div>
            </div>
          )}

          {/* Only show the rest if both GitHub and Vercel are connected */}
          {isGitHubConnected && isVercelConnected && (
            <>
              {/* Store Configuration Section */}
              {hasGitHubRepositories && (
                <div className="space-y-4 bg-card p-5 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="h-5 w-5 text-neutral-900" />
                    <h3 className="text-heading4-medium">Store Configuration</h3>
                    {configSaveStatus === "loading" && (
                      <div className="ml-auto">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-900" />
                      </div>
                    )}
                    {configSaveStatus === "success" && (
                      <div className="ml-auto">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {currentConfig && (
                    <StoreConfigEditor
                      initialConfig={currentConfig}
                      onUpdate={handleConfigUpdate}
                      onSave={handleConfigSave}
                      existingRepos={existingRepos}
                    />
                  )}
                </div>
              )}

              {/* Visual flow indicator */}
              {(configSaved || !hasGitHubRepositories) && (
                <div className="flex justify-center">
                  <ArrowDown className="h-8 w-8 text-neutral-900 animate-bounce" />
                </div>
              )}

              {/* Scraping Section - Visible after config is saved or if no GitHub repos */}
              {(
                <div className="space-y-4 bg-card p-5 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="h-5 w-5 text-neutral-900" />
                    <h3 className="text-heading4-medium">Scrape Products</h3>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="relative flex-grow">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter catalog URL to scrape"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10 text-base-regular h-10"
                        disabled={linkStatus === "loading"}
                      />
                    </div>
                    <Button
                      onClick={fetchLinks}
                      disabled={linkStatus === "loading" || !url}
                      className="bg-neutral-900 hover:bg-neutral-900/90"
                    >
                      {linkStatus === "loading" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LinkIcon className="mr-2 h-4 w-4" />
                      )}
                      <span className="text-base-semibold">
                        {linkStatus === "loading" ? "Scraping..." : "Scrape URLs"}
                      </span>
                    </Button>
                    {linkStatus === "loading" && (
                      <Button onClick={() => setLinkStatus("idle")} variant="outline" size="icon">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {linkStatus === "loading" && (
                    <div className="mt-4 bg-muted/30 p-4 rounded-lg">
                      <Progress value={33} className="w-full h-2" />
                      <p className="text-center mt-2 text-small-medium">Fetching links...</p>
                    </div>
                  )}

                  {linkStatus === "success" && (
                    <div className="mt-4 bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-base-semibold mb-2 flex items-center gap-1">
                        <Database className="h-4 w-4" />
                        Scraped Links ({links.length})
                      </h4>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                        {links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:underline text-small-regular text-neutral-900 mb-1 truncate"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {links.length > 0 && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={fetchProducts}
                        disabled={productStatus === "loading"}
                        className="w-full md:w-auto bg-neutral-900 hover:bg-neutral-900/90"
                        size="lg"
                      >
                        {productStatus === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        <span className="text-base-semibold">
                          {productStatus === "loading" ? "Parsing Products..." : "Parse Products"}
                        </span>
                      </Button>
                      {productStatus === "loading" && (
                        <Button onClick={cancelProductFetch} variant="outline" className="ml-2">
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}

                  {productStatus === "loading" && (
                    <div className="mt-4 bg-muted/30 p-4 rounded-lg">
                      <Progress value={progress} className="w-full h-2" />
                      <p className="text-center mt-2 text-small-medium">Parsing products... ({progress}%)</p>
                    </div>
                  )}
                </div>
              )}

              {/* GitHub Push Section - Only visible after products are parsed */}
              {hasGitHubRepositories && (
                <div className="space-y-4 bg-card p-5 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Github className="h-5 w-5 text-neutral-900" />
                    <h3 className="text-heading4-medium">Host website</h3>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <p className="text-base-regular mb-2">
                        Your account is connected to GitHub. You can push your scraped data to a new repository and host it on Vercel.
                      </p>
                      <GitHubPushButton />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive" className="border-2">
              <XCircle className="h-5 w-5" />
              <AlertTitle className="text-base-semibold">Error</AlertTitle>
              <AlertDescription className="text-small-regular">{error}</AlertDescription>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => setError("")}>
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {productStatus === "success" && (
            <Alert className="border-2 border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-base-semibold text-green-700">Success</AlertTitle>
              <AlertDescription className="text-small-regular text-green-600">
                Successfully parsed {products.length} products.
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setProductStatus("idle")}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {productStatus === "error" && (
            <Alert variant="destructive" className="border-2">
              <XCircle className="h-5 w-5" />
              <AlertTitle className="text-base-semibold">Error</AlertTitle>
              <AlertDescription className="text-small-regular">
                Failed to parse products. Please try again.
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setProductStatus("idle")}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

