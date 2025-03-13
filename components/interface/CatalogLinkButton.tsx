"use client";

import { useRouter } from 'next/navigation';
import React from 'react'

const CatalogLinkButton = ({ link, children }: { link:string, children: React.ReactNode }) => {
    const router = useRouter();

    return (
        <div onClick={() => router.push(link)}>
            {children}
        </div>
    )
}

export default CatalogLinkButton