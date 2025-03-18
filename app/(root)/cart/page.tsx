"use client"

import type React from "react"

import { useAppContext } from "@/app/(root)/context"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, ShoppingBag, X, ArrowLeft } from "lucide-react"
import type { ProductType } from "@/lib/types/types"
import { trackFacebookEvent } from "@/helpers/pixel"
import { Store } from "@/constants/store"
import { useState } from "react"

export default function CartPage() {
  //@ts-ignore
  const { cartData, setCartData, priceToPay, setPriceToPay } = useAppContext()
  const [isUpdating, setIsUpdating] = useState(false)

  function removeProduct(index: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsUpdating(true)

    setTimeout(() => {
      cartData.splice(index, 1)
      setCartData((prev: any) => [...prev], cartData)
      setIsUpdating(false)
    }, 300)
  }

  function setCount(index: number, value: any) {
    value = Number(value)
    if (Number.isInteger(value)) {
      cartData[index].quantity = value
      setCartData((prev: any) => [...prev], cartData)
    } else {
      cartData[index].quantity = 1
      setCartData((prev: any) => [...prev], cartData)
    }
  }

  function plus(index: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (cartData[index].quantity < 999) {
      cartData[index].quantity++
      setCartData((prev: any) => [...prev], cartData)
    }
  }

  function minus(index: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (cartData[index].quantity > 1) {
      cartData[index].quantity--
      setCartData((prev: any) => [...prev], cartData)
    }
  }

  function delProduct(index: number, value: any) {
    value = Number(value)
    if (value < 1) {
      removeProduct(index, new MouseEvent("click") as any)
    }
  }

  const handleCheckout = () => {
    trackFacebookEvent("InitiateCheckout", {
      content_name: "Cart Checkout",
      content_ids: cartData.map((product: ProductType) => product.id),
      value: priceToPay,
      currency: "UAH",
      num_items: cartData.length,
    })
  }

  const totalPrice = cartData
    .reduce((acc: number, data: { price: number; quantity: number }) => acc + data.price * data.quantity, 0)
    .toFixed(2)

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading1-bold">Кошик</h1>
        <Link href="/catalog" className="flex items-center text-sky-500 hover:underline" title="Каталог">
          <ArrowLeft size={16} className="mr-1" />
          Продовжити покупки
        </Link>
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-heading3-bold font-semibold mb-2">Ваш кошик порожній</h2>
          <p className="text-gray-500 mb-6">Додайте товари до кошика, щоб продовжити</p>
          <Link href="/catalog" title="Каталог">
            <Button>Перейти до каталогу</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="grid grid-cols-12 gap-4 text-small-medium font-medium text-gray-500">
                  <div className="col-span-6">Товар</div>
                  <div className="col-span-2 text-center">Ціна</div>
                  <div className="col-span-2 text-center">Кількість</div>
                  <div className="col-span-2 text-right">Сума</div>
                </div>
              </div>

              <div className={`transition-opacity duration-300 ${isUpdating ? "opacity-50" : "opacity-100"}`}>
                {cartData.map((data: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0">
                    <div className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6">
                          <Link href={`/catalog/${data.id}`} className="flex items-center group">
                            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border mr-3">
                              <Image
                                width={64}
                                height={64}
                                alt={data.name}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                src={data.image || "/placeholder.svg"}
                              />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-medium text-small-medium md:text-body-medium group-hover:text-sky-500 transition-colors line-clamp-2">
                                {data.name}
                              </h3>
                            </div>
                          </Link>
                        </div>

                        <div className="col-span-2 text-center">
                          {data.priceWithoutDiscount !== data.price && (
                            <p className="text-subtle-medium font-normal text-gray-500 line-through mb-1">
                              {Store.currency_sign}
                              {data.priceWithoutDiscount}
                            </p>
                          )}
                          <p className="font-semibold">
                            {Store.currency_sign}
                            {data.price}
                          </p>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center border rounded-md">
                            <Button onClick={(e) => minus(index, e)} variant="ghost" className="p-0 h-8 w-8">
                              <Minus size={14} />
                            </Button>
                            <input
                              className="w-10 h-8 text-center focus:outline-none text-small-medium"
                              value={data.quantity}
                              onChange={(e) => setCount(index, e.target.value)}
                              onBlur={(e) => delProduct(index, e.target.value)}
                              maxLength={3}
                            />
                            <Button onClick={(e) => plus(index, e)} variant="ghost" className="p-0 h-8 w-8">
                              <Plus size={14} />
                            </Button>
                          </div>
                        </div>

                        <div className="col-span-2 text-right flex items-center justify-end">
                          <p className="font-semibold mr-3">
                            {Store.currency_sign}
                            {(data.price * data.quantity).toFixed(2)}
                          </p>
                          <Button
                            onClick={(e) => removeProduct(index, e)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                            <span className="sr-only">Видалити</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-heading3-bold font-semibold mb-4">Підсумок замовлення</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Товарів:</span>
                  <span>{cartData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Кількість:</span>
                  <span>{cartData.reduce((acc: number, item: any) => acc + item.quantity, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-heading4-medium font-semibold pt-2">
                  <span>Разом:</span>
                  <span>
                    {Store.currency_sign}
                    {totalPrice}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/order" className="block w-full">
                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Оформити замовлення
                  </Button>
                </Link>
                <Link href="/catalog" className="block w-full" title="Каталог">
                  <Button variant="outline" className="w-full">
                    Продовжити покупки
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

