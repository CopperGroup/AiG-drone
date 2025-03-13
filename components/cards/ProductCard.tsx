import Image from "next/image"
import AddToCart from "../shared/AddToCart"
import Badge from "../badges/Badge"
import Link from "next/link"
import LikeButton from "../interface/LikeButton"
import { Store } from "@/constants/store"

interface Props {
  id: string
  productId: string
  email: string
  priceToShow: number
  price: number
  name: string
  imageUrl: string
  description: string
  url: string
  likedBy: {
    _id: string
    email: string
  }[]
}

const ProductCard = ({
  id,
  productId,
  email,
  priceToShow,
  price,
  name,
  imageUrl,
  description,
  url,
  likedBy,
}: Props) => {
  return (
    <article className="w-[100%] h-96 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="w-11/12 h-[90%]">
        <Link href={`/catalog/${id}`} prefetch={false}>
          <div className="relative w-full h-56 flex justify-center">
            <Image
              src={imageUrl || "/placeholder.svg"}
              width={200}
              height={200}
              alt={`Зображення ${name}`}
              className="absolute rounded-2xl max-w-[200px] max-h-[200px] object-contain"
            />
            <div className="w-full h-full flex justify-between items-start">
              <Badge price={price} priceToShow={priceToShow} />

              <LikeButton
                likedBy={JSON.stringify(likedBy)}
                productId={productId}
                productName={name}
                value={priceToShow}
                email={email}
              />
            </div>
          </div>
          <div className="h-[76px] overflow-hidden">
            <h3 className="text-body-bold ml-1 text-zinc-800">{name}</h3>
            <p className="ml-1 text-zinc-600 text-base-regular">{description}</p>
          </div>
        </Link>
        <div className="flex flex-1 justify-between items-center mt-2">
          <div>
            <p className="text-base-medium text-zinc-500 line-through">
              {price !== priceToShow ? `${Store.currency_sign}${price}` : <></>}
            </p>
            <p className="text-base-semibold text-sky-600">
              {Store.currency_sign}
              {priceToShow}
            </p>
          </div>
          <AddToCart id={id} image={imageUrl} name={name} price={priceToShow} priceWithoutDiscount={price} />
        </div>
      </div>
    </article>
  )
}

export default ProductCard

