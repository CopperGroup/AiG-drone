import Link from 'next/link'
import React from 'react'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Delivery and paymnet"
}

const deliveryPayment = () => {
  return (
    <section>
        <h1 className='text-[45px]'>Доставка та оплата</h1>
    </section>
  )
}

export default deliveryPayment