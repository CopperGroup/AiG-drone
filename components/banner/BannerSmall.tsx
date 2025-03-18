import { Store } from "@/constants/store";

const BannerSmall = () => {
  return (
    <article className="w-full h-72 group flex justify-center items-center rounded-3xl" style={{ backgroundImage: `url(/assets/loginbackground.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h1 className="text-[56px] bg-black font-medium text-white py-2 px-5 leading-tight max-[440px]:text-[48px] max-[370px]:text-[40px]">{Store.name}</h1>
    </article>
  )
}

export default BannerSmall;