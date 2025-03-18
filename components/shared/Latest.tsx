"use server"

import Image from "next/image"
import * as React from "react"
 
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious, 
  type CarouselApi, 
} from "@/components/ui/carousel"
import { Button } from "../ui/button"
import ProductCard from "../cards/ProductCard"
import { fetchAllProducts, fetchLastProducts } from '@/lib/actions/product.actions';
import { getSession } from "@/lib/getServerSession"


const Latest = async () => {
 

  const email = await getSession();

  const lastProducts = await fetchLastProducts();



  return (
    <section className="2xl:max-w-screen-xl xl:max-w-screen-lg lg:max-w-screen-md md:max-w-screen-sm max-w-[294px]  mx-auto">
        <h2 className="text-heading2-semibold mb-20 text-center">Новинки</h2>
        <Carousel  className="w-ful mx-auto">
          <CarouselContent className="-ml-1 flex flex-1 ">
          {Array.from({ length: 12 }).map((_, index) => (
            
              <CarouselItem key={index} className="pl-1   md:basis-1/2 xl:basis-1/3">
                <div className="p-1">

                      <div className="w-72 mx-auto">
                        <ProductCard 
                          description={lastProducts[index].description.replace(/[^а-яА-ЯіІ]/g, ' ').substring(0, 35) + '...'} 
                          name={lastProducts[index].name} 
                          price={lastProducts[index].price} 
                          priceToShow={lastProducts[index].priceToShow} 
                          imageUrl={lastProducts[index].images[0]}
                          url={lastProducts[index].params[0].value} 
                          likedBy={lastProducts[index].likedBy}
                          productId={lastProducts[index].id}
                          id={lastProducts[index]._id}
                          email={email}
                        />
                      </div>
                    </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="max-[420px]:hidden"/>
          <CarouselNext className="max-[420px]:hidden"/>
        </Carousel>
        
    </section>
  )
}

export default Latest