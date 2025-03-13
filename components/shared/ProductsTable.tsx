import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductType } from "@/lib/types/types"
import { Store } from "@/constants/store"


interface ProductsTableProps {
  stringifiedProducts: string
  categoryName: string
  selectedProducts: Set<string>
  onSelectionChange: (props: { selectType: "select-one" | "select-all", productId?: string, productIds?: string[] }) => void
}

export default function ProductsTable({ stringifiedProducts, categoryName, selectedProducts, onSelectionChange }: ProductsTableProps) {
  const products: ProductType[] = JSON.parse(stringifiedProducts)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 10
  const totalPages = Math.ceil(products.length / productsPerPage)

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[500px] overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] px-2 sm:w-[100px] sm:px-4">
                <Checkbox
                  checked={selectedProducts.size === products.length}
                  onCheckedChange={() => onSelectionChange({ selectType: "select-all", productIds: products.map(p => p._id) })}
                />
              </TableHead>
              <TableHead className="px-2 sm:px-4">Name</TableHead>
              <TableHead className="px-2 sm:px-4">Price</TableHead>
              <TableHead className="px-2 sm:px-4">Discount Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="px-2 sm:px-4">
                  <Checkbox
                    checked={selectedProducts.has(product._id)}
                    onCheckedChange={() => onSelectionChange({ selectType: "select-one", productId: product._id })}
                  />
                </TableCell>
                <TableCell className="px-2 sm:px-4 font-medium">
                  <div className="truncate max-w-[150px] sm:max-w-none">{product.name}</div>
                </TableCell>
                <TableCell className="px-2 sm:px-4">{Store.currency_sign}{product.price.toFixed(2)}</TableCell>
                <TableCell className={`px-2 sm:px-4 ${product.price !== product.priceToShow ? "text-red-500" : ""}`}>{Store.currency_sign}{product.priceToShow.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

