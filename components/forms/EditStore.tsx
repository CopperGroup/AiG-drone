"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Save, Loader2, Store, Globe, DollarSign, CurrencyIcon, ImageIcon, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the schema for validation
const storeConfigSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  currency: z.string().min(1, "Currency code is required"),
  currency_sign: z.string().min(1, "Currency sign is required"),
  domain: z.string().url("Must be a valid URL"),
  database: z.string().min(1, "Database name is required"),
  default_image: z.object({
    product_card: z.number().int().min(0),
    product_page: z.number().int().min(0),
    checkout_page: z.number().int().min(0),
  }),
})

type StoreConfigFormValues = z.infer<typeof storeConfigSchema>

export default function StoreConfigEditor({
  initialConfig,
  onUpdate,
  onSave,
  existingRepos,
}: {
  initialConfig: StoreConfigFormValues
  onUpdate: (config: StoreConfigFormValues) => void
  onSave: (config: StoreConfigFormValues) => Promise<void>
  existingRepos: string[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [nameExists, setNameExists] = useState(false)

  const form = useForm<StoreConfigFormValues>({
    resolver: zodResolver(storeConfigSchema),
    defaultValues: initialConfig,
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      const hasChanged = value.name !== initialConfig.name
      setHasChanges(hasChanged)
      if (hasChanged) {
        onUpdate(value as StoreConfigFormValues)
      }

      console.log(existingRepos)
      setNameExists(existingRepos.includes(value.name || ""))
    })
    return () => subscription.unsubscribe()
  }, [form, initialConfig, onUpdate, existingRepos])

  const onSubmit = async (data: StoreConfigFormValues) => {
    if (nameExists) {
      toast.error("A repository with this name already exists. Please choose a different name.")
      return
    }

    setIsLoading(true)
    try {
      await onSave(data)
      toast.success("Store configuration updated successfully")
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating store config:", error)
      toast.error("Failed to update store configuration")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    form.reset(initialConfig)
    setHasChanges(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Store Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="bg-muted/20 p-3 rounded-md">
                <FormLabel className="text-base-semibold flex items-center gap-2">
                  <Store className="h-4 w-4 text-neutral-900" />
                  Store Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="My Store" {...field} className="text-base-regular h-10" />
                </FormControl>
                <FormDescription className="text-[12px] text-zinc-500">
                  The name of your store
                </FormDescription>
                {nameExists && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Name already exists</AlertTitle>
                    <AlertDescription>
                      A repository with this name already exists. Please choose a different name.
                    </AlertDescription>
                  </Alert>
                )}
                <FormMessage className="text-[14px] text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem className="bg-muted/20 p-3 rounded-md">
                <FormLabel className="text-base-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-neutral-900" />
                  Store Domain
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} className="text-base-regular h-10" />
                </FormControl>
                <FormDescription className="text-[12px] text-zinc-500">Your store&apos;s URL</FormDescription>
                <FormMessage className="text-[14px] text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="bg-muted/20 p-3 rounded-md">
                <FormLabel className="text-base-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-neutral-900" />
                  Currency Code
                </FormLabel>
                <FormControl>
                  <Input placeholder="USD" {...field} className="text-base-regular h-10" />
                </FormControl>
                <FormDescription className="text-[12px] text-zinc-500">
                  3-letter currency code
                </FormDescription>
                <FormMessage className="text-[14px] text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency_sign"
            render={({ field }) => (
              <FormItem className="bg-muted/20 p-3 rounded-md">
                <FormLabel className="text-base-semibold flex items-center gap-2">
                  <CurrencyIcon className="h-4 w-4 text-neutral-900" />
                  Currency Symbol
                </FormLabel>
                <FormControl>
                  <Input placeholder="$" {...field} className="text-base-regular h-10" />
                </FormControl>
                <FormDescription className="text-[12px] text-zinc-500">
                  Currency symbol (e.g., $, €, ₴)
                </FormDescription>
                <FormMessage className="text-[14px] text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Image Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-neutral-900" />
            <h4 className="text-base-semibold">Default Image Indexes</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="default_image.product_card"
              render={({ field }) => (
                <FormItem className="bg-muted/20 p-3 rounded-md">
                  <FormLabel className="text-small-semibold">
                    Product Card
                    <Badge variant="outline" className="ml-2 text-tiny-medium">
                      Index
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      className="text-base-regular h-9"
                    />
                  </FormControl>
                  <FormMessage className="text-[14px] text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_image.product_page"
              render={({ field }) => (
                <FormItem className="bg-muted/20 p-3 rounded-md">
                  <FormLabel className="text-small-semibold">
                    Product Page
                    <Badge variant="outline" className="ml-2 text-tiny-medium">
                      Index
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      className="text-base-regular h-9"
                    />
                  </FormControl>
                  <FormMessage className="text-[14px] text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_image.checkout_page"
              render={({ field }) => (
                <FormItem className="bg-muted/20 p-3 rounded-md">
                  <FormLabel className="text-small-semibold">
                    Checkout Page
                    <Badge variant="outline" className="ml-2 text-tiny-medium">
                      Index
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      className="text-base-regular h-9"
                    />
                  </FormControl>
                  <FormMessage className="text-[14px] text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
              className="flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-base-semibold">Reset</span>
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !hasChanges || nameExists}
            className={`${hasChanges && !nameExists ? "bg-neutral-900 hover:bg-neutral-900/90" : "bg-muted"} px-6`}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-base-semibold">Saving...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                <span className="text-base-semibold">Save Configuration</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

