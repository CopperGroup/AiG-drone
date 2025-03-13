"use server";

import Product from "../models/product.model"
import { connectToDB } from "../mongoose"
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Value from "../models/value.model";
import { CategoryType, CreateUrlParams, ProductType } from "../types/types";
import { clearCatalogCache } from "./redis/catalog.actions";
import Order from "../models/order.model";
import clearCache from "./cache";
import Category from "../models/category.model";
import { updateCategories } from "./categories.actions";
import { ObjectId } from "mongoose";

interface CreateParams {
    _id?: string,
    id: string,
    name: string,
    quantity: number,
    images: string[],
    url: string,
    price: number,
    priceToShow: number,
    vendor: string,
    category?: string,
    description: string,
    isAvailable: boolean,
    articleNumber?: string,
    params?: {
        name: string,
        value: string
    }[],
    customParams?: {
        name: string,
        value:string,
    }[]
}


interface InterfaceProps {
    productId: string,
    email: string,
    path: string,
}

const DELETEDPRODUCT_ID = "67081c925bb87b6f68d83c50";

export async function createUrlProduct({ id, name, isAvailable, quantity, url, priceToShow, price, images, vendor, description, articleNumber, params, isFetched, category }: CreateUrlParams){
    try {
        connectToDB();
        
        const createdProduct = await Product.create({
            id: id,
            name: name,
            isAvailable: isAvailable,
            quantity: quantity,
            url: url,
            priceToShow: priceToShow,
            price: price,
            images: images,
            vendor: vendor,
            description: description,
            params: params,
            articleNumber: articleNumber,
            isFetched: isFetched,
            category: category ? category : "No-category"
        })

        clearCache("createProduct")
    } catch (error: any) {
        throw new Error(`Error creating url-product, ${error.message}`)
    }
}

export async function createUrlProductsMany(products: CreateUrlParams[]) {
    try {
      connectToDB();
  
      const createdProducts = await Product.insertMany(products);

      await updateCategories(createdProducts, "create")
  
      clearCache("createProduct");
    } catch (error: any) {
      throw new Error(`Error creating url-product, ${error.message}`);
    }
  }
  

export async function updateUrlProductsMany(products: Partial<CreateUrlParams>[]) {
    try {
        await connectToDB();

        const bulkOperations = products.map(product => ({
            updateOne: {
                filter: { _id: product._id },
                update: { $set: product },
            },
        }));

        await Product.bulkWrite(bulkOperations);

        const updatedProducts = await Product.find({ _id: { $in: products.map(product => product._id)}});

        await updateCategories(updatedProducts, "update")
        clearCache("createProduct");
    } catch (error: any) {
        throw new Error(`Error updating url-products in bulk, ${error.message}`);
    }
}

export async function createProduct(params: CreateParams): Promise<ProductType>;
export async function createProduct(params: CreateParams, type: "json"): Promise<string>;

export async function createProduct({ id, name, quantity, images, url, priceToShow, price, vendor, category, articleNumber, description, isAvailable, customParams }: CreateParams, type?: "json"): Promise<ProductType | string>{
    try {
        connectToDB();
        
        const createdProduct = await Product.create({
            id: id,
            name: name,
            images: images,
            quantity: quantity,
            url: url,
            price: price,
            priceToShow: priceToShow,
            category: category ? category : "",
            vendor: vendor,
            description: description,
            articleNumber: articleNumber || "",
            isAvailable: isAvailable,
            params: customParams || []
        })

        await createdProduct.save();

        await clearCatalogCache();

        clearCache("createProduct");

        if(type === "json") {
            return JSON.stringify(createdProduct)
        } else {
            return createdProduct;
        }
    } catch (error: any) {
        throw new Error(`Error creating new product, ${error.message}`)
    }
}

export async function updateUrlProduct({_id, id, name, isAvailable, quantity, url, priceToShow, price, images, vendor, description, params, isFetched, category }: CreateUrlParams){
    try {
        connectToDB();
        
        const product = await Product.findByIdAndUpdate(_id, {
            id: id,
            name: name,
            isAvailable: isAvailable,
            quantity: quantity,
            url: url,
            priceToShow: priceToShow,
            price: price,
            images: images,
            vendor: vendor,
            description: description,
            params: params,
            isFetched: isFetched,
            category: category ? category : "No-category"
        })
        
        clearCache("updateProduct")

        
        //console.log(product);
    } catch (error: any) {
        throw new Error(`Error creating url-product, ${error.message}`)
    }
}

export async function deleteUrlProducts(){
    try {
        connectToDB();

        await Product.deleteMany({ isFetched: true});

        clearCache("deleteProduct")
    } catch (error: any) {
        throw new Error(`Error deleting fetched products, ${error.message}`)
    }
}

export async function fetchUrlProducts(type?: "json"){
    try {
        connectToDB();
        
        const urlProducts = await Product.find({_id: {$ne: DELETEDPRODUCT_ID}, isFetched: true });

        if(type === "json"){
            return JSON.stringify(urlProducts)
        } else{
            return urlProducts;
        }
    } catch (error: any) {
        throw new Error(`Error finding url-added products: ${error.message}`)
    }
}

export async function fetchAllProducts() {
    try {
        connectToDB();
        
        const fetchedProducts = await Product.find({ _id: { $ne: DELETEDPRODUCT_ID }, isAvailable: true, quantity: { $gt: 0 } })
        .populate({
            path: 'likedBy',
            model: User,
            select: "_id email"
        })
        return fetchedProducts

    } catch (error:any) {
        throw new Error(`Error fetching all available products, ${error.message}`)
    }
}

export async function fetchProducts(){
    try {
        connectToDB();

        const products = await Product.find({ _id: { $ne: DELETEDPRODUCT_ID } });
        
        return products
    } catch (error:any) {
        throw new Error(`Error fetching products, ${error.message}`)
    }
}

export async function fetchProductById(_id: string): Promise<ProductType>;
export async function fetchProductById(_id: string, type: "json"): Promise<string>;

export async function fetchProductById( _id: string, type?: "json") {
    try {
        const product = await Product.findById(_id);

        if(!product) {
            throw new Error(`Product not found`);
        }
        if(type === "json") {
            return JSON.stringify(product);
        } else {
            return product;
        }
    } catch (error: any) {
        throw new Error(`Error fetching product by _id: ${error.message}`)
    }
}
export async function fetchLastProducts() {
    try {
        connectToDB();
        

        const last12Products = await Product.find({ _id: { $ne: DELETEDPRODUCT_ID }, isAvailable: true })
        .populate({
            path: 'likedBy',
            model: User,
            select: "_id email"
        })
        .sort({ _id: -1 }) // Сортуємо за спаданням _id (останні додані товари будуть першими)
        .limit(12); // Обмежуємо результат до 12 товарів
        

        return last12Products;

    } catch (error:any) {
        throw new Error(`Error fetching all available products, ${error.message}`)
    }
}



export async function addLike({ productId, email, path }: InterfaceProps) {
    try {
        connectToDB();
        
        const product = await Product.findOne({id:productId});
        if(email) {
            const currentUser = await User.findOne({ email: email }); 

            const isLiked = product.likedBy.includes(currentUser._id);

            if(isLiked) {
                await product.likedBy.pull(currentUser._id);
                await currentUser.likes.pull(product._id);
            } else {
                await product.likedBy.push(currentUser._id);
                await currentUser.likes.push(product._id);
            }
    
    
            await product.save();
            await currentUser.save();

            revalidatePath(path);
            revalidatePath(`/liked/${currentUser._id}`);
        }

        clearCache("likeProduct")
    } catch (error: any) {
        throw new Error(`Error adding like to the product, ${error.message}`)
    }
}

export async function fetchLikedProducts(userId: string){
    try {
        connectToDB();

        const likedProducts = await Product.find({ isAvailable: true, likedBy: userId })
            .populate({
                path: 'likedBy',
                model: User,
                select: "_id email"
            })

        return likedProducts;
    } catch (error: any) {
        throw new Error(`Error fecthing liked posts, ${error.message}`)
    }
}

export async function getProductsProperities(productId: string, type?: "json") {
    try {
        connectToDB();

        const products = await Product.find({});
        const product = await Product.findOne({ _id: productId });

        let allCategories: { [key: string]: number } = {};

        for(const product of products) {

            if(product.category){
                if(!allCategories[`${product.category}`]) {
                    allCategories[`${product.category}`] = 0
                }
        
                allCategories[`${product.category}`] = product.id;
            }
        }

        const categories = Object.entries(allCategories).map(([name, amount]) => ({
            name,
            amount,
        }))

        if(type === "json") {
            return JSON.stringify({
            properities: [
                { name: "_id", value: product._id},
                { name: "id", value: product.id }, 
                { name: "name", value: product.name }, 
                { name: "price", value: product.price.toString() }, 
                { name: "priceToShow",  value: product.priceToShow.toString() }, 
                { name: "description", value: product.description }, 
                { name: "url", value: product.url }, 
                { name: "quantity", value: product.quantity.toString() }, 
                { name: "category", value: product.category }, 
                { name: "vendor", value: product.vendor },
                { name: "images", value: product.images },
                { name: "isAvailable", value: product.isAvailable }
            ], 
            params: product.params,
            categories: categories
        })
        } else {
            return {
                properities: [
                    { name: "id", value: productId }, 
                    { name: "name", value: product.name }, 
                    { name: "price", value: product.price.toString() }, 
                    { name: "priceToShow",  value: product.priceToShow.toString() }, 
                    { name: "description", value: product.description }, 
                    { name: "url", value: product.url }, 
                    { name: "quantity", value: product.quantity.toString() }, 
                    { name: "category", value: product.category }, 
                    { name: "vendor", value: product.vendor },
                    { name: "images", value: product.images },
                    { name: "isAvailable", value: product.isAvailable }
                ], 
                params: product.params,
                categories: categories
            }
        }
    } catch (error: any) {
        throw new Error(`Error fetching product properities: ${error.message}`)
    }
}


export async function editProduct(params: CreateParams): Promise<ProductType>;
export async function editProduct(params: CreateParams, type: "json"): Promise<string>;

export async function editProduct({ _id, name, quantity, images, url, priceToShow, price, vendor, category, description, isAvailable, articleNumber, customParams }: CreateParams, type?: 'json') {
    try {
        // Connect to the database
        await connectToDB();

        // Define the update object
        const update = {
            name,
            quantity,
            images,
            url,
            priceToShow,
            price,
            vendor,
            category: category || "",
            description,
            isAvailable,
            articleNumber: articleNumber || "",
            params: customParams ? customParams.map(param => ({ name: param.name, value: param.value })) : []
        };

        // Update the product using findOneAndUpdate
        const updatedProduct = await Product.findOneAndUpdate({ _id }, update, { new: true });

        if (!updatedProduct) {
            throw new Error(`No product found with id ${_id}`);
        }

        // Clear the cache
        await clearCatalogCache();
        clearCache("updateProduct");

        // Return the updated product
        if (type === "json") {
            return JSON.stringify(updatedProduct);
        } else {
            return updatedProduct;
        }
    } catch (error: any) {
        throw new Error(`Error updating product: ${error.message}`);
    }
}


export async function productAddedToCart(id: string) {
    try {
        connectToDB();

        const product = await Product.findById(id);

        await product.addedToCart.push(Date.now())

        await product.save();

        //console.log(product);

        clearCache("addToCart")
    } catch (error: any) {
        throw new Error(`Error adding prduct to cart: ${error.message}`)
    }
}

export async function findAllProductsCategories(type?: "json") {
  try {
    connectToDB();

    let allCategories: { [key: string]: number } = {};

    const products = await Product.find({});

    for(const product of products) {

        if(product.category){
            if(!allCategories[`${product.category}`]) {
                allCategories[`${product.category}`] = 0
            }
    
            allCategories[`${product.category}`] = product.id;
        }
    }

    const categories = Object.entries(allCategories).map(([name, amount]) => ({
        name,
        amount,
    }))

    //console.log("Categories", allCategories);

    if(type === "json") {
        return JSON.stringify(categories);
    } else {
        return categories
    }
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}

export async function deleteManyProducts(_ids: string[], cache?: "keep-catalog-cache") {
    try {
        connectToDB();

        // Find products by their IDs
        const products = await Product.find({ _id: { $in: _ids}});

        if (!products.length) {
            throw new Error("No products found for deletion");
        }

        // Loop over the products to handle likes and orders before deletion
        for (const product of products) {
            const usersWhoLikedProduct = await User.find({ _id: { $in: product.likedBy }});

            if (usersWhoLikedProduct) {
                for (const user of usersWhoLikedProduct) {
                    user.likes.pull(product._id);
                    await user.save();
                }
            }

            const orders = await Order.find({ 'products.product': product._id });

            for (const order of orders) {
                for (const orderedProduct of order.products) {
                    orderedProduct.product = DELETEDPRODUCT_ID;
                }

                await order.save();
            }

            // Delete the product
            await Product.deleteOne({ _id: product._id });
        }

        if (!cache) {
            await clearCatalogCache();
        } else {
            console.log("Catalog cache cleared.");
        }

        console.log("Deleted products")
        clearCache("deleteProduct");

    } catch (error: any) {
        throw new Error(`Error deleting products: ${error.message}`);
    }
}


export async function deleteProduct(id: { productId: string} | {product_id: string}, cache?: "keep-catalog-cache") {
  try {
    connectToDB();

    console.log("Deleting")
    if(id){
        const productId = "productId" in id ? id.productId : id.product_id;
        const searchParam = "productId" in id ? "id" : "_id";

        let product;

        if(searchParam === "id") {
            product = await Product.findOne({ id: productId });
        } else if (searchParam === "_id") {
            product = await Product.findOne({ _id: productId });
        }

        // console.log("Product", product);
    
        if(product){
            
            const usersWhoLikedProduct = await User.find({ _id: { $in: product.likedBy }});
        
            if(!product) {
                throw new Error("Product not found");
            }
        
            //console.log("Liked by", usersWhoLikedProduct);
        
            if(usersWhoLikedProduct){
                for(const user of usersWhoLikedProduct) {
                    user.likes.pull(product._id);
            
                    await user.save();
                }
            }

            await updateCategories([product], "delete")
        
            const orders = await Order.find({ 'products.product': product._id })

            for(const order of orders) {
                for(const orderedProduct of order.products) {
                    orderedProduct.product = DELETEDPRODUCT_ID;

                    //console.log("Product", orderedProduct)
                }

                
                await order.save();
            }

            // for(let category of categories) {

            //     console.log("Category products: ", category.products);
            //     category.products = category.products.filter((categoryProductId: ObjectId) => categoryProductId.toString() !== product._id.toString())
            //     console.log("Category products: ", category.products);

            //     await category.save()
            // }

            if(searchParam === "id") {
                await Product.deleteOne({ id: productId });
            } else if(searchParam === "_id") {
                await Product.deleteOne({ _id: productId })
            }
        
            if(!cache){
                await clearCatalogCache();
            } else {
                console.log("Catalog cache cleared.");
            }
            
            clearCache("deleteProduct")
        }
    }
  } catch (error: any) {
    throw new Error(`Error deleting product: ${id} ${error.message}`)
  }
}

export async function findProductCategory(product: ProductType): Promise<CategoryType>;
export async function findProductCategory(product: ProductType, type: "json"): Promise<string>;

export async function findProductCategory(product: ProductType, type?: "json"): Promise<CategoryType | string> {
    try {
        const categories = await Category.find({ name: product.category });

        let category = { _id: "", name: "", products: [], totalValue: 0 };

        if (categories.length !== 0) {
            for (const cat of categories) {
                if (cat.products.includes(product._id)) {
                    category = cat;
                    break;
                }
            }
        }

        if (type === "json") {
            return JSON.stringify(category);
        } else {
            return category;
        }
    } catch (error: any) {
        throw new Error(`Error finding product's category: ${error.message}`);
    }
}

type ParamDifference = {
  [paramName: string]: Array<{ _id: string; value: string }>;
};

export async function fetchProductAndRelevantParams(
  currentProductId: string,
  key: keyof ProductType,
  splitChar?: string,
  index?: number,
): Promise<{ product: ProductType; selectParams: ParamDifference }> {
  try {
    connectToDB();

    const currentProduct = await Product.findById(currentProductId);
    if (!currentProduct || typeof currentProduct[key] !== "string") {
      throw new Error("Current product not found or key is not a string");
    }

    let valueToCompare = currentProduct[key] as string;
    if (splitChar && index !== undefined) {
      const splitParts = valueToCompare.split(splitChar);
      valueToCompare = splitParts[index === -1 ? splitParts.length - 1 : index] ?? valueToCompare;
    }

    // Find products with the same base value (excluding the current product)
    const similarProducts = await Product.find({
      [key]: new RegExp(valueToCompare.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      isAvailable: true,
    });

    const paramCounts: Record<string, Set<string>> = {};

    for (const product of [currentProduct, ...similarProducts]) {
      if (product.params && Array.isArray(product.params)) {
        for (const param of product.params) {
          if (!paramCounts[param.name]) {
            paramCounts[param.name] = new Set();
          }
          paramCounts[param.name].add(param.value);
        }
      }
    }
    
    const paramDifferences: ParamDifference = {};
    
    // Keep only params with more than one unique value
    for (const [paramName, values] of Object.entries(paramCounts)) {
      if (values.size > 1) {
        paramDifferences[paramName] = Array.from(values).map((value) => ({
          _id: similarProducts.find((p) =>
            p.params?.some((param: { name: string; value: string; }) => param.name === paramName && param.value === value)
          )?._id.toString() || currentProduct._id.toString(),
          value,
        }));
      }
    }
    

    return {
      product: currentProduct,
      selectParams: paramDifferences,
    };
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}


export async function fetchPreviewProduct({ param }: { param: string }): Promise<ProductType>;
export async function fetchPreviewProduct({ param }: { param: string }, type: 'json'): Promise<string>;

export async function fetchPreviewProduct({ param }: { param: string }, type?: 'json') {
   try {
    connectToDB();

    const [category, paramName] = param.split("&");

    console.log(category, paramName)
    const products = await Product.find({
      category,
      params: {
        $elemMatch: { name: paramName }
      }
    });

    if(type === 'json'){
      return JSON.stringify(products[0])
    } else {
      return products[0]
    }
   } catch (error: any) {
     throw new Error(`Error finding preview product: ${error.message}`)
   }
}