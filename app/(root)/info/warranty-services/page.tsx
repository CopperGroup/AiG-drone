import Link from "next/link"
import Image from "next/image"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Warranty"
}

const page = () => {
  return (
    <section>
        <h1 className='text-[45px]'>Доставка та оплата</h1>
    </section>
  )
}

export default page