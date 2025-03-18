import { revalidatePath, revalidateTag } from "next/cache";
import { createUrlProduct, createUrlProductsMany, deleteProduct, deleteUrlProducts, fetchUrlProducts, updateUrlProduct, updateUrlProductsMany } from "./actions/product.actions";
import { clearCatalogCache } from "./actions/redis/catalog.actions";
import { createUrlCategories, updateCategories } from "./actions/categories.actions";
import { FetchedCategory, ProductType } from "./types/types";

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
    categoryId: string
}

export async function proceedDataToDB(data: Product[], selectedRowsIds: (string | null)[], categories: FetchedCategory[], mergeProducts: boolean) {
    try {
        const stringifiedUrlProducts = await fetchUrlProducts("json");
        let urlProducts: Product[] = JSON.parse(stringifiedUrlProducts as string);

        const leftOverProducts = urlProducts.filter(
            urlProduct => !data.some(product => product.articleNumber === urlProduct.articleNumber)
        );

        const processedIds = new Set<string>();
        const newProducts = [];
        const productsToUpdate = [];

        await createUrlCategories(categories);

        for (const product of data) {
            const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || "No-category";

            if (product.id && selectedRowsIds.includes(product.id) && !processedIds.has(product.id)) {
                const existingProductIndex = urlProducts.findIndex(urlProduct => urlProduct.articleNumber === product.articleNumber);

                if (existingProductIndex !== -1) {
                    // Add to bulk update array
                    productsToUpdate.push({
                        ...product,
                        _id: urlProducts[existingProductIndex]._id,
                        category: categoryName,
                    });
                } else {
                    // Add to new products array
                    newProducts.push({
                        ...product,
                        category: categoryName,
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
        if(mergeProducts) {
            for (const leftOverProduct of leftOverProducts) {
                //IMPORTANT! Not clearing catalog cache, beacause, it will be cleard later, line 85
                await deleteProduct({ productId: leftOverProduct.id as string }, "keep-catalog-cache"); 
            }
        }

        await clearCatalogCache();

        return null;
    } catch (error: any) {
        throw new Error(`Error proceeding products to DB: ${error.message}`);
    }
}
