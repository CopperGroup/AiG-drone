'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ElementList from './ElementList'
import ConnectionLine from './ConnectionLine'
import { Config, Connection } from '@/lib/types/types'
import { generateConfigurator } from '@/lib/xml-parser/generateConfigurator'
import { stages } from '@/components/admin-components/parseXML/XMLParser'
import { useXmlParser } from '@/app/admin/context'
import { connectionCardsDefault } from '@/constants/connection.cards'
import generateSample from '@/lib/xml-parser/generateSample'

type Element = {
  id: string;
  name: string;
}

export const cards = [
  {
    id: 1,
    name: "Start",
    ref: 0,
    leftElements: [
      { id: 'l1-1', name: 'Categories'},
      { id: 'l1-2', name: 'Products'},
    ],
    rightElements: [
        { id: 'r1-1', name: "loading..."}
    ],
  },
  {
    id: 2,
    name: "Categories",
    ref: 1,
    leftElements: [
        { id: "l2-1", name: "Name" },
        { id: 'l2-2', name: "Category ID"},
        { id: 'l2-3', name: "Reference by"}
    ],
    rightElements: [
        { id: 'r2-1', name: "loading..."}
    ],
  },
  {
    id: 3,
    ref: 1,
    name: "Products",
    leftElements: [
        { id: 'l3-1', name: "Available"},
        { id: 'l3-2', name: "Quantity"},
        { id: 'l3-3', name: "Url"},
        { id: 'l3-4', name: "Price"},
        { id: 'l3-5', name: "Discount price"},
        { id: 'l3-6', name: "Images"},
        { id: 'l3-7', name: "Vendor"},
        { id: 'l3-8', name: "Name"},
        { id: 'l3-9', name: "Description"},
        { id: 'l3-10', name: "Params"},
        { id: 'l3-11', name: "Category"},
        { id: 'l3-12', name: "Article number"}
    ],
    rightElements: [
        { id: 'r3-1', name: "loading..."}
    ],
  },
  {
    id: 4,
    name: "Params",
    ref: 3,
    leftElements: [
        { id: 'l4-1', name: "Name"},
        { id: 'l4-2', name: "Value"},
    ],
    rightElements: [
        { id: 'r4-1', name: "loading..."}
    ],
  }
]

const colors = [
  'rgb(239, 68, 68)',   // Red
  'rgb(249, 115, 22)',  // Orange
  'rgb(234, 179, 8)',   // Yellow
  'rgb(34, 197, 94)',   // Green
  'rgb(59, 130, 246)',  // Blue
  'rgb(168, 85, 247)',  // Purple
  'rgb(236, 72, 153)',  // Pink
]

export default function Connector({ setCurrentStage }: { setCurrentStage: React.Dispatch<React.SetStateAction<keyof typeof stages>> }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [tempConnection, setTempConnection] = useState<Connection | null>(null)
  const [usedColors, setUsedColors] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [showAttributes, setShowAttributes] = useState(false)

  const currentCard = cards[currentCardIndex]

  const getRandomColor = () => {
    const availableColors = colors.filter(color => !usedColors.includes(color))
    if (availableColors.length === 0) {
      return colors[Math.floor(Math.random() * colors.length)]
    }
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
    setUsedColors([...usedColors, randomColor])
    return randomColor
  }

  useEffect(() => {
    if(sessionStorage.getItem("tagsMap")) {
        let counter = 1;
        const tagsMap = JSON.parse(sessionStorage.getItem("tagsMap") || '[]');
        const result: { id: string, name: string}[] = [];
      
        Object.keys(tagsMap).forEach(tagName => {
          result.push({
            id: `r1-${counter++}`,
            name: tagName
          });

          tagsMap[tagName].attributes.forEach((attribute: string) => {
              result.push({
                id: `r1-${counter++}-attribute`,
                name: `${tagName}-${attribute}`
              });
            });
        });
        

        cards[0].rightElements = result;
    }
    
  }, [])

  useEffect(() => {
      
      const refCard = cards.filter(card => card.id === currentCard.ref)[0];
      
      const refConnections = JSON.parse(sessionStorage.getItem(`connection-card-${currentCard.ref}`) || '[]') as Connection[];
      // const refConnections = connectionCardsDefault as Connection[];
    if(refCard) {
        const targetElement = refCard.leftElements.find(element => element.name === cards[currentCardIndex].name);

        if(targetElement) {
            const connection = refConnections.find(conn => conn.start === targetElement.id);

            if(connection) {
                const rightElement = refCard.rightElements.find(element => element.id === connection.end);
            
                if(rightElement) {
                    if(sessionStorage.getItem("tagsMap")) {
                        let counter = 1;
                        const tagsMap = JSON.parse(sessionStorage.getItem("tagsMap") || '[]');
                        const result: { id: string, name: string}[] = [];
                      
                        // Iterate over the tagDescendantsMap keys
                        tagsMap[rightElement.name].tags.forEach((tag: string) => {
                            result.push({
                              id: `r${currentCardIndex}-${counter++}`,
                              name: tag
                            });
                        });
            
                        tagsMap[rightElement.name].attributes.forEach((attribute: string) => {
                            result.push({
                              id: `r${currentCardIndex}-${counter++}-attribute`, // ID like 'r3-attribute', 'r4-attribute', etc.
                              name: `${rightElement.name}-${attribute}` // Combine the tag name and attribute name
                            });
                        });
                        tagsMap[rightElement.name].tags.forEach((tagName: string) => {
                            if(tagName !== "Content") {
                                tagsMap[tagName].attributes.forEach((attribute: string) => {
                                    result.push({
                                      id: `r${currentCardIndex}-${counter++}-attribute`, // ID like 'r3-attribute', 'r4-attribute', etc.
                                      name: `${tagName}-${attribute}` // Combine the tag name and attribute name
                                    });
                                });
                            }
                        });
                        cards[currentCardIndex].rightElements = result;
                    }
                }
            }
        }
    }

  }, [currentCardIndex])
  
  useEffect(() => {
    const newConnections = JSON.parse(
      sessionStorage.getItem(`connection-card-${currentCard.id}`) || 
      JSON.stringify(connectionCardsDefault[`connectionCard${currentCard.id}` as keyof typeof connectionCardsDefault])
    );    
  
    if (newConnections.some((connection: Connection) => connection.end.includes('-attribute'))) {
      setShowAttributes(true);
    }

    setConnections(newConnections);
  }, [currentCard]);
  

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const existingLeftConnection = connections.find(conn => conn.start === selectedLeft)

      if (existingLeftConnection) {
        setSelectedLeft(null)
        setSelectedRight(null)
        setTempConnection(null)
        return
      }

      const newConnection = { 
        start: selectedLeft, 
        end: selectedRight, 
        color: getRandomColor(),
      }

    //   console.log(newConnection);

      setConnections(prev => [...prev, newConnection])
      setSelectedLeft(null)
      setSelectedRight(null)
      setTempConnection(null)
      setUpdateTrigger(prev => prev + 1)
    } else if (selectedLeft) {
      setTempConnection({ start: selectedLeft, end: selectedLeft, color: 'rgba(var(--color-primary), 0.5)' })
    } else {
      setTempConnection(null)
    }
  }, [selectedLeft, selectedRight])

  const handleReset = () => {
    setConnections([])
    setSelectedLeft(null)
    setSelectedRight(null)
    setTempConnection(null)
    setUsedColors([])
    setUpdateTrigger(prev => prev + 1)
  }

  const removeConnection = (connection: Connection) => {
    setConnections(prev => prev.filter(conn => conn !== connection))
    setUsedColors(prev => prev.filter(color => color !== connection.color))
    setUpdateTrigger(prev => prev + 1)
  }

  const handlePrevCard = () => {
    setCurrentCardIndex(prev => (prev > 0 ? prev - 1 : cards.length - 1))
    handleReset()
  }

  const handleNextCard = () => {
    sessionStorage.setItem(`connection-card-${currentCard.id}`, JSON.stringify(connections))
    setCurrentCardIndex(prev => (prev < cards.length - 1 ? prev + 1 : 0))
    handleReset()
  }

  const areAllLeftElementsConnected = (leftElements: Element[], connections: Connection[]): boolean => {
    const connectedLeftIds = new Set(connections.map((conn) => conn.start));
    return !leftElements.every((element) => connectedLeftIds.has(element.id));
  }

  const toggleShowAttributes = () => {
    console.log(connections)
    setConnections(prevConnections =>
        // also add card i to be verified
        prevConnections.filter(connection => !connection.end.endsWith('-attribute'))
      );
      setShowAttributes(prev => !prev);
      setUpdateTrigger(prev => prev + 1);
  }

  const { xmlString, setSample } = useXmlParser();
  
  const handleSaveConfiguration = () => {
    sessionStorage.setItem(`connection-card-${currentCard.id}`, JSON.stringify(connections));

    const configurator = generateConfigurator(cards)

    sessionStorage.setItem("configurator", JSON.stringify(configurator))


    if(xmlString && configurator) {
        const sample = generateSample(xmlString, configurator as unknown as Config);

        console.log(sample)

        setSample(JSON.stringify(sample))
    }

    setCurrentStage("preview-sample")
  }
  
  return (
    <div className="w-full space-y-6">
      <Card className="w-full rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-heading2-bold font-bold mb-2">Створіть Конфігурацію Парсингу</h1>
            <p className="text-muted-foreground">
              Connect elements from the left column to the right column. Each left element can only have one connection.
            </p>
          </div>
          <div className="flex justify-end mb-4">
            <Button
              onClick={toggleShowAttributes}
              variant={showAttributes ? "secondary" : "outline"}
              size="sm"
            >
              {showAttributes ? "Hide Attributes" : "Show Attributes"}
            </Button>
          </div>
          <div className="w-full max-h-[500px] overflow-auto p-3">
            <div ref={containerRef} className="relative flex justify-between gap-4 min-h-[300px] min-w-[600px] mb-6">
                <ElementList
                elements={currentCard.leftElements}
                side="left"
                selectedElement={selectedLeft}
                setSelectedElement={setSelectedLeft}
                connections={connections}
                rightElements={currentCard.rightElements}
                removeConnection={removeConnection}
                />
                <ElementList
                elements={showAttributes
                    ? currentCard.rightElements
                    : currentCard.rightElements.filter(element => !element.id.endsWith('-attribute'))}
                side="right"
                selectedElement={selectedRight}
                setSelectedElement={setSelectedRight}
                />
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((connection, index) => (
                    <ConnectionLine
                        key={index}
                        start={connection.start}
                        end={connection.end}
                        containerRef={containerRef}
                        color={connection.color}
                        shouldUpdate={updateTrigger}
                    />
                ))}
                </svg>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <Button onClick={handleReset} variant="outline" className="max-[480px]:hidden">Reset</Button>
            <div className="flex items-center gap-2 max-[480px]:w-full max-[480px]:justify-between">
              <Button onClick={handlePrevCard} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">Card {currentCard.id} of {cards.length}</span>
              <Button onClick={handleNextCard} variant="outline" size="icon" disabled={areAllLeftElementsConnected(currentCard.leftElements, connections)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {currentCardIndex === cards.length - 1 && 
                <Button onClick={handleSaveConfiguration} disabled={areAllLeftElementsConnected(currentCard.leftElements, connections)} className="max-[480px]:hidden">Зберегти</Button>
              }
            </div>
          </div>
          {currentCardIndex === cards.length - 1 && 
            <Button onClick={handleSaveConfiguration} disabled={areAllLeftElementsConnected(currentCard.leftElements, connections)} className="w-full mt-2 min-[481px]:hidden">Зберегти</Button>
          }
          <Button onClick={handleReset} variant="outline" className="w-full mt-2 min-[481px]:hidden">Reset</Button>
        </CardContent>
      </Card>
    </div>
  )
}

