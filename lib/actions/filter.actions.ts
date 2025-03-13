"use server";

import Filter from "../models/filter.model";
import { connectToDB } from "../mongoose";
import { CategoryType, CreateFilterProps, FilterSettingsData, FilterSettingsParamsType, FilterType } from "../types/types";
import { clearCatalogCache } from "./redis/catalog.actions";

export async function fetchFilter(): Promise<FilterType>;
export async function fetchFilter(type: 'json'): Promise<string>;

export async function fetchFilter(type?: 'json') {
   try {
    connectToDB()

    const filter = await Filter.findOne();
      
    if(type === 'json'){
      return JSON.stringify(filter)
    } else {
      return filter
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function createFilter(categoriesObject: CreateFilterProps, delay: number): Promise<FilterType>;
export async function createFilter(categoriesObject: CreateFilterProps, delay: number, type: 'json'): Promise<string>;

export async function createFilter(categoriesObject: CreateFilterProps, delay: number, type?: 'json') {
  try {
    await connectToDB();

    const constructFilterCategories = (data: CreateFilterProps) => {
      return Object.entries(data).map(([categoryId, categoryData]) => ({
        categoryId,
        params: Object.values(categoryData.params).map(param => ({
          name: param.name,
          totalProducts: param.totalProducts,
          type: param.type,
        })),
      }));
    };

    const categories = constructFilterCategories(categoriesObject);

    // Ensure only one filter exists
    let filter = await Filter.findOne(); // Check if a filter document exists

    if (filter) {
      // Update the existing filter
      filter.categories = categories;
      filter.delay = delay;
      await filter.save();
    } else {
      // Create a new filter if none exists
      filter = await Filter.create({ categories, delay });
    }

    clearCatalogCache();
    return type === 'json' ? JSON.stringify(filter) : filter;
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}




type PopulatedFilter = Omit<FilterType, "categories"> & {
  categories: {
    categoryId: CategoryType;
    params: FilterType["categories"][number]["params"];
  }[];
};

export async function getFilterSettingsAndDelay(): Promise<{ filterSettings: FilterSettingsData, delay: number}>;
export async function getFilterSettingsAndDelay(type: 'json'): Promise<string>;

export async function getFilterSettingsAndDelay(type?: 'json') {
   try {

    const filter: PopulatedFilter | null = await Filter.findOne().populate("categories.categoryId").exec();

    const result: FilterSettingsData = {};

    if(filter) {
        // Iterate through each category in the filter
        for (const category of filter.categories) {
            if (!category.categoryId) continue; // Ensure category exists after population

            const categoryId = category.categoryId._id; // Get category name
            const totalProducts = category.categoryId.products.length; // Get category's total products count

            // Build params object
            const params: { [paramName: string]: FilterSettingsParamsType } = {};
            category.params.forEach(param => {
                params[param.name] = {
                    totalProducts: param.totalProducts,
                    type: param.type
                };
            });

            // Store in result
            result[categoryId] = { params, totalProducts };
        }
    }

    const response = { filterSettings: result, delay: filter?.delay || 250 };

    if(type === 'json'){
      return JSON.stringify(response)
    } else {
      return response
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}