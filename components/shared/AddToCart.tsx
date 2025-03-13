"use client"
import { Button } from "../ui/button"
import { useAppContext } from "@/app/(root)/context"
import { productAddedToCart } from "@/lib/actions/product.actions"
import { ShoppingCart } from "lucide-react"
import { trackFacebookEvent } from "@/helpers/pixel"

const AddToCart = ({
  id,
  name,
  image,
  price,
  priceWithoutDiscount,
  variant,
}: { id: string; name: string; image: string; price: number; priceWithoutDiscount: number; variant?: "full" }) => {
  //@ts-ignore
  const { cartData, setCartData } = useAppContext()

  async function AddDataToCart() {
    let exist = 0
    let del = 0

    cartData.map((data: any, index: number) => {
      if (data.name == name) {
        exist = 1
        del = index
      }
    })

    if (exist == 0) {
      setCartData((prev: any) => [
        ...prev,
        { id: id, name: name, image: image, price: price, priceWithoutDiscount: priceWithoutDiscount, quantity: 1 },
      ])

      await productAddedToCart(id)

      trackFacebookEvent("AddToCart", {
        content_name: name,
        content_ids: id,
        content_type: "product",
        value: priceWithoutDiscount,
        currency: "UAH",
      })
    } else {
      cartData.splice(del, 1)
      setCartData((prev: any) => [...prev], cartData)
    }
  }

  if (variant === "full") {
    return (
      <Button
        onClick={AddDataToCart}
        className="w-48 max-[425px]:w-full bg-white text-zinc-800 border border-sky-500 hover:bg-sky-500/10 hover:text-zinc-900 transition-all duration-300 group relative overflow-hidden"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-500/20 to-sky-400/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
        <ShoppingCart className="mr-2 w-5 h-5 relative z-10" />
        <span className="relative z-10 text-base-semibold">Додати в кошик</span>
      </Button>
    )
  } else {
    return (
      <Button
        onClick={AddDataToCart}
        className="bg-sky-500 text-white hover:bg-sky-500/90 hover:text-zinc-50 border border-sky-500/50 transition-all duration-300 px-3 py-1 h-9 group relative overflow-hidden"
      >
        <ShoppingCart className="mr-1 w-4 h-4 relative z-10" />
        <span className="relative z-10 text-small-medium">У кошик</span>
      </Button>
    )
  }
}

export default AddToCart

