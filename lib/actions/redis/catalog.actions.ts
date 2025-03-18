"use server";

import { redis } from "@/lib/redis";
import { fetchAllProducts } from "../product.actions";
import { getCategoriesNamesIdsTotalProducts } from "../categories.actions";
import { getFilterSettingsAndDelay } from "../filter.actions";
import { FilterSettingsData, ProductType } from "@/lib/types/types";
import { filterProductsByKey } from "@/lib/utils";
import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

export async function createCatalogChunks (filtredProducts: any) {
    const jsonData = JSON.stringify(filtredProducts); // Convert to JSON string
    const dataSize = Buffer.byteLength(jsonData, 'utf8'); // Calculate size of JSON data in bytes
    const MAX_SIZE = 512 * 1024; // Redis max size limit per chunk in bytes (1 MB)
  
    // Determine the number of chunks required
    const numberOfChunks = Math.ceil(dataSize / MAX_SIZE); // Calculate the minimum number of chunks needed
    const chunkSize = Math.ceil(dataSize / numberOfChunks + 1); // Find the size for each chunk
  
    const chunks = [];
  
    // Split the JSON string into dynamically calculated chunks
    for (let i = 0; i < jsonData.length; i += chunkSize) {
      chunks.push(jsonData.slice(i, i + chunkSize));
    }
  
    // Store each chunk in Redis with a unique key
    for (let i = 0; i < chunks.length; i++) {
      await redis.set(`catalog_chunk_${i}`, chunks[i]);
    }

    await redis.set("catalog_chunk_count", chunks.length);
};

export async function fetchCatalog () {
    try{
        const chunks = [];
        let chunkIndex = 0;
    
        const chunkCount: number | null = await redis.get("catalog_chunk_count");
    
        if (!chunkCount) {
            throw new Error("Catlog product chunks missing")
        }
        console.log("Chunk count", chunkCount);
    
        while (chunkIndex < chunkCount) {
            const chunk = await redis.get(`catalog_chunk_${chunkIndex}`);
    
            if(chunk) {
                chunks.push(chunk);
            } else {
                throw new Error("Catlog product chunks missing")
            }
    
            chunkIndex++;
        }

        if(chunks.length !== chunkCount) {
            throw new Error("Catlog product chunks missing")
        }
    
        console.log("Fetching from redis");

        const combinedChunks = chunks.join('');
    
        const data = JSON.parse(combinedChunks);
        
        let stringifiedCategories: { name: string, categoryId: string, totalProducts: number, subCategories: string[] }[] | null = await redis.get("catalog_categories"); // This was supposed to return a string but return an object instead

        let categories;
        if (!stringifiedCategories) {
            categories = await fetchAndCreateCategoriesCache();
            // console.log("categories", categories);
        } else {
            // console.log("Fetched categories", typeof stringifiedCategories, stringifiedCategories);
            categories = stringifiedCategories;
        }
        
        const stringifiedFilterSettings: { filterSettings: FilterSettingsData, delay: number } | null = await redis.get("filter_settings") // This was supposed to return a string but return an object instead

        let filterSettingsData;

        if(!stringifiedFilterSettings) {
            filterSettingsData = await fetchAndCreateFilterSettingsCache()
        } else {
            filterSettingsData = stringifiedFilterSettings
        }

        // console.log(filterSettingsData)
        // console.log("categories length:", categories.length);
        // console.log("This was fetched from redis cache");

        return { data, categories, filterSettingsData };
    } catch (error) {
        console.error("Error in fetchCatalog:", error);
        return { data: await fetchAndCreateCatalogChunks(), categories: await fetchAndCreateCategoriesCache(), filterSettingsData: await fetchAndCreateFilterSettingsCache()};
    }
}

export async function fetchAndCreateCatalogChunks() {
    try {
        let filtredProducts = await fetchAllProducts();

        filtredProducts = filterProductsByKey(filtredProducts as ProductType[], "articleNumber", "-", 0)

        await clearCatalogCache();

        return filtredProducts;
    } catch (error: any) {
        throw new Error(`Error fetching catalog data: ${error.message}`);
    }
}

export async function clearCatalogCache() {
    let cursor = '0';
    const matchPattern = '*catalog*';

    try {
        do {
            const scanResult = await redis.scan(cursor, { match: matchPattern, count: 100 });
            cursor = scanResult[0];
            const keys = scanResult[1];

            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== '0')

        await redis.del("catalog_categories")
        await redis.del("filter_settings")

        // await fetchCatalogWithCache()
    } catch (error: any) {
        throw new Error(`Error clearing catalog cache: ${error.message}`);
    }
}

export async function fetchAndCreateCategoriesCache() {
  try {
    const categories = await getCategoriesNamesIdsTotalProducts();

    const jsonCategories = JSON.stringify(categories);

    await redis.set("catalog_categories", jsonCategories);


    return categories
  } catch (error: any) {
    throw new Error(`Error creating categories catalog cache: ${error.message}`)
  }
}

export async function fetchAndCreateFilterSettingsCache() {
  try {
    const data = await getFilterSettingsAndDelay();

    const jsonCategories = JSON.stringify(data);

    await redis.set("filter_settings", jsonCategories);


    return data
  } catch (error: any) {
    throw new Error(`Error creating filter settings cache: ${error.message}`)
  }
}


export const fetchCatalogWithCache = cache(
    unstable_cache(
      async () => {
        const { data, categories, filterSettingsData } = await fetchCatalog();
        return { data, categories, filterSettingsData };
      },
      ['fetchCatalog'],
      { 
        tags: ["catalog-data"],
      }
    )
);