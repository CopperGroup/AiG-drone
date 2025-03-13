"use client"
import { CheckCircle, Github, BellIcon as Vercel } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ConnectionStatusProps {
  githubConnected: boolean
  vercelConnected: boolean
}

export default function ConnectionStatus({ githubConnected, vercelConnected }: ConnectionStatusProps) {
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      <Badge
        variant={githubConnected ? "default" : "outline"}
        className={`flex items-center gap-1 ${githubConnected ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
      >
        <Github className="h-3 w-3" />
        GitHub {githubConnected ? "Connected" : "Not Connected"}
        {githubConnected && <CheckCircle className="h-3 w-3 text-green-600 ml-1" />}
      </Badge>

      <Badge
        variant={vercelConnected ? "default" : "outline"}
        className={`flex items-center gap-1 ${vercelConnected ? "bg-sky-100 text-sky-800 hover:bg-sky-100" : ""}`}
      >
        <Vercel className="h-3 w-3" />
        Vercel {vercelConnected ? "Connected" : "Not Connected"}
        {vercelConnected && <CheckCircle className="h-3 w-3 text-sky-600 ml-1" />}
      </Badge>
    </div>
  )
}

