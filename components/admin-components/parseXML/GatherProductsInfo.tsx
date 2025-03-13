"use client";

import { columns } from "@/app/admin/fetchUrl/columns";
import { DataTable } from "@/app/admin/fetchUrl/data-table";
import { useState, useEffect } from 'react';
import { Skeleton } from "../../ui/skeleton";
import axios from "axios";
import Connector from "../../interface/connector/Connector";
import getProductsData from "@/lib/xml-parser/fetchProducts";
import { useXmlParser } from "@/app/admin/context";
import { Config } from "@/lib/types/types";

interface Product {
    id: string | null;
    name: string | null;
    isAvailable: boolean;
    quantity: number;
    url: string | null;
    priceToShow: number;
    price: number;
    images: (string | null)[];
    vendor: string | null;
    description: string | null;
    params: {
      name: string | null;
      value: string | null;
    }[];
    isFetched: boolean;
}

const url = ""

export default function GatherProductsInfo() {
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [isFetching, setIsFetching] = useState(false)

    const { xmlString } = useXmlParser()

    useEffect(() => {
        setIsFetching(true);

        const fetchData = async () => {
            try {
                // const products = await axios.post("/api/getProducts", { url })

                const configurator = JSON.parse(sessionStorage.getItem("configurator") || "")
            

                const products = getProductsData(xmlString || "", configurator as unknown as Config)

                console.log("products")
                console.log(products)
                setFetchedProducts(products as Product[]);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, []);

    if(isFetching){
        return(
            <div className="w-full">
                <div className="flex items-center py-4">
                    <Skeleton className="w-11/12 h-10"/>
                    <Skeleton className="w-1/12 h-10"/>
                </div>
                <div className="h-[700px]">
                    <Skeleton className="w-full h-full"/>
                </div>
                <div className="w-full flex justify-between pt-4">
                    <Skeleton className="w-72 h-10"/>
                    <div className="flex gap-2">
                        <Skeleton className="w-32 h-10"/>
                        <Skeleton className="w-32 h-10"/>
                        <Skeleton className="w-32 h-10"/>
                    </div>
                </div>
            </div>
        );
    } else {
        // @ts-ignore
        return  (<><h2 className="text-heading2-bold mt-4 mb-6">Перенесіть отримані товари</h2><DataTable columns={columns} data={fetchedProducts} /></>)
        ;
    }
}
