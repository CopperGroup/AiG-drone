"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { trackFacebookEvent } from "@/helpers/pixel"
import { usePathname } from "next/navigation"
import { addLike } from "@/lib/actions/product.actions"

interface Props {
  likedBy: string
  productId: string
  productName: string
  value: number
  email: string
}

const LikeButton = ({ likedBy, productId, productName, value, email }: Props) => {
    const [ isLiked, setIsLiked ] = useState(false);

    let likes = []

    if(likedBy) {
        likes = JSON.parse(likedBy);
    }

    useEffect(() => {
        if(likes.some((user: { email: string }) => user.email === email)) {
            setIsLiked(true)
        }
    }, [productId, email])

    const pathname = usePathname();

    const handleAddingLike = async (e:any) => {
        e.preventDefault()
        try {
            
            setIsLiked(!isLiked);

            // It doesn't see, that the state was updated by this time, that's why I check, whether the product wasn't liked before

            if(!isLiked) {
                trackFacebookEvent('AddToWishlist', {
                    content_name: productName,
                    content_ids: [productId],
                    content_type: 'product',
                    value,
                    currency: 'UAH',
                });
            }

            await addLike({ productId: productId, email: email, path: pathname});

        } catch (error: any) {
            throw new Error(`Error running addLike() function, ${error.message}`)
        }
    }

  return (
    <button
      onClick={handleAddingLike}
      disabled={!email}
      className={`relative p-2 rounded-full transition-colors duration-300 ${
        isLiked ? "text-[#FECC02] hover:text-[#e6b800]" : "text-[#006AA7] hover:text-[#FECC02]"
      } ${!email ? "opacity-50 cursor-not-allowed" : "cursor-pointer z-30"}`}
    >
      <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
    </button>
  )
}

export default LikeButton

