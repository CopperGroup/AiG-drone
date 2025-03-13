import fs from 'fs';
import path from 'path';
import { generateUniqueId } from './utils';

interface JSONProduct {
    id: string;
    name: string;
    isAvailable: boolean;
    quantity: number;
    url: string;
    priceToShow: number;
    price: number;
    images: string[];
    vendor: string;
    description: string;
    params: { name: string; value: string }[];
    articleNumber: string;
    category?: string;
    isFetched?: boolean;
  }
  
  export function convertJsonToProducts(pathToFile?: string): JSONProduct[] {
    try {
      console.log("Reading file")
      let jsonFilePath = "C:\\Users\\Користувач\\Downloads\\products5.json";
    
      // Ensure the file exists before reading
      if (!fs.existsSync(jsonFilePath)) {
        console.error("File not found:", jsonFilePath);
        return [];
      }

      const jsonData = fs.readFileSync(jsonFilePath, "utf-8");
      let products: JSONProduct[] = JSON.parse(jsonData);
      
      products = products.filter(p => p.name)
      
      const newProducts = products.map((product) => ({
        id: generateUniqueId(),
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
        isFetched: true,
        category: product.category || 'No-category',
      }));
  
      return newProducts;
    } catch (error) {
      console.error('Error reading or parsing JSON file:', error);
      return [];
    }
  }