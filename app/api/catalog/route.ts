import { NextResponse } from "next/server";
import { fetchCatalog } from "@/lib/actions/redis/catalog.actions";

export async function GET() {
  try {
    const catalog = await fetchCatalog();
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}
