"use client"
import { useAppContext } from "@/app/(root)/context"
import Image from "next/image"
import { Button } from "../ui/button"
import Link from "next/link"
import type { ProductType } from "@/lib/types/types"
import { trackFacebookEvent } from "@/helpers/pixel"
import { Store } from "@/constants/store"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"

const CartPage = ({ setIsOpened }: { setIsOpened: (value: boolean) => void }) => {
  //@ts-ignore
  const { cartData, setCartData, priceToPay, setPriceToPay } = useAppContext()

  function hideCart() {
    setIsOpened(false)
  }

  function removeProduct(index: number) {
    cartData.splice(index, 1)
    setCartData((prev: any) => [...prev], cartData)
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

  function plus(index: number) {
    if (cartData[index].quantity < 999) {
      cartData[index].quantity++
      setCartData((prev: any) => [...prev], cartData)
    }
  }

  function minus(index: number) {
    if (cartData[index].quantity > 1) {
      cartData[index].quantity--
      setCartData((prev: any) => [...prev], cartData)
    }
  }

  function delProduct(index: number, value: any) {
    value = Number(value)
    if (value < 1) {
      removeProduct(index)
    }
  }

  const handleCheckout = () => {
    hideCart()

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
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-zinc-100">
        <h2 className="text-heading2-bold text-zinc-800 font-serif flex items-center">
          <ShoppingBag className="mr-2 text-sky-500" size={24} />
          <span>Кошик</span>
        </h2>
      </div>

      <div className="flex-grow overflow-auto p-6 scrollbar-thin scrollbar-thumb-sky-400 scrollbar-track-white">
        {cartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <ShoppingBag className="text-sky-400 mb-4 opacity-30" size={64} />
            <p className="text-body-medium text-zinc-500">Ваш кошик порожній</p>
            <p className="text-small-regular text-zinc-400 mt-2">Додайте прикраси, щоб почати</p>
          </div>
        ) : (
          cartData.map((data: any, index: number) => (
            <article
              key={index}
              className="flex items-center py-4 border-b border-zinc-100 last:border-b-0 group transition-all duration-300 hover:bg-zinc-50 rounded-lg px-2"
            >
              <div className="flex-shrink-0 w-24 h-24 mr-4">
                <div className="w-full h-full overflow-hidden rounded-md aspect-square border border-zinc-100 group-hover:border-sky-400 transition-colors duration-300">
                  <Image
                    width={96}
                    height={96}
                    alt={data.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    src={data.image || "/placeholder.svg"}
                  />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base-semibold text-zinc-800 group-hover:text-sky-500 transition-colors duration-300">
                    {data.name}
                  </h3>
                  <button
                    onClick={() => removeProduct(index)}
                    className="text-zinc-400 hover:text-sky-500 transition-colors duration-300 p-1 rounded-full hover:bg-sky-50"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center border border-zinc-200 rounded-md overflow-hidden bg-white">
                    <Button
                      onClick={() => minus(index)}
                      variant="ghost"
                      className="p-1 h-8 w-8 text-sky-500 hover:text-sky-600 hover:bg-sky-50"
                    >
                      <Minus size={14} />
                    </Button>
                    <input
                      className="w-12 h-8 text-center focus:outline-none text-zinc-800 text-small-medium"
                      value={data.quantity}
                      onChange={(e) => setCount(index, e.target.value)}
                      onBlur={(e) => delProduct(index, e.target.value)}
                      maxLength={3}
                    />
                    <Button
                      onClick={() => plus(index)}
                      variant="ghost"
                      className="p-1 h-8 w-8 text-sky-500 hover:text-sky-600 hover:bg-sky-50"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <div className="text-right">
                    {data.priceWithoutDiscount !== data.price && (
                      <p className="text-small-medium text-zinc-500 line-through">
                        {Store.currency_sign}
                        {data.priceWithoutDiscount}
                      </p>
                    )}
                    <p className="text-base-semibold text-sky-500">
                      {Store.currency_sign}
                      {data.price}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="border-t border-zinc-100 p-6 bg-zinc-50/80 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-body-semibold text-zinc-800">Разом:</span>
          <span className="text-heading3-bold text-sky-500">
            {Store.currency_sign}
            {totalPrice}
          </span>
        </div>
        <div className="space-y-3">
          <Button
            onClick={hideCart}
            variant="outline"
            className="w-full border-sky-500 text-sky-500 hover:bg-sky-50 hover:text-sky-600 transition-all duration-300"
          >
            <span className="text-base-medium">Повернутись до покупок</span>
          </Button>
          <Link href="/order" className="block w-full">
            <Button
              onClick={handleCheckout}
              disabled={cartData.length === 0}
              className="w-full bg-sky-500 hover:bg-sky-400 hover:shadow-md hover:shadow-sky-400/20 transition-all duration-300 border-0"
            >
              <span className="text-base-medium">Оформити замовлення</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CartPage

