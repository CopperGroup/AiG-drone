
import { getProductsData } from "@/lib/cpConverter";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productUrls = url.searchParams.getAll('url');  // Changed to get all 'url' params

  if (productUrls.length === 0) {
    return NextResponse.json({ error: "URL query parameter is missing" }, { status: 400 });
  }

  try {
    const products = await getProductsData(productUrls);  // Fetch data for all URLs

    if (products.length === 0) {
      return NextResponse.json({ error: "Failed to fetch product data" }, { status: 500 });
    }

    return NextResponse.json(products);  // Return all products data
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
