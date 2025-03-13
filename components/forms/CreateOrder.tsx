"use client"

import type * as z from "zod"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { OrderValidation } from "@/lib/validations/order"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAppContext } from "@/app/(root)/context"
import { createOrder } from "@/lib/actions/order.actions"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { CheckCircle, Truck, CreditCard, MessageSquare, ShoppingCart, Phone, Package } from "lucide-react"
import Confetti from "react-confetti"
import { trackFacebookEvent } from "@/helpers/pixel"
import { Store } from "@/constants/store"

type CartProduct = {
  id: string
  name: string
  image: string
  price: number
  priceWithoutDiscount: number
  quantity: number
}

const CreateOrder = ({ userId, email }: { userId: string; email: string }) => {
  const router = useRouter()
  const { cartData, setCartData } = useAppContext()
  const [isOrderCreated, setIsOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showThankYou, setShowThankYou] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [position, setPosition] = useState<"fixed" | "relative">("fixed")

  const priceToPay = cartData.reduce(
    (acc: number, data: { price: number; quantity: number }) => acc + data.price * data.quantity,
    0,
  )

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const form = useForm<z.infer<typeof OrderValidation>>({
    resolver: zodResolver(OrderValidation),
    defaultValues: {
      email: email,
    },
  })

  const products = cartData.map((product: CartProduct) => ({
    product: product.id,
    amount: product.quantity,
  }))

  const onSubmit = async (values: z.infer<typeof OrderValidation>) => {
    const createdOrder = await createOrder(
      {
        products: products,
        userId: userId,
        value: priceToPay,
        name: values.name,
        surname: values.surname,
        phoneNumber: values.phoneNumber,
        email: values.email,
        paymentType: values.paymentType,
        deliveryMethod: values.deliveryMethod,
        city: values.city,
        adress: values.adress,
        postalCode: values.postalCode,
        comment: values.comment,
      },
      "json",
    )

    const order = JSON.parse(createdOrder)

    trackFacebookEvent("Purchase", {
      value: priceToPay,
      currency: "UAH",
      content_ids: cartData.map((product: CartProduct) => product.id),
    })

    setCartData([])
    setIsOrderCreated(true)
    setOrderId(order.id)
    setTimeout(() => setShowThankYou(true), 3000)
    setTimeout(() => setShowConfetti(true), 3500)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
      {isOrderCreated ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full flex flex-col items-center max-[425px]:pt-24"
        >
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 pointer-events-none"
              >
                <Confetti
                  width={windowSize.width}
                  height={windowSize.height}
                  recycle={false}
                  numberOfPieces={200}
                  gravity={0.1}
                  colors={["#f59e0b", "#fbbf24", "#fcd34d", "#fef3c7"]}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 20, 1] }}
            transition={{
              duration: 1,
              times: [0, 0.7, 1],
              ease: "easeInOut",
            }}
            style={{
              position: position,
              left: position === "fixed" ? "50%" : "0%",
              translateX: position === "fixed" ? "-50%" : "0%",
              translateY: position === "fixed" ? "-50%" : "0%",
            }}
            onAnimationComplete={() => setPosition("relative")}
            className="bg-sky-50 rounded-full p-8 mb-8 overflow-hidden"
          >
            <motion.div
              initial={{ y: -200, rotate: 0 }}
              animate={{ y: 0, rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{
                y: { delay: 1.2, duration: 0.3 },
                rotate: { delay: 1.5, duration: 0.5, ease: "easeInOut" },
              }}
            >
              <Package className="w-16 h-16 text-sky-500" />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="text-center mt-7"
          >
            <motion.h1
              className="text-heading1-bold mb-6 text-zinc-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
            >
              Замовлення створено успішно!
            </motion.h1>
            <motion.p
              className="text-body-medium mb-8 max-w-md mx-auto text-zinc-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7 }}
            >
              Дякуємо за ваше замовлення. Наш менеджер зв&apos;яжеться з вами найближчим часом.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 }}
            >
              <Button
                onClick={() => router.push(`/myOrders/${orderId}`)}
                className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg text-base-medium text-white transition duration-300 w-full sm:w-auto"
              >
                {windowSize.width > 380 ? "Переглянути деталі замовлення" : "Переглянути деталі"}
              </Button>
              <div className="flex flex-1 justify-center items-center text-zinc-600 bg-white px-4 py-2 rounded-lg shadow-md max-[640px]:w-full border border-zinc-100">
                <Phone className="w-5 h-5 mr-2 text-sky-500" />
                <span className="text-base-medium">Очікуйте на дзвінок</span>
              </div>
            </motion.div>
            <AnimatePresence>
              {showThankYou && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="mt-12 text-body-semibold text-sky-500"
                >
                  Дякуємо за покупку!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <h1 className="w-full text-heading1-bold mb-10 text-center text-zinc-800">Оформлення замовлення</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
                    <h2 className="text-heading3-bold mb-6 text-zinc-800 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-sky-500" />
                      Особисті дані
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Ім&apos;я</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="surname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Прізвище</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Номер телефону</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Email</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
                    <h2 className="text-heading3-bold mb-6 text-zinc-800 flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-sky-500" />
                      Доставка
                    </h2>
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel className="text-base-medium text-zinc-700">Спосіб доставки</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg border-zinc-200">
                                <SelectValue placeholder="Виберіть спосіб доставки" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Нова пошта (У відділення)">Нова пошта (У відділення)</SelectItem>
                              <SelectItem value="Нова пошта (До дому)">Нова пошта (Кур&apos;єр)</SelectItem>
                              <SelectItem value="Укрпошта (У відділення)">Укрпошта (У відділення)</SelectItem>
                              <SelectItem value="Укрпошта (До дому)">Укрпошта (Кур&apos;єр)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-small-regular" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Місто</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Адреса</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base-medium text-zinc-700">Поштовий код</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-lg border-zinc-200" />
                            </FormControl>
                            <FormMessage className="text-small-regular" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
                    <h2 className="text-heading3-bold mb-6 text-zinc-800 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-sky-500" />
                      Оплата
                    </h2>
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base-medium text-zinc-700">Спосіб оплати</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg border-zinc-200">
                                <SelectValue placeholder="Виберіть спосіб оплати" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Накладний платіж">Накладний платіж</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-small-regular" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
                    <h2 className="text-heading3-bold mb-6 text-zinc-800 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-sky-500" />
                      Коментар
                    </h2>
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base-medium text-zinc-700">Коментар до замовлення</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} className="rounded-lg border-zinc-200" />
                          </FormControl>
                          <FormMessage className="text-small-regular" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-base-medium text-white hover:shadow-md hover:shadow-sky-400/20 transition-all duration-300"
                  >
                    Підтвердити замовлення
                  </Button>
                </form>
              </Form>
            </div>

            <div className="lg:sticky lg:top-6 self-start">
              <div className="bg-white rounded-lg shadow-sm border border-zinc-100 overflow-hidden">
                <div className="p-4 bg-zinc-50 border-b border-zinc-100">
                  <h2 className="text-heading4-medium flex items-center text-zinc-800">
                    <ShoppingCart className="w-5 h-5 mr-2 text-sky-500" />
                    Ваше замовлення
                  </h2>
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                  {cartData.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center mb-4 pb-4 border-b border-zinc-100 last:border-b-0 last:pb-0 last:mb-0"
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-md mr-4 object-cover"
                      />
                      <div className="flex-grow">
                        <h3 className="text-base-semibold text-zinc-800">{item.name}</h3>
                        <p className="text-small-regular text-zinc-500">Кількість: {item.quantity}</p>
                        <p className="text-base-medium text-sky-500">
                          {item.price.toFixed(2)}
                          {Store.currency_sign}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-zinc-50 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base-regular text-zinc-600">Підсумок:</span>
                    <span className="text-base-semibold text-zinc-800">
                      {priceToPay}
                      {Store.currency_sign}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-regular text-zinc-600">Доставка:</span>
                    <span className="text-base-semibold text-zinc-800">Безкоштовно</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                    <span className="text-body-semibold text-zinc-800">Загальна сума:</span>
                    <span className="text-heading4-medium text-sky-500">
                      {priceToPay}
                      {Store.currency_sign}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-sky-50 p-4 rounded-lg border border-sky-100">
                <h3 className="text-heading4-medium mb-2 flex items-center text-zinc-800">
                  <CheckCircle className="w-5 h-5 mr-2 text-sky-500" />
                  Гарантія безпеки
                </h3>
                <p className="text-base-regular text-zinc-600">
                  Ваші особисті дані в безпеці, ми використовуємо найновіші технології шифрування і не зберігаємо
                  інформації про рахунки клієнтів.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CreateOrder

