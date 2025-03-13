"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/app/(root)/context"
import CartPage from "./CartPage"
import { ShoppingBag } from "lucide-react"
import ContactButton from "../interface/ContactButton"

export default function StickyCart() {
  const [isOpened, setIsOpened] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { cartData } = useAppContext()
  const cartButtonRef = useRef<HTMLDivElement>(null)
  const prevCartLength = useRef(cartData.length)

  const toggleCart = () => {
    setIsOpened((prev) => !prev)
  }

  useEffect(() => {
    document.body.style.overflow = isOpened ? "hidden" : "auto"

    if (cartButtonRef.current) {
      cartButtonRef.current.style.display = isOpened ? "none" : "block"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpened])

  useEffect(() => {
    if (cartData.length > prevCartLength.current) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    }
    prevCartLength.current = cartData.length
  }, [cartData])

  return (
    <>
      <motion.div
        ref={cartButtonRef}
        className="fixed bottom-8 right-8 z-[100] flex flex-col max-sm:bottom-4 max-sm:right-4"
        animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Contact Button */}
        <ContactButton />

        {/* Cart Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            onClick={toggleCart}
            className="size-16 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 transition-all duration-300 ease-in-out hover:bg-white max-sm:size-14"
          >
            <AnimatePresence>
              {cartData.length > 0 && (
                <motion.div
                  key="cart-count"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-0 right-0 bg-sky-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                >
                  {cartData.length}
                </motion.div>
              )}
            </AnimatePresence>
            <ShoppingBag className="w-8 h-8 text-black drop-shadow-sm max-sm:w-6 max-sm:h-6" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Cart Slide-in Panel */}
      <AnimatePresence>
        {isOpened && (
          <motion.div
            className="fixed h-full bg-white max-w-[400px] w-full z-50 top-0 right-0 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <CartPage setIsOpened={setIsOpened} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

