"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { Store } from "@/constants/store"

const milestones = [
  { year: 2015, event: `Заснування ${Store.name}` },
  { year: 2017, event: "Запуск першої лінійки фотодронів" },
  { year: 2019, event: "Відкриття першого спеціалізованого магазину" },
  { year: 2021, event: "Розробка інноваційної системи стабілізації камери" },
  { year: 2023, event: "Вихід на міжнародний ринок та запуск гоночної серії дронів" },
]

export default function History() {
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
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-heading1-bold text-zinc-900 mb-4">Наша Історія Інновацій</h2>
          <div className="w-24 h-1 bg-sky-500 mx-auto mb-6" />
          <p className="text-body-medium text-zinc-600 max-w-2xl mx-auto">
            Шлях розвитку та інновацій, який привів нас до лідерства на ринку дронів
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <span className="text-heading4-medium">{milestone.year}</span>
                </div>
                <div className="pt-4">
                  <p className="text-base-semibold text-sky-600">{milestone.event}</p>
                  <div className="h-px w-full bg-gray-200 mt-4 hidden md:block"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Image
              src="/assets/history-image.jpg"
              alt={`${Store.name} через роки інновацій`}
              width={800}
              height={600}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <p className="text-base-semibold">Від стартапу до лідера ринку дронів</p>
                <p className="text-small-medium mt-2">Наша місія — робити інноваційні технології доступними для всіх</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

