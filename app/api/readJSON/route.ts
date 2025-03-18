import { convertJsonToProducts } from "@/lib/readJSONProducts";
import { NextResponse } from "next/server";

export async function GET() {
    const products = convertJsonToProducts();
    return NextResponse.json(products);
  }