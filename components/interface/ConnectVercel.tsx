"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, } from "lucide-react"
import { IoLogoVercel } from "react-icons/io5";

const ConnectVercelButton = () => {
  const [loading, setLoading] = useState(false)
  const clientSlug = "cp-commerse" // Replace with your Vercel integration slug.

  const handleConnect = async () => {
    try {
      setLoading(true)

      // Generate a CSRF token using the browser's crypto API
      const array = new Uint8Array(16)
      window.crypto.getRandomValues(array)
      const state = Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")

      // Store the CSRF token in the session or cookies for server-side validation
      document.cookie = `latestCSRFToken=${state}; path=/; SameSite=Lax;`

      console.log("Generated CSRF token:", state)

      // Redirect the user to Vercel's OAuth URL
      const link = `https://vercel.com/integrations/${clientSlug}/new?state=${state}&scope=read write`
      window.location.assign(link)
    } catch (error) {
      console.error("Error while redirecting to Vercel:", error)
    }
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="w-full flex items-center gap-2"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <IoLogoVercel className="h-4 w-4" />}
      {loading ? "Connecting..." : "Connect to Vercel"}
    </Button>
  )
}

export default ConnectVercelButton

