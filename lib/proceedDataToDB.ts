import { revalidatePath } from "next/cache";
import { createUrlProduct, createUrlProductsMany, deleteProduct, deleteUrlProducts, fetchUrlProducts, updateUrlProduct, updateUrlProductsMany } from "./actions/product.actions";
import { clearCatalogCache } from "./actions/redis/catalog.actions";
import { updateCategories } from "./actions/categories.actions";
import { ProductType } from "./types/types";

interface Product {
    _id: string,
    id: string | null,
    name: string | null,
    isAvailable: boolean,
    quantity: number,
    url: string | null,
    priceToShow: number,
    price: number,
    images: (string | null)[],
    vendor: string | null,
    description: string | null,
    articleNumber: string | null,
    params: {
        name: string | null,
        value: string | null
    }[],
    isFetched: boolean,
    category: string
}

export async function proceedDataToDB(data: Product[], selectedRowsIds: (string | null)[]) {
    try {
        console.log(data)
        const stringifiedUrlProducts = await fetchUrlProducts("json");
        let urlProducts: Product[] = JSON.parse(stringifiedUrlProducts as string);

        const leftOverProducts = urlProducts.filter(
            urlProduct => !data.some(product => product.articleNumber === urlProduct.articleNumber)
        );

        const processedIds = new Set<string>();
        const newProducts = [];
        const productsToUpdate = [];

        for (const product of data) {
            if (product.id && selectedRowsIds.includes(product.id) && !processedIds.has(product.id)) {
                const existingProductIndex = urlProducts.findIndex(urlProduct => urlProduct.articleNumber === product.articleNumber);

                if (existingProductIndex !== -1) {
                    // Add to bulk update array
                    productsToUpdate.push({
                        _id: urlProducts[existingProductIndex]._id,
                        id: product.id,
                        name: product.name,
                        isAvailable: product.isAvailable,
                        quantity: product.quantity,
                        url: product.url,
                        priceToShow: product.priceToShow,
                        price: product.price,
                        images: product.images,
                        vendor: product.vendor,
                        description: product.description,
                        articleNumber: product.articleNumber,
                        params: product.params,
                        isFetched: product.isFetched,
                        category: product.category,
                    });
                } else {
                    // Add to new products array
                    newProducts.push({
                        id: product.id,
                        name: product.name,
                        isAvailable: product.isAvailable,
                        quantity: product.quantity,
                        url: product.url,
                        priceToShow: product.priceToShow,
                        price: product.price,
                        images: product.images,
                        vendor: product.vendor,
                        description: product.description,
                        params: product.params,
                        articleNumber: product.articleNumber,
                        isFetched: product.isFetched,
                        category: product.category || "No-category",
                    });
                }

                processedIds.add(product.id);
            }
        }

        // Perform bulk update
        if (productsToUpdate.length > 0) {
            await updateUrlProductsMany(productsToUpdate);
        }

        // Perform bulk insert for new products
        if (newProducts.length > 0) {
            await createUrlProductsMany(newProducts);
        }

        // Delete left-over products
        for (const leftOverProduct of leftOverProducts) {
            await deleteProduct({ productId: leftOverProduct.id as string }, "keep-catalog-cache");
        }

        await clearCatalogCache();

        return null;
    } catch (error: any) {
        throw new Error(`Error proceeding products to DB: ${error.message}`);
    }
}
