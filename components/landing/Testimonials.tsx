"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Store } from "@/constants/store"

const testimonials = [
  {
    id: 1,
    name: "Олександр Петренко",
    role: "Професійний фотограф",
    avatar: "/assets/t1.jpg",
    rating: 5,
    text: `Дрони від ${Store.name} змінили мій підхід до аерофотозйомки. Якість зображення та стабільність польоту просто вражають. Технічна підтримка завжди готова допомогти з будь-якими питаннями.`,
  },
  {
    id: 2,
    name: "Марія Коваленко",
    role: "Відеоблогер",
    avatar: "/assets/t2.jpg",
    rating: 5,
    text: `Я використовую дрони ${Store.name} для своїх відеоблогів вже понад рік. Батарея тримає довше, ніж у конкурентів, а якість відео на висоті. Рекомендую всім, хто серйозно ставиться до створення контенту.`,
  },
  {
    id: 3,
    name: "Іван Мельник",
    role: "Інженер",
    avatar: "/assets/t3.jpg",
    rating: 4,
    text: `Придбав гоночний дрон і був приємно вражений його швидкістю та маневреністю. Єдине, що можна покращити - це час автономної роботи, але в цілому дуже задоволений покупкою.`,
  },
  {
    id: 4,
    name: "Наталія Шевченко",
    role: "Режисер",
    avatar: "/assets/t4.jpg",
    rating: 5,
    text: `Використовую дрони ${Store.name} для зйомок короткометражних фільмів. Стабілізація зображення та можливість керування камерою під час польоту - це саме те, що потрібно для професійної кінозйомки.`,
  },
  {
    id: 5,
    name: "Сергій Бондаренко",
    role: "Ентузіаст дронів",
    avatar: "/assets/t5.jpg",
    rating: 5,
    text: `Почав з базової моделі, а тепер маю вже три різні дрони від ${Store.name}. Якість збірки, надійність та постійні оновлення програмного забезпечення роблять ці дрони найкращими на ринку.`,
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Adjust visible testimonials based on screen size
  const getVisibleTestimonials = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 1
      return 3
    }
    return 3 // Default for SSR
  }

  const [visibleTestimonials, setVisibleTestimonials] = useState(getVisibleTestimonials())

  // Update visible testimonials on window resize
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      setVisibleTestimonials(getVisibleTestimonials())
    })
  }

  const maxIndex = testimonials.length - visibleTestimonials

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1)
      setActiveIndex(activeIndex - 1)
    }
  }

  const handleNext = () => {
    if (activeIndex < maxIndex) {
      setDirection(1)
      setActiveIndex(activeIndex + 1)
    }
  }

  return (
    <motion.section
      ref={sectionRef}
      className="w-full py-24 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-heading1-bold text-zinc-900 mb-4">Відгуки наших клієнтів</h2>
          <div className="w-24 h-1 bg-sky-500 mx-auto mb-6" />
          <p className="text-body-medium text-zinc-600 max-w-2xl mx-auto">
            Дізнайтеся, що говорять наші клієнти про досвід використання дронів {Store.name} та нашу підтримку
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:flex justify-between absolute top-1/2 -translate-y-1/2 w-full z-10 px-4">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md transition-all",
                activeIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-50",
              )}
              aria-label="Попередній відгук"
            >
              <ChevronLeft className="w-5 h-5 text-sky-500" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === maxIndex}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md transition-all",
                activeIndex === maxIndex ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-50",
              )}
              aria-label="Наступний відгук"
            >
              <ChevronRight className="w-5 h-5 text-sky-500" />
            </button>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out py-1"
              style={{ transform: `translateX(-${activeIndex * (100 / visibleTestimonials)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className="w-full md:w-1/3 flex-shrink-0 px-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg?height=48&width=48"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base-semibold text-zinc-900">{testimonial.name}</h3>
                        <p className="text-small-medium text-zinc-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-base-regular text-zinc-700 flex-grow">{testimonial.text}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-small-medium text-sky-500">Підтверджений покупець</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 md:hidden">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md mx-2",
                activeIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-50",
              )}
              aria-label="Попередній відгук"
            >
              <ChevronLeft className="w-5 h-5 text-sky-500" />
            </button>
            {/* Pagination indicators */}
            <div className="flex items-center mx-2">
              {Array.from({ length: testimonials.length - (visibleTestimonials - 1) }).map((_, index) => (
                <div
                  key={index}
                  className={cn("w-2 h-2 mx-1 rounded-full", activeIndex === index ? "bg-sky-500" : "bg-gray-300")}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={activeIndex === maxIndex}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md mx-2",
                activeIndex === maxIndex ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-50",
              )}
              aria-label="Наступний відгук"
            >
              <ChevronRight className="w-5 h-5 text-sky-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

