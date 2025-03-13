"use client"

import { useState } from "react"
import { Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConnectGitHubButton() {
  const [loading, setLoading] = useState(false)

  const connectGitHub = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/github", { method: "POST" })
      const { url } = (await res.json()) as { url: string }
      window.location.href = url
    } catch (error) {
      console.error("GitHub login failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={connectGitHub}
      className="w-full bg-[#24292f] hover:bg-[#1f2328] text-white"
      size="lg"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Github className="mr-2 h-5 w-5" />
          Connect to GitHub
        </>
      )}
    </Button>
  )
}

