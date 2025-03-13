import Head from 'next/head'
import Image from 'next/image'
import { JsonLd } from 'react-schemaorg'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Shield, Truck } from 'lucide-react'
import AddToCart from './AddToCart'
import ContentView from '../pixel/ContentView'
import { Store } from '@/constants/store'
import ProductImagesCarousel from '../interface/ProductImagesCarousel'
import ProductVariantSelector from '../interface/ProductVariantSelector'
import { pretifyProductName } from '@/lib/utils'
import BuyNow from './BuyNow'

export type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  priceToShow: number;
  params: Array<{ name: string; value: string }>;
};

export default function ProductPage({ productJson, selectParams }: { productJson: string, selectParams: Record<string, {_id: string, value: string}[]> }) {
    const product = JSON.parse(productJson);

    const pretifiedName = pretifyProductName(product.name, [], product.articleNumber || "");

    return (
        <>
            <Head>
                <title>{pretifiedName} | {Store.name}</title>
                <meta name="description" content={product.description.slice(0, 160)} />
                <meta property="og:title" content={`${pretifiedName} | ${Store.name}`} />
                <meta property="og:description" content={product.description.slice(0, 160)} />
                <meta property="og:image" content={product.images[0]} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            {/* @ts-ignore */}
            <JsonLd<Product>
                item={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: pretifiedName,
                    image: product.images[0],
                    description: product.description,
                    offers: {
                        "@type": "Offer",
                        price: product.priceToShow,
                        priceCurrency: "UAH",
                        availability: "https://schema.org/InStock"
                    }
                }}
            />
            <section>
                <article itemScope itemType="https://schema.org/Product" className="container mx-auto px-4 py-8 max-w-7xl">
                    <ContentView productName={pretifiedName} productCategory={product.category} productId={product._id} contentType="product" value={product.priceToShow} currency="UAH"/>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="space-y-6">
                            <ProductImagesCarousel images={product.images} />
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-heading2-bold mb-2" itemProp="name">{pretifiedName}</h1>
                                <p className="text-base-regular text-gray-600" itemProp="category">{product.category}</p>
                            </div>

                            <div className="flex items-center space-x-4 flex-wrap">
                                <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
                                    <span className="text-heading3-bold text-blue-600" itemProp="price">{Store.currency_sign}{product.priceToShow}</span>
                                    <meta itemProp="priceCurrency" content="UAH" />
                                </span>
                                {product.priceToShow !== product.price && 
                                    <>
                                        <span className="text-body-medium text-gray-500 line-through">{Store.currency_sign}{product.price}</span>
                                        <Badge variant="destructive" className="text-small-medium">Sale</Badge>
                                    </>
                                }
                            </div>
                            
                            <div className="space-y-3 text-base-regular">
                                <div className="flex items-center">
                                    <CreditCard className="mr-2 flex-shrink-0 text-blue-600" size={20} />
                                    <span>Оплата: готівка / безготівковий розрахунок</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="mr-2 flex-shrink-0 text-blue-600" size={20} />
                                    <span>Гарантія: {product.params.find((param: { name: string, value: string }) => param.name === "Гарантія")?.value}</span>
                                </div>
                                <div className="flex items-center">
                                    <Truck className="mr-2 flex-shrink-0 text-blue-600" size={20} />
                                    <span>Безкоштовна доставка при замовленні від {Store.currency_sign}1000</span>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <ProductVariantSelector 
                              selectParams={selectParams}
                              productId={product._id} 
                            />
                            
                            <div className="flex items-center gap-4 flex-wrap">
                                <BuyNow
                                    id={product._id} 
                                    name={product.name} 
                                    image={product.images[Store.default_image.checkout_page]} 
                                    price={product.price} 
                                    priceWithoutDiscount={product.priceToShow} 
                                />
                                <AddToCart 
                                    id={product._id} 
                                    name={product.name} 
                                    image={product.images[Store.default_image.checkout_page]} 
                                    price={product.price} 
                                    priceWithoutDiscount={product.priceToShow} 
                                    variant="full"
                                />
                                {/* <Button variant="outline" className="text-base-medium py-6">Купити зараз</Button> */}
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="my-12" />
                    
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <div itemProp="description" className='max-w-[80vw]'>
                            <h2 className="text-heading4-medium mb-4">Опис</h2>
                            <p className="text-base-regular text-gray-700">{product.description}</p>
                        </div>
                        
                        <div className="w-full">
                            <h2 className="text-heading4-medium mb-4">Параметри</h2>
                            <div className="max-sm:hidden overflow-x-auto">
                                <table className="w-full">
                                <tbody>
                                    {product.params.map((param: { name: string; value: string }) => (
                                    <tr key={param.name} className="border-b">
                                        <td className="py-2 pr-4 text-base-semibold w-1/3 md:w-2/5">
                                        <div className="break-words">{param.name}</div>
                                        </td>
                                        <td className="py-2 text-base-regular text-gray-700 w-2/3 md:w-3/5">
                                        <div className="break-words">{param.value.replaceAll("_", " ")}</div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>

                            <div className="sm:hidden space-y-4 mt-4">
                                {product.params.map((param: { name: string; value: string }) => (
                                <div key={param.name} className="border-b pb-3 max-w-[80vw]">
                                    <div className="text-base-semibold mb-1">{param.name}</div>
                                    <div className="text-base-regular text-gray-700 break-words">{param.value}</div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </>
    )
}

