"use client";

import { createUrlProductsMany } from "@/lib/actions/product.actions";
import React, { useState } from "react";

interface Product {
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

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const handleClick = async () => {
    try {
      const response = await fetch("/api/readJSON");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log(data);
      setProducts(data);

      await createUrlProductsMany(data)
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Convert Products</button>
    </div>
  );
};

export default Page;
