import { Store } from "@/constants/store";
import { fetchCatalog } from "@/lib/actions/redis/catalog.actions";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let filtredProducts: any[] = [];

    try {
        const response = await fetch(`${Store.domain}/api/catalog`, { cache: 'no-store' });
        if (response.ok) {
        filtredProducts = await response.json();
        } else {
        console.error("Failed to fetch catalog for sitemap.");
        }
    } catch (error) {
        console.error("Error fetching catalog:", error);
    }

  const productEntries: MetadataRoute.Sitemap = filtredProducts.map(({ _id }) => ({
    url: `${Store.domain}/catalog/${_id}`,
  }));

  return [
    {
      url: `${Store.domain}/`,
    },
    {
      url: `${Store.domain}/info/contacts`,
    },
    {
      url: `${Store.domain}/info/warranty-services`,
    },
    {
      url: `${Store.domain}/info/delivery-payment`,
    },
    ...productEntries,
  ];
}
