'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AnimatedNumberProps {
  number: number
  duration: number
  initialValue?: number
  decimals?: number
  easingName?: keyof typeof easingFunctions
}

const easingFunctions = {
  easeOutExpo: (t: number): number => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t),
  easeOutQuint: (t: number): number => 1 - Math.pow(1 - t, 5),
  easeOutCirc: (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2)),
  linear: (t: number): number => t,
}

export default function AnimatedNumber({ 
  number, 
  duration, 
  initialValue = 0, 
  decimals = 0,
  easingName = 'easeOutExpo'
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(initialValue)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef<number>(initialValue)

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animateNumber)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [number, duration, easingName])

  const animateNumber = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
    if (progress < 1) {
      const easedProgress = easingFunctions[easingName](progress)
      const nextValue = startValueRef.current + (number - startValueRef.current) * easedProgress
      setDisplayValue(nextValue)
      animationRef.current = requestAnimationFrame(animateNumber)
    } else {
      setDisplayValue(number)
    }
  }

  return (
    <span className="tabular-nums">
      {displayValue.toFixed(decimals)}
    </span>
  )
}

