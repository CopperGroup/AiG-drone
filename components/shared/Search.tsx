"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "use-debounce"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "@/app/(root)/context"
import { trackFacebookEvent } from "@/helpers/pixel"

type SortParams = "default" | "low_price" | "hight_price"

const Search = ({ initialSearchText = "" }: {initialSearchText: string }) => {
  const { catalogData, setCatalogData } = useAppContext()
  const [sort, setSort] = useState<SortParams>(catalogData.sort)
  const [searchText, setSearchText] = useState<string>(initialSearchText)
  const [debounce] = useDebounce(searchText, 0)

  useEffect(() => {
    setCatalogData({ ...catalogData, search: debounce, sort: sort })

    if (searchText.trim() != "") {
      trackFacebookEvent("Search", {
        search_string: debounce,
      })
    }
  }, [debounce, sort])

  return (
    <div className="flex flex-col sm:flex-row w-full gap-4 items-center">
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <Input
          value={catalogData.search}
          onChange={(e) => setCatalogData((prev: any) => ({ ...prev, search: e.target.value }))}
          placeholder="Знайдіть товар"
          className="pl-10 border-gray-200 focus:border-gray-300 h-10 rounded-md"
        />
      </div>

      <Select value={sort} onValueChange={(element: SortParams) => setSort(element)}>
        <SelectTrigger className="w-full sm:w-[180px] h-10 border-gray-200 focus:border-gray-300 rounded-md">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="default">Звичайне</SelectItem>
            <SelectItem value="low_price">Ціна (від низької до високої)</SelectItem>
            <SelectItem value="hight_price">Ціна (від високої до низької)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default Search

