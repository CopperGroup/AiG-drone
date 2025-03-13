"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Rocket, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function GitHubPushButton() {
  const [loading, setLoading] = useState(false)
  const [repoUrl, setRepoUrl] = useState<string | null>(null)

  const pushToGitHub = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/github/push", { method: "POST" })
      const data = await res.json()

      if (res.ok && data.repoUrl) {
        setRepoUrl(data.repoUrl)
        toast.success("Repository created successfully!", {
          description: (
            <a
              href={data.projectInfo.projectLink}
              target="_blank"
              className="text-cyan-400 underline flex items-center gap-1 mt-1"
              rel="noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Visit website</span>
            </a>
          ),
        })
      } else {
        throw new Error(data.error || "Failed to create repository")
      }
    } catch (error: any) {
      console.error("Error pushing to GitHub:", error)
      toast.error("GitHub Repository Error", {
        description: error.message || "Something went wrong while creating the repository",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="relative overflow-hidden rounded-lg group">
        <Button
          onClick={pushToGitHub}
          className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-cyan-400 transition-all duration-300 transform group-hover:scale-105 shadow-lg border border-cyan-800 group-hover:border-cyan-400"
          size="lg"
          disabled={loading}
        >
          <span className="relative flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Launch Project
              </>
            )}
          </span>
        </Button>
      </div>

      {repoUrl && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-md border border-cyan-800 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-cyan-900 text-cyan-400 border-cyan-700">
              Success
            </Badge>
            <span className="text-sm font-medium text-cyan-400">Project launched successfully</span>
          </div>
          <a
            href={repoUrl}
            target="_blank"
            className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors duration-200"
            rel="noreferrer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View</span>
          </a>
        </div>
      )}
    </div>
  )
}

