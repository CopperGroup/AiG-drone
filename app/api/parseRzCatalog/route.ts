import { scrapeProductLinks } from "@/lib/scrape";

export async function POST(req: Request): Promise<Response> {
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "No URL provided" }), { status: 400 });
    }

    const links = await scrapeProductLinks(url);
    return new Response(JSON.stringify({ links }), { status: 200 });
  } catch (error) {
    console.error("Scraping error:", error);
    return new Response(JSON.stringify({ error: "Scraping failed" }), { status: 500 });
  }
}
