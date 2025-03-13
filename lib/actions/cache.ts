"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import { ProductType } from "../types/types";
import { fetchProductAndRelevantParams } from "./product.actions";

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
        values: [paths.categories, paths.products, paths.filter]
    },
    {
        name: 'updateProduct',
        values: [paths.categories, paths.products, paths.dashboard, paths.statistics, paths.filter]
    },
    {
        name: 'deleteProduct',
        values: [paths.categories, paths.products, paths.dashboard, paths.statistics, paths.filter]
    },
    {
        name: 'createOrder',
        values: [paths.categories, paths.dashboard, paths.orders, paths.payments, paths.statistics]
    },
    {
        name: "createUser",
        values: [paths.clients, paths.statistics]
    },
    {
        name: 'likeProduct',
        values: [paths.statistics, paths.categories]
    },
    {
        name: "addToCart",
        values: [paths.dashboard, paths.statistics]
    },
    {
        name: "createCategory",
        values: [paths.categories, paths.createProduct, paths.filter]
    },
    {
        name: "updateCategory",
        values: [paths.categories, paths.createProduct, paths.filter, paths.statistics, paths.dashboard, paths.products]
    }, 
    {
        name: "deleteCategory",
        values: [paths.categories, paths.createProduct, paths.filter, paths.statistics, paths.dashboard, paths.products]
    },
    {
        name: "createPixel",
        values: [paths.pixel]
    },
    {
        name: "updatePixel",
        values: [paths.pixel]
    },
    {
        name: "deletePixel",
        values: [paths.pixel]
    }
] as const;

export default async function clearCache(functionNames: typeof adminPaths[number]["name"] | (typeof adminPaths[number]["name"])[]) {
    const functionNamesArray = Array.isArray(functionNames) ? functionNames : [functionNames];

    functionNamesArray.forEach(functionName => {
        const path = adminPaths.filter(({ name, values }) => name === functionName);

        path[0]?.values.forEach((value: string) => {
            revalidatePath(value);
        });
    });
}

export const fetchProductPageInfo = cache(async (
    currentProductId: string,
    key: keyof ProductType,
    splitChar?: string,
    index?: number
) => {
    const info = await fetchProductAndRelevantParams(currentProductId, key, splitChar, index)

    return info
})
