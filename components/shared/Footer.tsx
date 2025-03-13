import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Youtube, X } from "lucide-react"
import { Store } from "@/constants/store"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-900 text-white z-40 pt-16 pb-8 w-full min-w-[320px]">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="w-full">
            <h3 className="text-heading4-medium text-sky-400 mb-4">Покупцям</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/info/contacts" className="text-base-regular hover:text-sky-300 transition-colors">
                  Контакти
                </Link>
              </li>
              <li>
                <Link href="/info/delivery-payment" className="text-base-regular hover:text-sky-300 transition-colors">
                  Доставка та оплата
                </Link>
              </li>
              <li>
                <Link
                  href="/info/warranty-services"
                  className="text-base-regular hover:text-sky-300 transition-colors"
                >
                  Гарантія та сервіс
                </Link>
              </li>
              <li>
                <Link href="/info/return-policy" className="text-base-regular hover:text-sky-300 transition-colors">
                  Політика повернення
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <h3 className="text-heading4-medium text-sky-400 mb-4">Інформація</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about-us" className="text-base-regular hover:text-sky-300 transition-colors">
                  Про нас
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base-regular hover:text-sky-300 transition-colors">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base-regular hover:text-sky-300 transition-colors">
                  Часті питання
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-base-regular hover:text-sky-300 transition-colors">
                  Навчальні матеріали
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <h3 className="text-heading4-medium text-sky-400 mb-4">Каталог</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog/photo-drones" className="text-base-regular hover:text-sky-300 transition-colors">
                  Фото дрони
                </Link>
              </li>
              <li>
                <Link href="/catalog/racing-drones" className="text-base-regular hover:text-sky-300 transition-colors">
                  Гоночні дрони
                </Link>
              </li>
              <li>
                <Link href="/catalog/accessories" className="text-base-regular hover:text-sky-300 transition-colors">
                  Аксесуари
                </Link>
              </li>
              <li>
                <Link href="/catalog/spare-parts" className="text-base-regular hover:text-sky-300 transition-colors">
                  Запчастини
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <h3 className="text-heading4-medium text-sky-400 mb-4">Контакти</h3>
            <p className="text-base-regular mb-2">Телефон: +380 44 123 4567</p>
            <p className="text-base-regular mb-2">Email: info@drones.com</p>
            <p className="text-base-regular mb-4">Адреса: вул. Хрещатик 22, Київ, Україна</p>
            <p className="text-small-regular text-neutral-400 mb-4">Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</p>
            <h4 className="text-base-semibold text-sky-400 mb-2">Ми в соцмережах</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-sky-300 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-sky-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-sky-300 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={24} />
                <span className="sr-only">YouTube</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-sky-300 transition-colors"
                aria-label="Twitter"
              >
                <X size={24} />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 mt-8 w-full">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center mb-4 lg:mb-0">
              <p className="text-small-regular text-neutral-400 text-center lg:text-left">
                ©{currentYear} <span className="font-semibold">{Store.name}</span>. Всі права захищені.
              </p>
            </div>
            <div className="flex flex-col items-center lg:items-end space-y-2 lg:space-y-0">
              <span className="text-small-regular text-neutral-400 text-center lg:text-right">
                Інновації та надійність у кожному польоті
              </span>
              {/* <div className="flex space-x-4 mt-2 lg:mt-1">
                <Image
                  className="h-8 w-auto"
                  width={88}
                  height={24}
                  src="/placeholder.svg?height=24&width=88"
                  alt="Сертифікат якості"
                />
                <Image
                  className="h-8 w-auto"
                  width={55}
                  height={24}
                  src="/placeholder.svg?height=24&width=55"
                  alt="Знак відповідності"
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

