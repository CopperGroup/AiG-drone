"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/lib/types/types";
import CategoryCard from '@/components/cards/CategoryCard';
import Pagination from '@/components/shared/Pagination';

type SortOption = 'name' | 'totalProducts' | 'totalValue' | 'averagePrice';

const ITEMS_PER_PAGE = 9;

export default function CategoryCardList({ categories }: { categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCategories = categories.filter(item =>
    item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.category.name.localeCompare(b.category.name);
      case 'totalProducts':
        return b.values.totalProducts - a.values.totalProducts;
      case 'totalValue':
        return b.values.totalValue - a.values.totalValue;
      case 'averagePrice':
        return b.values.averageProductPrice - a.values.averageProductPrice;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  return (
    <div ref={containerRef} className="py-20">
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="totalProducts">Total Products</SelectItem>
            <SelectItem value="totalValue">Total Value</SelectItem>
            <SelectItem value="averagePrice">Average Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-6 mt-20 pb-20 max-[1800px]:grid-cols-3 max-[1250px]:grid-cols-2 max-[650px]:grid-cols-1">
        {paginatedCategories.map((category, index) => (
          <CategoryCard key={index} categoryInfo={category} />
        ))}
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        scrollToTheTop={true}
        containerRef={containerRef}
      />
    </div>
  );
}

