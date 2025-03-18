'use client'

import React from 'react'
import ProdactPage from '@/components/shared/ProdactPage';
import Product from '@/lib/models/product.model'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Description } from '@radix-ui/react-toast';





const ChangeProductForm = (product:any) => {

    product = product.product
    
    const [Product, setProduct] = useState({
        name:product.name,
        id:product.id,
        price:product.price,
        priceToShow:product.priceToShow,
        category:product.category,
        quantity:product.quantity,
        vendor:product.vendor,
        description:product.description
    })

    
   

  return (
    <form action="" className='flex flex-col mt-20' >
         
            
            {/* <label htmlFor="name" className='text-[20px] mb-5 font-medium'>Назва товару</label>
            <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="name"
            value={Product.name}
            />


            <label htmlFor="id" className='text-[20px] mb-5 font-medium mt-10'>Номер (ID)</label>
            <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="id"
            value={Product.id}
            />

            <label htmlFor="price" className='text-[20px] mb-5 font-medium mt-10'>Ціна</label>
            <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="price"
            value={Product.price}
            />


          <label htmlFor="priceToShow" className='text-[20px] mb-5 font-medium mt-10'>Ціна після знижки</label>
            <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="priceToShow"
            value={Product.priceToShow}
            />


          <label htmlFor="Категорія" className='text-[20px] mb-5 font-medium mt-10'>Категорія</label>
          <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="Категорія"
            value={Product.category}
          />

          <label htmlFor="Кількість" className='text-[20px] mb-5 font-medium mt-10'>Кількість</label>
          <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="Кількість"
            value={Product.quantity}
          />

          <label htmlFor="Постачальник" className='text-[20px] mb-5 font-medium mt-10'>Постачальник</label>
          <input type="text"
            className="p-2 border w-2/4 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
            id="Постачальник"
            value={Product.vendor}
          />
            
            <label htmlFor="Опис" className='text-[20px] mb-5 font-medium mt-10 '>Опис</label>
            <textarea name="Опис" id="Опис" className='w-2/4 border h-[300px] text-left p-2' >{Product.description.replace(/[^а-щьюяґєіїА-ЩЬЮЯҐЄІЇ0-9. ]/g, '')}</textarea> */}

          <div className='mt-10 gap-5 flex justify-end w-2/4'>
            <Link href='/admin/dashboard'><Button variant='outline'>Повернутися</Button></Link>
            <Button type='submit'>Зберегти</Button>
          </div>

          </form>
  )
}

export default ChangeProductForm