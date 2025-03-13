"use client"
import { Button } from "../ui/button"
import { useAppContext } from "@/app/(root)/context"
import { productAddedToCart } from "@/lib/actions/product.actions"
import { trackFacebookEvent } from "@/helpers/pixel"
import type { ProductType } from "@/lib/types/types"
import { GiDeliveryDrone } from "react-icons/gi";
import { useRouter } from "next/navigation"

const BuyNow = ({
  id,
  name,
  image,
  price,
  priceWithoutDiscount,
}: { id: string; name: string; image: string; price: number; priceWithoutDiscount: number }) => {
  //@ts-ignore
  const { cartData, setPriceToPay, setCartData } = useAppContext()

  const router = useRouter()

  async function AddDataToCart() {
    let exist = 0
    let del = 0

    cartData.map((data: any, index: number) => {
      if (data.id === id) {
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

      trackFacebookEvent("InitiateCheckout", {
        content_name: "Cart Checkout",
        content_ids: cartData.map((product: ProductType) => product.id),
        value: cartData.map((product: ProductType) => product.priceToShow),
        currency: "UAH",
        num_items: cartData.length,
      })

      router.push("/order")
    } else {
      router.push("/order")
    }
  }

  return (
    <Button
      onClick={AddDataToCart}
      className="max-[425px]:w-full bg-gradient-to-r from-sky-500 to-sky-400 text-white hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 relative group overflow-hidden"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-400 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
      <GiDeliveryDrone className="mr-2 relative z-10" size={18} />
      <span className="relative z-10 text-base-semibold">Придбати миттєво</span>
    </Button>
  )
}

export default BuyNow

