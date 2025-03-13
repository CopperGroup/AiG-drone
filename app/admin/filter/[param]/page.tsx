import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchPreviewProduct } from '@/lib/actions/product.actions'
import { Store } from '@/constants/store'
import { ProductType } from '@/lib/types/types'

const ProductPreviewPage = async ({ params }: { params: { param: string } }) => {
  if (!params.param) return null

  const decodedParam = decodeURIComponent(params.param)
  const product: ProductType | null = await fetchPreviewProduct({ param: decodedParam })

  if (!product) {
    return <p>No product found.</p>
  }

  const parsePrice = (price: any) => {
    const parsedPrice = parseFloat(price)
    return isNaN(parsedPrice) ? 0 : parsedPrice
  }

  return (
    <section className="px-10 py-20 w-full max-[360px]:px-4">
        <Card className="w-full max-w-[1600px]">
        <CardHeader>
            <CardTitle className="text-heading2-bold">Product Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                    </div>
                )}
                </div>
                <div className="flex flex-wrap gap-2">
                {product.images.slice(1).map((image, index) => (
                    <img key={index} src={image} alt={`Product ${index + 2}`} className="w-20 h-20 object-cover rounded-md" />
                ))}
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-heading3-bold">{product.name || "Product Name"}</h2>
                <div className="flex items-center gap-2 max-[475px]:flex-col max-[475px]:items-start">
                <Badge variant={product.isAvailable ? "default" : "secondary"} className="max-[475px]:-ml-3">
                    {product.isAvailable ? "Available" : "Unavailable"}
                </Badge>
                </div>
                <div className="flex items-baseline space-x-2">
                <span className="text-body-bold">
                    {Store.currency_sign}
                    {parsePrice(product.priceToShow)}
                </span>
                {product.price !== product.priceToShow && (
                    <span className="text-base-regular text-gray-500 line-through">
                    {Store.currency_sign}
                    {parsePrice(product.price)}
                    </span>
                )}
                </div>
                <p className="text-base-regular text-gray-600">{product.description || "No description available."}</p>
                <div className="grid grid-cols-2 gap-2 text-small-medium max-[475px]:grid-cols-1">
                <div>
                    <span className="font-semibold">Vendor:</span> {product.vendor || "N/A"}
                </div>
                <div>
                    <span className="font-semibold">Article:</span> {product.articleNumber || "N/A"}
                </div>
                <div>
                    <span className="font-semibold">Category:</span> {product.category || "N/A"}
                </div>
                <div>
                    <span className="font-semibold">Quantity:</span> {product.quantity || 0}
                </div>
                <div>
                    <span className="font-semibold">URL:</span>{" "}
                    <a href={product.url || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {product.url ? product.url.slice(0, 20) + "..." : "No URL"}
                    </a>
                </div>
                </div>
            </div>
            </div>
            <div className="mt-6">
            <h3 className="text-heading4-medium mb-2">Parameters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-[475px]:grid-cols-1">
                {product.params.length > 0 ? (
                product.params.map((param, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md">
                    <span className={`text-small-semibold ${decodedParam.split('&')[1] === param.name ? "text-base-semibold bg-green-500 text-white px-1" : ""}`}>{param.name}:</span>{" "}
                    <span className="text-small-regular">{param.value}</span>
                    </div>
                ))
                ) : (
                <div className="col-span-3 text-center text-gray-500">No parameters available.</div>
                )}
            </div>
            </div>
        </CardContent>
        </Card>
    </section>
  )
}

export default ProductPreviewPage
