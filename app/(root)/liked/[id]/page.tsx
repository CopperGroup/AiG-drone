import ProductCard from "@/components/cards/ProductCard";
import { fetchLikedProducts } from "@/lib/actions/product.actions";
import { fetchUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Liked products"
}

const Page = async ({ params }: { params: { id: string } }) => {
    if(!params.id) return null;
 
    const user = await fetchUserById(params.id);
    const likedProducts = await fetchLikedProducts(params.id);
   
 
    return (
        <>
        {likedProducts.length > 0 ? (<div className='grid  auto-cols-max gap-4 mt-8 grid-cols-5 px-4 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-grid1:grid-cols-1 '>
                {likedProducts
                    .map((product) =>(
                        <div key={product.id}>
                            <ProductCard 
                                id = {product._id}
                                productId={product.id}
                                email={user.email}
                                url={product.params[0].value}
                                price={product.price}
                                imageUrl={product.images[0]}
                                description={product.description.replace(/[^а-яА-ЯіІ]/g,' ').substring(0, 35) + '...'} 
                                priceToShow={product.priceToShow} 
                                name={product.name}
                                likedBy={product.likedBy}
                            />
                        </div>
                    ))
                }
            </div>): (
                <div>
                    <h3 className="text-heading2-bold mb-2">Ви не вподобали жодних товарів</h3>
                    <Link href='/catalog' className="text-primary-500">Переглянути товари</Link>
                </div>
                )
            }
        </>
    )
}

export default Page