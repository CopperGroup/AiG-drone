"use client"

import React from 'react'
import Order from '@/lib/models/order.model'
import axios from 'axios'
import { number } from 'zod'
import Image from 'next/image'






const DelOrderButton = (id:any) => {


    const delOrder = async (id:any) =>{
        try {
          await axios.post("/api/delOrder",id);
          window.location.reload();
        } catch (error) {
          console.log(error);
        }
       

      }

 
  return (
    <Image onClick={()=>delOrder(id)} src='/assets/close.svg' className='ml-auto cursor-pointer absolute right-0' width={25} height={25} alt=''></Image>
  )
}

export default DelOrderButton