"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const categories = [
  { name: "Фото дрони", image: "/assets/1.jpg", href: "/catalog?category=photo" },
  { name: "Гоночні дрони", image: "/assets/2.jpg", href: "/catalog?category=racing" },
  { name: "Аксесуари", image: "/assets/3.jpg", href: "/catalog?category=accessories" },
]

export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.section
      ref={sectionRef}
      className="w-full py-24 bg-white"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-heading1-bold text-zinc-900 mb-4">Досліджуйте наші категорії</h2>
          <div className="w-24 h-1 bg-sky-500 mx-auto mb-6" />
          <p className="text-body-semibold text-zinc-600 max-w-2xl mx-auto">
            Відкрийте для себе наш ретельно підібраний асортимент високотехнологічних дронів та аксесуарів для будь-яких
            потреб
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group"
            >
              <Link href={category.href} className="block">
                <div className="relative aspect-[1/1] overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={category.image || "/placeholder.svg?height=600&width=480"}
                    alt={category.name}
                    width={480}
                    height={600}
                    className="transition-transform duration-700 ease-in-out group-hover:scale-110 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-900/10 to-sky-700/5 transition-opacity duration-300 group-hover:from-sky-900/80 group-hover:to-sky-700/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <h3 className="text-heading3-bold text-white text-center mb-4 transform transition-transform duration-300 group-hover:translate-y-[-10px] drop-shadow-md">
                      {category.name}
                    </h3>
                    <motion.span
                      className="text-small-semibold uppercase tracking-wider text-white border border-white px-4 py-2 hover:bg-white hover:text-sky-700 transition-colors duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={hoveredIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      Переглянути
                    </motion.span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link
            href="/catalog"
            className="inline-block text-base-semibold text-sky-600 hover:text-sky-800 transition-colors duration-300 relative group"
          >
            <span className="relative z-10">Всі категорії</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 transform origin-left transition-all duration-300 group-hover:scale-x-100 scale-x-0"></span>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

