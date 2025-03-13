"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface AiGenerateButtonProps {
  showPopUp?: boolean
}

export function AiGenerateButton({ showPopUp = false }: AiGenerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    if (showPopUp) {
      setIsOpen(true)
    }
    // Simulate AI generation process
    await new Promise((resolve) => setTimeout(resolve, 5000))
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-pink-500 font-semibold py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg border-2 border-blue-400 hover:border-pink-500"
      >
        {isLoading && !showPopUp ? (
          <span className="animate-pulse">
            <Star className="mr-2 h-4 w-4 inline-block fill-current" />
            <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-pink-500 bg-clip-text text-transparent">
              Generating...
            </span>
          </span>
        ) : (
          <>
            <Star className="mr-2 h-4 w-4 inline-block fill-current" />
            <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-pink-500 bg-clip-text text-transparent">
              Generate with AI
            </span>
          </>
        )}
      </Button>

      {showPopUp && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <div className="flex flex-col items-center justify-center h-40">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-lg font-semibold text-blue-600">Generating with AI...</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

