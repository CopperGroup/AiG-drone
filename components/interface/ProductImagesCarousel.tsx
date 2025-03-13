"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Store } from "@/constants/store"

type ProductCarouselProps = {
  images: string[]
}

export default function ProductImagesCarousel({ images }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(Store.default_image.product_page)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }
  }

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <Image
              src={image || "/placeholder.svg"}
              alt={`Product image ${index + 1}`}
              width={800}
              height={800}
              className="w-full h-auto object-contain aspect-square"
              loading={index === 0 ? "eager" : "lazy"}
              priority={index === 0}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-blue w-4" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-0 text-gray-800 hover:text-blue transition-colors duration-300"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-small-medium">Prev</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-0 text-gray-800 hover:text-blue transition-colors duration-300"
          onClick={nextSlide}
        >
          <span className="text-small-medium">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

