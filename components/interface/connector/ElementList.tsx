import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'

type Element = {
  id: string
  name: string
}

type Connection = {
  start: string
  end: string
  color: string
}

type ElementListProps = {
  elements: Element[]
  side: 'left' | 'right'
  selectedElement: string | null
  setSelectedElement: (id: string | null) => void
  connections?: Connection[]
  rightElements?: Element[]
  removeConnection?: (connection: Connection) => void
}

export default function ElementList({ 
  elements, 
  side, 
  selectedElement, 
  setSelectedElement, 
  connections = [], 
  rightElements = [],
  removeConnection
}: ElementListProps) {
  const getConnectedElements = (elementId: string) => {
    return connections
      .filter(conn => conn.start === elementId)
      .map(conn => {
        const rightElement = rightElements.find(el => el.id === conn.end)
        return { name: rightElement?.name || '', color: conn.color, connection: conn }
      })
  }

  const splitAttributeName = (name: string) => {
    const parts = name.split('-')
    return { label: parts[0], name: parts.slice(1).join('-') }
  }

  return (
    <div className={`flex flex-col gap-4 ${side === 'left' ? 'items-start' : 'items-end'}`}>
      {elements.map((element) => (
        <div key={element.id} className="flex flex-col items-start gap-2">
          <Button
            variant={selectedElement === element.id ? "secondary" : "outline"}
            className={`w-40 ${selectedElement === element.id ? 'ring-1 ring-primary' : ''} relative`}
            onClick={() => setSelectedElement(element.id)}
            data-id={element.id}
          >
            {side === "right" && element.id.endsWith('-attribute') ? (
              <>
                <span className="absolute top-0 right-0 text-[10px] bg-primary text-primary-foreground px-1 rounded">
                  {splitAttributeName(element.name).label}
                </span>
                <span>{splitAttributeName(element.name).name}</span>
              </>
            ) : (
              element.name
            )}
          </Button>
          {side === 'left' && (
            <div className="flex flex-wrap gap-1 ml-2">
              {getConnectedElements(element.id).map((connected, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  style={{backgroundColor: connected.color, color: 'white'}}
                  className="text-subtle-medium flex items-center gap-1 px-2 py-1"
                >
                  {connected.name}
                  {removeConnection && (
                    <X
                      size={12}
                      className="cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => removeConnection(connected.connection)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

