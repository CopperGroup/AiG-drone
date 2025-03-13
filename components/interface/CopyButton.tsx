'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconOnlyAdminCopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className }: IconOnlyAdminCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(`size-10 inline-flex items-center justify-center p-2 rounded-md text-gray-700 bg-neutral-100  hover:bg-neutral-200 focus:outline-none transition-colors duration-200`, className)}
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
      type="button"
    >
      {isCopied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  )
}

