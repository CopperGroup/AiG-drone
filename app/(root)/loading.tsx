import Loader from "@/components/shared/Loader"
import { Store } from "@/constants/store"

const loading = () => {
  return (
    <section className="w-full h-fit flex flex-col items-center">
        <h1 className="text-heading3-bold">{Store.name}</h1>
        <Loader/>
    </section>
  )
}

export default loading