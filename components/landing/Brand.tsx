"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Camera, ShieldCheck, Zap } from "lucide-react"

const brandValues = [
  {
    icon: Camera,
    title: "Якість Зображення",
    description:
      "Наші дрони оснащені передовими камерами та системами стабілізації для забезпечення кришталево чистих фото та відео в будь-яких умовах.",
  },
  {
    icon: ShieldCheck,
    title: "Безпека та Надійність",
    description:
      "Ми дотримуємося найвищих стандартів безпеки у виробництві, гарантуючи надійність та довговічність кожного дрона.",
  },
  {
    icon: Zap,
    title: "Інновації та Технології",
    description:
      "Постійно впроваджуємо передові технології та інновації для вдосконалення характеристик наших дронів та розширення їх можливостей.",
  },
]

export default function Brand() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

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
          <h2 className="text-heading1-bold text-zinc-900 mb-4">Наші Цінності</h2>
          <div className="w-24 h-1 bg-sky-500 mx-auto mb-6" />
          <p className="text-body-medium text-zinc-600 max-w-2xl mx-auto">
            Ми створюємо більше, ніж просто дрони — це зобов&apos;язання до якості, інновацій та технологій, що
            задовольняють потреби найвимогливіших користувачів.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {brandValues.map((value, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <div className="mb-6 p-4 rounded-full bg-sky-500 shadow-md">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-heading3-bold mb-4 text-zinc-900">{value.title}</h3>
              <p className="text-base-regular text-zinc-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

