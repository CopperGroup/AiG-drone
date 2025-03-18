import { options } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"

import { redirect } from "next/navigation"

export default async function ServerPage() {
    const session = await getServerSession(options)

    

 

    return (
        <section>
          <p className="text-[35px]">hjghgjghjghj</p>
           
        </section>
    )

}