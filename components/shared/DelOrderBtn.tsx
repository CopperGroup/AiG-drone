'use client'

import React from 'react'
import { Button } from '../ui/button'
import { delOrder } from '@/lib/actions/order.actions'
import { useRouter } from 'next/navigation'

const DelOrderBtn = (id:any) => {

  const router = useRouter();

 const del = async()=>{
    console.log(id.id)
    await delOrder(id.id)
    window.history.back();
    
   
 }

 


  return (
    <Button onClick={del}>Видалити замовлення</Button>
  )
}

export default DelOrderBtn