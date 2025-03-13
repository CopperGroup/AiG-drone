"use server";

import { ObjectId } from "mongoose";
import Category from "../models/category.model";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { CategoriesParams, CategoryType, ProductType } from "../types/types";
import clearCache from "./cache";
import { clearCatalogCache } from "./redis/catalog.actions";
import { deleteProduct } from "./product.actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Filter from "../models/filter.model";

export async function updateCategories(
  products: ProductType[],
  productOperation: "create" | "update" | "delete"
) {
  try {
    connectToDB();

    // Fetch all existing categories only when necessary
    const existingCategories = await Category.find();
    const categoryMap = new Map(
      existingCategories.map((cat) => [cat.name, cat])
    );

    // To track changes for recalculation
    const categoriesToUpdate: Record<
      string,
      { productIds: string[]; totalValue: number }
    > = {};

    for (const product of products) {
      const newCategoryName = product.category; // Updated category

      if (productOperation === "create") {
        // For "create", simply add the product to its category
        if (!categoriesToUpdate[newCategoryName]) {
          const existingCategory = categoryMap.get(newCategoryName);
          categoriesToUpdate[newCategoryName] = {
            productIds: existingCategory ? [...existingCategory.products] : [],
            totalValue: existingCategory ? existingCategory.totalValue : 0,
          };
        }

        const newCategory = categoriesToUpdate[newCategoryName];
        if (!newCategory.productIds.includes(product._id)) {
          newCategory.productIds.push(product._id);
          newCategory.totalValue += product.priceToShow || 0;
        }

        continue; // Skip the rest of the loop for "create"
      }

      // For "update" and "delete" operations, handle old categories
      for (const [categoryName, category] of categoryMap.entries()) {
        if (category.products.includes(product._id)) {
          if (categoryName !== newCategoryName || productOperation === "delete") {
            // Remove product from the old category
            category.products = category.products.filter(
              (id: string) => id.toString() !== product._id.toString()
            );

            const remainingProducts = await Product.find({
              _id: { $in: category.products },
            });

            category.totalValue = remainingProducts.reduce(
              (sum, prod) => sum + (prod.priceToShow || 0),
              0
            );

            // Track the changes for this category
            categoriesToUpdate[categoryName] = {
              productIds: category.products,
              totalValue: category.totalValue,
            };
          }
        }
      }

      // Add the product to the new category for "update"
      if (!categoriesToUpdate[newCategoryName]) {
        const existingCategory = categoryMap.get(newCategoryName);
        categoriesToUpdate[newCategoryName] = {
          productIds: existingCategory ? [...existingCategory.products] : [],
          totalValue: existingCategory ? existingCategory.totalValue : 0,
        };
      }

      const newCategory = categoriesToUpdate[newCategoryName];
      if (productOperation === "update") {
        if (!newCategory.productIds.includes(product._id)) {
          newCategory.productIds.push(product._id);

          // Recalculate totalValue for this category
          const categoryProducts = await Product.find({
            _id: { $in: newCategory.productIds },
          });
          newCategory.totalValue = categoryProducts.reduce(
            (sum, prod) => sum + (prod.priceToShow || 0),
            0
          );
        }
      }
    }

    for (const categoryName in categoriesToUpdate) {
      const category = categoriesToUpdate[categoryName];
      category.productIds = Array.from(
        new Set(category.productIds.map((id) => id.toString()))
      );
    }

    // Perform database updates
    const categoryOps = Object.entries(categoriesToUpdate).map(
      async ([name, { productIds, totalValue }]) => {
        if (categoryMap.has(name)) {
          // Update existing category
          await Category.updateOne(
            { name },
            { products: productIds, totalValue }
          );
        } else if (productOperation === "create" || productOperation === "update") {
          // Create a new category
          await Category.create({ name, products: productIds, totalValue });
        }
      }
    );

    await Promise.all(categoryOps);

    // Clear cache if relevant
    clearCatalogCache();
    clearCache(["updateCategory", "updateProduct"]);
  } catch (error: any) {
    throw new Error(
      `Error updating categories with products: ${error.message}`
    );
  }
}

export async function fetchAllCategories(): Promise<CategoryType[]>;
export async function fetchAllCategories(type: 'json'): Promise<string>;

export async function fetchAllCategories(type?: 'json') {
   try {
      
    connectToDB();

    const allCategories = await Category.find();

    if(type === 'json'){
      return JSON.stringify(allCategories)
    } else {
      return allCategories
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function fetchCategoriesProperties() {
  try {
    connectToDB();

    // const skip = (page - 1) * limit;

    // const query = search
    //   ? { name: { $regex: search, $options: "i" } }
    //   : {};

    const categories = await Category.find()
      .populate("products")

    const categoriesList = categories.map((category) => {
      const totalProducts = category.products.length;
      const totalValue = category.totalValue || 0; // Use the existing `totalValue` field
      const averageProductPrice =
        totalProducts > 0 ? parseFloat((totalValue / totalProducts).toFixed(2)) : 0;

      return {
        category: {name: category.name, _id: category._id.toString()},
        values: {
          totalProducts,
          totalValue,
          averageProductPrice,
          stringifiedProducts: JSON.stringify(category.products),
        },
      };
    });

    return categoriesList;
  } catch (error: any) {
    throw new Error(`Error fetching categories properties: ${error.message}`);
  }
}

export async function fetchCategory({ categoryId }: { categoryId: string }) {
  try {
    connectToDB();

    // Fetch the category by its ID and populate its products
    const categoryData = await Category.findById(categoryId).populate("products");

    if (!categoryData) {
      throw new Error("Category not found");
    }

    const products = categoryData.products;
    const category = {
      _id: categoryData._id,
      categoryName: categoryData.name,
      totalProducts: 0,
      totalValue: 0,
      averageProductPrice: 0,
      averageDiscountPercentage: 0,
    };

    let totalPriceWithoutDiscount = 0;

    for (const product of products) {
      category.totalProducts += 1;
      category.totalValue += product.priceToShow;
      totalPriceWithoutDiscount += product.price;
    }

    category.averageProductPrice =
      category.totalProducts !== 0 ? category.totalValue / category.totalProducts : 0;

    category.averageDiscountPercentage = 100 - parseInt(
      (
        (totalPriceWithoutDiscount !== 0
          ? category.totalValue / totalPriceWithoutDiscount
          : 0) * 100
      ).toFixed(0)
    );

    return { ...category, stringifiedProducts: JSON.stringify(products) };
  } catch (error: any) {
    throw new Error(`Error fetching category: ${error.message}`);
  }
}

export async function setCategoryDiscount({categoryId, percentage}: {categoryId: string, percentage: number}) {
  try {
    connectToDB();

    // Fetch the category by its ID and populate its products

    console.log(percentage)
    const category = await Category.findById(categoryId).populate("products");

    if (!category) {
      throw new Error("Category not found");
    }

    const products = category.products;
    let totalValue = 0;
    for (const product of products) {
      const priceWithDiscount = product.price - product.price * (percentage / 100);
      product.priceToShow = priceWithDiscount;

      totalValue += priceWithDiscount
      await product.save();
    }

    category.totalValue = totalValue;

    await category.save();
    // Clear the cache after updating product prices
    await clearCatalogCache();
    clearCache(["updateCategory", "updateProduct"]);

  } catch (error: any) {
    throw new Error(`Error changing discount for all the products in the category: ${error.message}`);
  }
}

export async function changeCategoryName({ categoryId, newName }: { categoryId: string, newName: string }) {
  try {
    connectToDB();

    // Find the category by its _id
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    // Update the category name
    category.name = newName;
    await category.save();

    // Update the category name in all associated products
    await Product.updateMany(
      { _id: { $in: category.products } }, // Find products linked to this category
      { $set: { category: newName } } // Update their category name
    );

    await clearCatalogCache();

    clearCache(["updateCategory","updateProduct"]);
  } catch (error: any) {
    throw new Error(`Error changing category's name: ${error.message}`);
  }
}

export async function moveProductsToCategory({
  initialCategoryId,
  targetCategoryId,
  productIds,
}: {
  initialCategoryId: string;
  targetCategoryId: string;
  productIds: string[];
}) {
  try {
    connectToDB();

    const initialCategory = await Category.findById(initialCategoryId).populate("products");
    if (!initialCategory) {
      throw new Error(`Initial category with ID ${initialCategoryId} not found`);
    }

    const targetCategory = await Category.findById(targetCategoryId);
    if (!targetCategory) {
      throw new Error(`Target category with ID ${targetCategoryId} not found`);
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { category: targetCategory.name } }
    );

    targetCategory.products.push(...productIds);

    await targetCategory.save();

    const populatedTargetCategory = await Category.findById(targetCategoryId).populate("products");

    populatedTargetCategory.totalValue = populatedTargetCategory.products.reduce((sum: number, product: ProductType) => sum + product.priceToShow, 0)

    await populatedTargetCategory.save();
    
    initialCategory.products = initialCategory.products.filter(
      (product: ProductType) => !productIds.includes(product._id.toString())
    );

    initialCategory.totalValue = initialCategory.products.reduce((sum: number, product: ProductType) => sum + (product.priceToShow || 0), 0)

    await initialCategory.save();

    await targetCategory.save();

    await clearCatalogCache();
    clearCache(["updateCategory", "updateProduct"]);
    revalidatePath(`/admin/categories/edit/${initialCategoryId}`)
  } catch (error: any) {
    throw new Error(`Error moving products to another category: ${error.message}`);
  }
}

export async function getCategoriesNamesAndIds(): Promise<{ name: string; categoryId: string; }[]> {
  try {
    connectToDB();

    const categories = await Category.find();

    const categoriesNamesAndIdsArray = categories.map(category => ({ name: category.name, categoryId: category._id.toString()}))

    return categoriesNamesAndIdsArray
  } catch (error: any) {
    throw new Error(`Error fetching all categories names an _ids: ${error.message}`)
  }
}

export async function getCategoriesNamesIdsTotalProducts(): Promise<{ name: string; categoryId: string; totalProducts: number}[]> {
  try {
    connectToDB();

    const categories = await Category.find();

    const categoriesNamesAndIdsArray = categories.map(category => ({ name: category.name, categoryId: category._id.toString(), totalProducts: category.products.length}))

    return categoriesNamesAndIdsArray
  } catch (error: any) {
    throw new Error(`Error fetching all categories names an _ids: ${error.message}`)
  }
}

export async function createNewCategory({ name, products, previousCategoryId }: { name: string, products: ProductType[], previousCategoryId?: string }) {
  try {
    connectToDB();

    const productIds = products.map(product => product._id);

    if(previousCategoryId) {
      const previousCategory = await Category.findById(previousCategoryId).populate("products");

      previousCategory.products = previousCategory.products.filter(
        (product: ProductType) => !productIds.includes(product._id.toString())
      );

      previousCategory.totalValue = previousCategory.products.reduce((sum: number, product: ProductType) => sum + product.priceToShow, 0)
      
      await previousCategory.save();

      revalidatePath(`/admin/categories/edit/${previousCategoryId}`)
    }

    const totalValue = products.reduce((sum, product) => sum + (product.priceToShow || 0), 0);

    const createdCategory = await Category.create({
      name,
      totalValue,
      products: productIds
    })

    clearCatalogCache();
    clearCache(["createCategory", "updateProduct"]);
  } catch (error: any) {
    throw new Error(`Error creating new category: ${error.message}`)
  }
}

type DeleteCategoryProps = {
  categoryId: string;
  removeProducts: boolean
};

export async function deleteCategory(props: DeleteCategoryProps) {
  try {
      await connectToDB();

      const category = await Category.findById(props.categoryId).populate("products");

      if (!category) {
          throw new Error("Category not found.");
      }

      const productIds: string[] = category.products.map((product: any) => product._id.toString());

      if (props.removeProducts) {
          for (const productId of productIds) {
              await deleteProduct({ product_id: productId });
          }
      }

      // Exclude category from filter
      await Filter.updateOne(
          { "categories.categoryId": props.categoryId },
          { $pull: { categories: { categoryId: props.categoryId } } }
      );

      // Delete category
      await Category.findByIdAndDelete(props.categoryId);

      // Clear cache
      await clearCatalogCache();
      clearCache(["deleteCategory", "updateProduct"]);

  } catch (error: any) {
      throw new Error(`Error deleting category: ${error.message}`);
  }
}


export async function fetchCategoriesProducts(categoryId: string, type?: 'json') {
  try {
    // Connect to the database
    await connectToDB();

    // Find the category by _id
    const category = await Category.findById(categoryId).populate('products');

    if (!category) {
      throw new Error('Category not found');
    }

    const products = category.products;

    // Return the products in the specified format
    if (type === 'json') {
      return JSON.stringify(products);
    } else {
      return products;
    }
  } catch (error: any) {
    throw new Error(`Error fetching category products: ${error.message}`);
  }
}


export async function fetchCategoriesParams(): Promise<CategoriesParams>;
export async function fetchCategoriesParams(type: 'json'): Promise<string>;

export async function fetchCategoriesParams(type?: 'json') {
  try {
      await connectToDB();
      
      const categories = await Category.find().populate("products");
      
      const result = categories.reduce((acc, category) => {
          const totalProducts = category.products.length;
          const paramCounts: Record<string, number> = {};
          
          category.products.forEach((product: ProductType) => {
              product.params.forEach(param => {
                  const key = param.name;
                  if (!paramCounts[key]) {
                      paramCounts[key] = 0;
                  }
                  paramCounts[key] += 1;
              });
          });
          
          acc[category._id] = {
              name: category.name,
              totalProducts,
              params: Object.entries(paramCounts).map(([name, totalProducts]) => ({ name, totalProducts, type: ""}))
          };
          
          return acc;
      }, {});

      return type === 'json' ? JSON.stringify(result) : result;
  } catch (error: any) {
      throw new Error(`${error.message}`);
  }
}