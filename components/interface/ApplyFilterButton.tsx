"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from 'lucide-react'

interface ClearFilterButtonProps {
  onClick?: () => void; // Optional onClick prop
}

export default function ApplyFilterButton({ onClick }: ClearFilterButtonProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClear = () => {
    setIsClicked(true);

    if (onClick) {
      onClick();
    }

    setTimeout(() => setIsClicked(false), 200);
  }

  return (
    <motion.button
      className="w-full relative overflow-hidden bg-neutral-900 text-white font-semibold py-2 px-4 rounded-full border border-gray-700 shadow-sm"
      whileHover="hover"
      whileTap="tap"
      onClick={handleClear}
      onAnimationComplete={() => setIsClicked(false)}
      initial="initial"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-800"
        initial={{ opacity: 0 }}
        variants={{
          hover: { opacity: 1 },
          tap: { opacity: 1, scale: 0.98 },
        }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
      />
      
      <motion.div 
        className="relative flex items-center space-x-2"
        variants={{
          initial: { color: "#ffffff" },
          hover: { color: "#f3f4f6" },
          tap: { scale: 0.95 },
        }}
      >
        <Plus className="w-4 h-4" />
        <span>Застосувати</span>
      </motion.div>

      <motion.div
        className="absolute inset-0 border border-transparent rounded-full"
        initial={{ opacity: 0 }}
        variants={{
          hover: { 
            opacity: 1,
            scale: 1.05,
            transition: { duration: 0.2 }
          },
          tap: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.1 }
          }
        }}
        style={{ boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)" }}
      />
    </motion.button>
  )
}
