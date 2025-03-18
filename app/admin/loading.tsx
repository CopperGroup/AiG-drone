import AdminLoading from '@/components/shared/AdminLoading'
import React from 'react'

const Loading = () => {
  return (
    <section className="relative flex justify-center items-center px-10 py-20 w-full h-screen max-[360px]:px-4"> 
        <AdminLoading/>
    </section>
  )
}

export default Loading