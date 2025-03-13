import Image from "next/image"
import { Button } from "@/components/ui/button"
import CatalogLinkButton from "../interface/CatalogLinkButton"

export default function BannerHero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-zinc-900">
      <video
        src="/assets/video.mp4"
        autoPlay
        preload="auto"
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent">
        <div className="container mx-auto h-full flex items-center">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-bold text-white max-[1380px]:text-[72px] max-[1380px]:leading-[81px] max-[1260px]:text-[64px] max-[1260px]:leading-[72px] max-[1130px]:text-[60px] max-[1130px]:leading-[67px] max-[1070px]:text-[56px] max-[1070px]:leading-[63px] max-[450px]:text-[52px] max-[450px]:leading-[60px] max-[425px]:text-[48px] max-[425px]:leading-[55px] max-[400px]:text-[43px] max-[400px]:leading-[50px]">
              Інноваційні
              <br />
              <span className="text-sky-400">Дрони</span>
            </h1>
            <p className="text-body-medium text-neutral-200 max-w-xl">
              Відкрийте для себе колекцію професійної зйомки
              та продуктивності в будь-яких умовах.
            </p>
            <div className="flex gap-4 max-[516px]:flex-col">
              <CatalogLinkButton link="/catalog?page=1&sort=default">
                <Button
                  size="lg"
                  className="max-[516px]:w-full bg-sky-500 text-white hover:bg-sky-400 px-8 py-6 text-base-semibold"
                >
                  Купити зараз
                </Button>
              </CatalogLinkButton>
              <CatalogLinkButton link="/catalog?page=1&sort=default">
                <Button
                  size="lg"
                  variant="outline"
                  className="max-[516px]:w-full border-white hover:bg-white/10 px-8 py-6 text-base-semibold text-white"
                >
                  Переглянути каталог
                </Button>
              </CatalogLinkButton>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <Image
                  src="/assets/t1.jpg"
                  alt="Користувач"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-zinc-900"
                />
                <Image
                  src="/assets/t2.jpg"
                  alt="Користувач"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-zinc-900"
                />
                <Image
                  src="/assets/t3.jpg"
                  alt="Користувач"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-zinc-900"
                />
              </div>
              <p className="text-small-medium text-neutral-300">
                <span className="text-white font-semibold">500+</span> задоволених клієнтів цього місяця
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

