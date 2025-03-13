import React, { useEffect, useState } from 'react'

type ConnectionLineProps = {
  start: string
  end: string
  containerRef: React.RefObject<HTMLDivElement>
  isTemp?: boolean
  color: string
  shouldUpdate: number
}

export default function ConnectionLine({ start, end, containerRef, isTemp = false, color, shouldUpdate}: ConnectionLineProps) {
  const [path, setPath] = useState('')
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const startElement = container.querySelector(`[data-id="${start}"]`)
    const endElement = container.querySelector(`[data-id="${end}"]`)

    if (startElement && endElement) {
      const startRect = startElement.getBoundingClientRect()
      const endRect = endElement.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const startX = startRect.right - containerRect.left
      const startY = startRect.top + startRect.height / 2 - containerRect.top
      const endX = endRect.left - containerRect.left
      const endY = endRect.top + endRect.height / 2 - containerRect.top

      setStartPoint({ x: startX, y: startY })
      setEndPoint({ x: endX, y: endY })

      const midX = (startX + endX) / 2
      
      setPath(`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`)
    }
  }, [start, end, containerRef, shouldUpdate])

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={isTemp ? "5,5" : "none"}
      />

      {!isTemp && (
        <>
            <circle cx={startPoint.x} cy={startPoint.y} r="4" fill={color} />
            <circle cx={endPoint.x} cy={endPoint.y} r="4" fill={color} />
        </>
      )}
    </g>
  )
}

