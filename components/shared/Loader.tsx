"use client";

import { motion } from "framer-motion"

const Loader = () => {
  return (
    <div className="w-48 flex items-center justify-center overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 200 10">
        <motion.path
            d="M5 5 L195 5"
            stroke="#1a1a1a"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            }}
        />
        <motion.circle
            cx="0"
            cy="5"
            r="4"
            fill="#1a1a1a"
            initial={{ scale: 0 }}
            animate={{
            scale: [0, 1, 0],
            x: [5, 195, 5],
            }}
            transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            }}
        />
        </svg>
    </div>
  )
}

export default Loader