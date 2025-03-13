"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send, Instagram, Copy, Check } from "lucide-react"
import { FaTelegram, FaViber } from "react-icons/fa"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ContactButton() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const fullText = "Мій контакт"

  // Typing animation effect
  useEffect(() => {
    // Wait for page to load before starting animation
    const timer = setTimeout(() => {
      setShowMessage(true)
      let i = 0
      const typeInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypingText(fullText.substring(0, i + 1))
          i++
        } else {
          clearInterval(typeInterval)
        }
      }, 100)

      return () => clearInterval(typeInterval)
    }, 1500) // Delay before starting animation

    return () => clearTimeout(timer)
  }, [])

  const contactMethods = [
    {
      name: "Telegram",
      username: "@build_differen",
      phone: "+380 63 503 39 29",
      icon: <FaTelegram className="h-5 w-5 text-[#0088cc]" />,
      color: "bg-[#0088cc]/10",
      hoverColor: "hover:bg-[#0088cc]/20",
      textColor: "text-[#0088cc]",
      action: "link",
    },
    {
      name: "Viber",
      phone: "+48 794 779 170",
      icon: <FaViber className="h-5 w-5 text-[#7360f2]" />,
      color: "bg-[#7360f2]/10",
      hoverColor: "hover:bg-[#7360f2]/20",
      textColor: "text-[#7360f2]",
      action: "copy",
    },
    {
      name: "Instagram",
      username: "@tymyevhen",
      icon: <Instagram className="h-5 w-5 text-[#E1306C]" />,
      color: "bg-[#E1306C]/10",
      hoverColor: "hover:bg-[#E1306C]/20",
      textColor: "text-[#E1306C]",
      action: "link",
    },
  ]

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleAction = (method: any, index: number) => {
    if (method.action === "copy" && method.phone) {
      handleCopy(method.phone, index)
    } else {
      let url = ""
      if (method.name === "Telegram") {
        url = `https://t.me/${method.username?.replace("@", "")}`
      } else if (method.name === "Instagram") {
        url = `https://instagram.com/${method.username?.replace("@", "")}`
      }
      window.open(url, "_blank")
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative mb-3"
      >
        {/* Animated notification bubble */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -top-4 -right-2 bg-sky-500 text-white text-small-medium px-2 py-0.5 rounded-full whitespace-nowrap"
            >
              {typingText}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsContactOpen(true)}
          className="size-16 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 transition-all duration-300 ease-in-out hover:bg-sky-50 max-sm:size-14"
        >
          <MessageCircle className="w-6 h-6 text-sky-500 max-sm:w-5 max-sm:h-5" />
        </Button>
      </motion.div>

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-md rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-heading3-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-sky-500" />
              Мої контакти
            </DialogTitle>
            <DialogDescription className="text-base-regular">Оберіть зручний для вас спосіб зв&apos;язку</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <AnimatePresence>
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${method.color} ${method.hoverColor} transition-all duration-300`}
                >
                  <div className="flex items-center">
                    <div className="mr-3 bg-white p-2 rounded-full shadow-sm">{method.icon}</div>
                    <div className="flex-1">
                      <h3 className={`text-base-semibold ${method.textColor}`}>{method.name}</h3>
                      {method.username && <p className="text-small-medium text-gray-700">{method.username}</p>}
                      {method.phone && <p className="text-small-medium text-gray-700">{method.phone}</p>}
                    </div>
                    <Button
                      size="sm"
                      className={`${method.textColor} bg-white border border-gray-200 hover:bg-white/80`}
                      onClick={() => handleAction(method, index)}
                    >
                      {method.action === "copy" ? (
                        <>
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copiedIndex === index ? "Скопійовано" : "Копіювати"}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Зв&apos;язатись
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* <div className="mt-4 text-center text-small-medium text-gray-500">
            Дякую за ваше звернення! Я відповім якнайшвидше.
          </div> */}
        </DialogContent>
      </Dialog>
    </>
  )
}

