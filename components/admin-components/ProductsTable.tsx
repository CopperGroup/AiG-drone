'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DeleteProductsButton from '../interface/DeleteProductsButton'

interface Product {
  _id: string,
  id: string;
  vendor: string;
  name: string;
  isAvailable: boolean;
  price: number;
  priceToShow: number;
  category: string;
  articleNumber: string;
}

const ITEMS_PER_PAGE = 10;

const ProductsTable = ({ stringifiedProducts }: { stringifiedProducts: string }) => {
  const products: Product[] = useMemo(() => JSON.parse(stringifiedProducts), [stringifiedProducts]);
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const router = useRouter();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = product[searchField as keyof Product];
      if (typeof searchValue === 'boolean') {
        return inputValue.toLowerCase() === searchValue.toString();
      }
      return searchValue.toString().toLowerCase().includes(inputValue.toLowerCase());
    });
  }, [products, searchField, inputValue]);

  const paginatedProducts = useMemo(() => {
    const start = (pageNumber - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, pageNumber]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setPageNumber(1);
  }, [searchField, inputValue]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UAH',
  });

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(product => product._id)));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 w-full sm:w-auto">
                <Input
                  className="w-full text-base-regular"
                  placeholder={`Search by ${searchField}...`}
                  onChange={(e) => setInputValue(e.target.value)}
                  value={inputValue}
                />
              </div>
              <Select onValueChange={(value) => setSearchField(value)}>
                <SelectTrigger className="w-full sm:w-[200px] text-base-regular">
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="id">ID</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="isAvailable">Is Available</SelectItem>
                    <SelectItem value="articleNumber">Article</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <DeleteProductsButton selectedIds={Array.from(selectedProducts)} onDeleteComplete={() => setSelectedProducts(new Set())}/>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-body-semibold">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedProducts.size === products.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Постачальник</TableHead>
                    <TableHead>Назва</TableHead>
                    <TableHead>Доступний</TableHead>
                    <TableHead className="text-right">Ціна без знижки</TableHead>
                    <TableHead className="text-right">Ціна із знижкою</TableHead>
                    <TableHead>Артикул</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow 
                      key={product._id} 
                      className="cursor-pointer hover:bg-slate-50 transition-all text-base-regular"
                      onClick={() => router.push(`/admin/createProduct/list/${product._id}`)}
                    >
                      <TableCell className="font-medium" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProducts.has(product._id)}
                          onCheckedChange={() => toggleProductSelection(product._id)}
                        />
                      </TableCell>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.vendor}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.isAvailable ? 'Так' : 'Ні'}</TableCell>
                      <TableCell className="text-right">{formatter.format(product.price)}</TableCell>
                      <TableCell className={`text-right ${product.priceToShow < product.price ? 'text-red-600' : ''}`}>
                        {formatter.format(product.priceToShow)}
                      </TableCell>
                      <TableCell>{product.articleNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
          disabled={pageNumber === 1}
          variant="outline"
        >
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Page {pageNumber} of {totalPages}
        </p>
        <Button
          onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
          disabled={pageNumber === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-base-regular text-muted-foreground">
          Showing {((pageNumber - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(pageNumber * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
        </p>
      </div>

    </div>
  )
}

export default ProductsTable

