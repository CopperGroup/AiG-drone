'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const generateRandomPoints = (count: number, radius: number) => {
  const points = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    points.push({ x, y })
  }
  return points
}

export default function AdminLoading() {
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => (prev < 100 ? prev + 1 : 0))
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const outerCirclePoints = generateRandomPoints(12, 90)
  const innerCirclePoints = generateRandomPoints(8, 60)

  return (
    <div className="flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <motion.svg
          width="300"
          height="300"
          viewBox="-150 -150 300 300"
          initial="hidden"
          animate="visible"
          aria-label="High-tech loading visualization"
        >
          {/* Outer rotating circle */}
          <motion.circle
            cx="0"
            cy="0"
            r="120"
            stroke="rgba(37,99,235,0.9)"
            strokeWidth="1"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner rotating circle */}
          <motion.circle
            cx="0"
            cy="0"
            r="90"
            stroke="rgba(37,99,235,0.6)"
            strokeWidth="1"
            fill="none"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          {/* Data points on outer circle */}
          {outerCirclePoints.map((point, index) => (
            <motion.circle
              key={`outer-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgba(37,99,235,0.9)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}

          {/* Data points on inner circle */}
          {innerCirclePoints.map((point, index) => (
            <motion.circle
              key={`inner-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="rgba(37,99,235,0.6)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            />
          ))}

          {/* Central hexagon */}
          {/* <motion.path
            d="M0,-30 L26,-15 L26,15 L0,30 L-26,15 L-26,-15 Z"
            fill="none"
            stroke="rgba(37,99,235,0.9)"
            strokeWidth="2"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{
              scale: { duration: 1, ease: "easeOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
          /> */}

          {/* Loading progress circle */}
          <motion.circle
            cx="0"
            cy="0"
            r="40"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeDasharray="251.2"
            strokeDashoffset="251.2"
            animate={{ strokeDashoffset: 251.2 - (251.2 * loadingProgress) / 100 }}
          />

          {/* Loading percentage text */}
          <text
            x="0"
            y="5"
            textAnchor="middle"
            fill="#2563eb"
            fontSize="16"
            fontWeight="bold"
          >
            {`${loadingProgress}%`}
          </text>
        </motion.svg>
        <motion.p
          className="mt-4 text-xl font-semibold text-black dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Initializing Admin Interface
        </motion.p>
      </div>
    </div>
  )
}

