"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";
import { ProductType } from "../types/types";
import { fetchProductAndRelevantParams } from "./product.actions";
import { Store } from "@/constants/store";

const paths = {
    categories: "/admin/categories",
    createProduct: "/admin/createProduct",
    products: "/admin/products",
    dashboard: "/admin/dashboard",
    statistics: "/admin/statistics",
    orders: "/admin/Orders",
    payments: "/admin/payments",
    clients: "/admin/clients",
    filter: "/admin/filter",
    pixel: "/admin/pixel"
} as const

const adminPaths = [
    {
        name: 'createProduct',
        values: [paths.categories, paths.products, paths.filter],
        user_cache: {
            catalog: true,
            productPage: false,
            allProductPages: true
        }
    },
    {
        name: 'updateProduct',
        values: [paths.categories, paths.products, paths.dashboard, paths.statistics, paths.filter],
        user_cache: {
            catalog: true,
            productPage: true,
            allProductPages: true
        }
    },
    {
        name: 'deleteProduct',
        values: [paths.categories, paths.products, paths.dashboard, paths.statistics, paths.filter],
        user_cache: {
            catalog: true,
            productPage: false,
            allProductPages: true
        }
    },
    {
        name: 'createOrder',
        values: [paths.categories, paths.dashboard, paths.orders, paths.payments, paths.statistics],
        user_cache: {
            catalog: false,
            productPage: false,
            allProductPages: false
        }
    },
    {
        name: "createUser",
        values: [paths.clients, paths.statistics],
        user_cache: {
            catalog: false,
            productPage: false,
            allProductPages: false
        }
    },
    {
        name: 'likeProduct',
        values: [paths.statistics, paths.categories],
        user_cache: {
            catalog: true,
            productPage: false,
            allProductPages: false
        }
    },
    {
        name: "addToCart",
        values: [paths.dashboard, paths.statistics],
        user_cache: {
            catalog: false,
            productPage: false,
            allProductPages: false
        }
    },
    {
        name: "createCategory",
        values: [paths.categories, paths.createProduct, paths.filter],
        user_cache: {
            catalog: true,
            productPage: false,
            allProductPages: true
        }
    },
    {
        name: "updateCategory",
        values: [paths.categories, paths.createProduct, paths.filter, paths.statistics, paths.dashboard, paths.products],
        user_cache: {
            catalog: true,
            productPage: false,
            allProductPages: true
        }
    }, 
    {
        name: "deleteCategory",
        values: [paths.categories, paths.createProduct, paths.filter, paths.statistics, paths.dashboard, paths.products],
        user_cache: {
            catalog: true,
            productPage: false,
            allProductPages: true
        }
    },
    {
        name: "createPixel",
        values: [paths.pixel],
        user_cache: {
            catalog: false,
            productPage: false,
            allProductPages: false
        }
    },
    {
        name: "updatePixel",
        values: [paths.pixel],
        user_cache: {
            catalog: false,
            productPage: false,
            allProductPages: false
        }
    },
    {
        name: "deletePixel",
        values: [paths.pixel],
        user_cache: {
            catalog: false,
            productPage: false,
            allProductPages: false
        }
    }
] as const;

type ConditionalProps<T extends typeof adminPaths[number]["name"]> = 
    Extract<typeof adminPaths[number], { name: T }> extends { user_cache: { productPage: true } }
        ?  string 
        : undefined;

export default async function clearCache<T extends typeof adminPaths[number]["name"]>(
    functionNames: T | T[],
    productId: ConditionalProps<T>
) {
    const functionNamesArray = Array.isArray(functionNames) ? functionNames : [functionNames];

    let shouldClearCatalogCache = false;
    let shouldClearAllProductPagesCache = false;

    functionNamesArray.forEach(functionName => {
        const path = adminPaths.filter(({ name, values }) => name === functionName);

        if (path[0].name.length > 0 && path[0].user_cache?.catalog) {
            shouldClearCatalogCache = true; // Set flag to true if catalog needs clearing
        }

        if (path[0].name.length > 0 && path[0].user_cache?.allProductPages) {
            shouldClearAllProductPagesCache = true;
        }

        path[0]?.values.forEach((value: string) => {
            revalidatePath(value);
        });
    });

    if(shouldClearCatalogCache) {
        revalidateTag("catalog-data");
    }

    if(productId) {
        revalidateTag(`${Store.name}-product-${productId}`)
    }

    if(shouldClearAllProductPagesCache) {
        revalidateTag(`${Store.name}-product`)
    }
}

export const fetchProductPageInfo = cache(
    async (currentProductId: string, key: keyof ProductType, splitChar?: string, index?: number) => {
      return unstable_cache(
        async () => {
          const { product, selectParams } = await fetchProductAndRelevantParams(currentProductId, key, splitChar, index);
          return { product, selectParams };
        },
        [`${Store.name}-product-${currentProductId}`],
        { tags: [`${Store.name}-product-${currentProductId}`, `${Store.name}-product`] }
      )();
    }
  );
  
  
  