'use client'

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useAppContext } from "@/app/(root)/context";
import { useRouter, useSearchParams } from "next/navigation";
import { createSearchString } from "@/lib/utils";

type Props = {
  maxPrice: number,
  minPrice: number,
  countOfPages: number
}

const PaginationForCatalog = ({ maxPrice, minPrice, countOfPages }: Props) => {
  const { catalogData, setCatalogData } = useAppContext();

  const search = useSearchParams();
  const searchParams = Object.fromEntries(search.entries());
  const page = parseFloat(searchParams.page) || 1;

  const router = useRouter();

  const setPage = (number: number) => {
    const searchString = createSearchString({
      pNumber: number.toString(), // Reset to page 1 on filter change
      sort: searchParams.sort || "default",
      categories: searchParams.categories ? searchParams.categories.split(",") : [],
      vendors: searchParams.vendor ? searchParams.vendor.split(',') : [],
      search: catalogData.search,
      price: [
        parseFloat(searchParams.minPrice || minPrice.toString()),
        parseFloat(searchParams.maxPrice || maxPrice.toString()),
      ],
      category: searchParams.category,
      selectParamsValues: searchParams.categories ? (searchParams.selectParams ? searchParams.selectParams.split(",") : []) : [],
      unitParamsValues: searchParams.categories ? (searchParams.unitParams ? searchParams.unitParams.split(",") : []) : [],
      minPrice,
      maxPrice,
    });

    router.push(`/catalog?${searchString}`);
  }

  return (
    <Pagination className='mt-14 w'>
      {countOfPages > 1 ? (
        <PaginationContent className="cursor-pointer">
          <PaginationItem className={page === 1 ? 'text-gray-600 pointer-events-none max-grid1:hidden' : 'max-md:hidden'}>
            <PaginationPrevious onClick={() => setPage(page - 1)} />
          </PaginationItem>

          {/* Ensure the first page and last pages are always shown */}
          {page > 2 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              {page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis className="w-fit p-0 m-0" />
                </PaginationItem>
              )}
            </>
          )}

          {/* Show pages before and after the current one */}
          {page > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(page - 1)}>
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink onClick={() => setPage(page)} isActive>
              {page}
            </PaginationLink>
          </PaginationItem>

          {page < countOfPages && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(page + 1)}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Show ellipsis if needed */}
          {page < countOfPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis className="w-fit p-0 m-0" />
            </PaginationItem>
          )}

          {/* Always show last page if it's not visible */}
          {page < countOfPages - 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(countOfPages)}>
                {countOfPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem className={page === countOfPages ? 'text-gray-600 pointer-events-none max-grid1:hidden' : 'max-md:hidden'}>
            <PaginationNext onClick={() => setPage(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      ) : (
        <div className="text-center mt-20 text-gray-600 text-[18px]">
          {countOfPages === 0 ? <p>Товару за вашим запитом не знайдено :(</p> : null}
        </div>
      )}
    </Pagination>
  );
}

export default PaginationForCatalog;
