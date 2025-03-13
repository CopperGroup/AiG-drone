"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Store } from "@/constants/store"

const features = [
  { title: "Інновації", description: "Використання найновіших технологій та інженерних рішень" },
  { title: "Якість", description: "Надійні компоненти та ретельне тестування кожного дрона" },
  { title: "Підтримка", description: "Професійна технічна підтримка та навчання користувачів" },
]

export default function AboutUs() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  return (
    <motion.section
      ref={sectionRef}
      className="w-full py-24 bg-white"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-heading1-bold text-zinc-900">Про {Store.name}</h2>
              <p className="text-body-medium text-zinc-700">
                Ми спеціалізуємося на високотехнологічних дронах та аксесуарах, поєднуючи інновації, надійність та
                продуктивність. Наша продукція створена для професіоналів та ентузіастів, які цінують якість та передові
                технології в кожному польоті.
              </p>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-px h-6 bg-sky-500 mt-2" />
                    <div>
                      <h3 className="text-base-semibold text-zinc-900">{feature.title}</h3>
                      <p className="text-base-regular text-zinc-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <Button
                  asChild
                  className="bg-sky-500 text-white hover:bg-sky-600 text-small-semibold transition-colors px-6 py-3"
                >
                  <a href="/catalog">Переглянути каталог</a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-xl">
                <Image
                  src="/assets/about-us.jpg"
                  alt="Високотехнологічний дрон"
                  width={600}
                  height={800}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 border border-sky-500 rounded-lg flex items-center justify-center p-4 bg-white shadow-lg">
                <p className="text-center text-base-semibold text-zinc-800">
                  Інновації та надійність у кожному польоті
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

