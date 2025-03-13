"use client"

import type React from "react"
import { useState, useMemo, type RefObject, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Search, ArrowUpDown, MoreHorizontal, BarChart2 } from "lucide-react"
import AdminProductCard from "../../cards/AdminProductCard"
import type { ProductType, ReadOnly } from "@/lib/types/types"
import Pagination from "../../shared/Pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import Link from "next/link"
import AnimatedNumber from "@/components/shared/AnimatedNumber"
import { Store } from "@/constants/store"

interface CategoryPageProps {
  _id: string
  categoryName: string
  totalProducts: number
  totalValue: number
  averageProductPrice: number
  averageDiscountPercentage: number
  stringifiedProducts: string
}

type ContainerRefType<T extends HTMLElement> = RefObject<T>

const CategoryPage: React.FC<CategoryPageProps> = (props: ReadOnly<CategoryPageProps>) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const containerRef = useRef(null)

  const products = useMemo(() => JSON.parse(props.stringifiedProducts), [props.stringifiedProducts])

  const filteredAndSortedProducts: ProductType[] = useMemo(() => {
    return products
      .filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a: any, b: any) => {
        if (sortBy === "name") {
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        } else if (sortBy === "price") {
          return sortOrder === "asc" ? a.price - b.price : b.price - a.price
        } else {
          return sortOrder === "asc" ? a.likedBy.length - b.likedBy.length : b.likedBy.length - a.likedBy.length
        }
      })
  }, [products, searchTerm, sortBy, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const pageNumber = Math.ceil(filteredAndSortedProducts.length / 12)

  return (
    <div className="pb-12">
      <Card className="mb-8 shadow-lg rounded-2xl">
        <CardHeader className="text-heading2-bold flex flex-row items-center justify-between max-[600px]:text-heading3-bold">
          <CardTitle className="text-heading2-bold text-primary">{props.categoryName}</CardTitle>
          <div className="flex gap-3 max-[520px]:hidden">
            <Link
              href={`/admin/categories/edit/${props._id}`}
              className="flex items-center text-base-medium text-primary hover:text-primary/80 transition-colors duration-200"
            >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
            </Link>
            <Link
              href={`/admin/categories/edit/${props._id}`}
              className="flex items-center text-base-medium text-red-500 hover:text-red-600 transition-colors duration-200"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
            </Link>
          </div>
          <div className="min-[521px]:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                  <MoreHorizontal className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white mr-12" side="bottom" sideOffset={10}>
                <DropdownMenuItem>
                  <Link href={`/admin/categories/edit/${props._id}`} className="w-full flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 hover:text-red-600">
                  <Link href={`/admin/categories/edit/${props._id}`} className="w-full flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Products" value={props.totalProducts} />
            <StatCard title="Total Value" value={props.totalValue} prefix={Store.currency_sign} />
            <StatCard title="Average Price" value={props.averageProductPrice} prefix={Store.currency_sign} />
            <StatCard title="Average Discount" value={props.averageDiscountPercentage} suffix="%" />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-md rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2 relative">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full text-base-regular"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] text-base-regular">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={toggleSortOrder} className="text-base-medium">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={containerRef} className="grid gap-6 mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAndSortedProducts.slice((currentPage - 1) * 12, currentPage * 12).map((product: ProductType) => (
          <AdminProductCard
            key={product.id}
            props={{
              _id: product._id,
              id: product.id,
              name: product.name,
              price: product.price,
              priceToShow: product.priceToShow,
              image: product.images[0],
              description: product.description,
              isAvailable: product.isAvailable,
              likes: product.likedBy.length,
            }}
          />
        ))}
      </div>

      <Pagination
        className="mt-12"
        totalPages={pageNumber}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        scrollToTheTop={true}
        containerRef={containerRef}
      />
    </div>
  )
}

const StatCard: React.FC<{ title: string; value: number; prefix?: string; suffix?: string }> = ({
  title,
  value,
  prefix = "",
  suffix = "",
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-base-semibold text-gray-600 mb-2">{title}</h3>
    <p className="text-heading3-bold">
      {prefix}
      <AnimatedNumber number={Number.parseFloat(value.toFixed(2))} duration={2000} easingName="easeOutExpo" />
      {suffix}
    </p>
  </div>
)

export default CategoryPage

