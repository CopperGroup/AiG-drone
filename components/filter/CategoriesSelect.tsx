"use client"

import type React from "react"

import type { ReactNode } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "../ui/input"
import type { FilterCategoryType, PageFilterType } from "@/lib/types/types"
import { type Dispatch, type SetStateAction, useState, useMemo, useRef, useEffect } from "react"
import { Checkbox } from "../ui/checkbox"
import { ChevronDown, ChevronRight, Search, X } from "lucide-react"

type CategoriesSelectProps = {
  categories: FilterCategoryType[]
  filter: PageFilterType
  setFilter: Dispatch<SetStateAction<PageFilterType>>
}

// Define a clearer type for the original FilterCategoryType
interface OriginalFilterCategoryType {
  name: string
  categoryId: string
  totalProducts: number
  subCategories: string[] // This is an array of IDs
}

// Helper type for transformed categories with nested subcategories
interface CategoryWithSubCategories {
  name: string
  categoryId: string
  totalProducts: number
  subCategories: CategoryWithSubCategories[] // This is an array of objects
}

// Extended type with calculated total products
interface CategoryWithTotals extends CategoryWithSubCategories {
  calculatedTotalProducts: number
}

const CategoriesSelect = ({ categories, filter, setFilter }: CategoriesSelectProps): JSX.Element => {
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const categoriesContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  // Save scroll position before expanding/collapsing or selecting
  useEffect(() => {
    const container = categoriesContainerRef.current
    if (container) {
      const handleScroll = () => {
        scrollPositionRef.current = container.scrollTop
      }

      container.addEventListener("scroll", handleScroll)
      return () => {
        container.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Restore scroll position after expanding/collapsing
  useEffect(() => {
    const container = categoriesContainerRef.current
    if (container) {
      container.scrollTop = scrollPositionRef.current
    }
  }, [expandedCategories])

  // Restore scroll position after filter changes (category selection)
  useEffect(() => {
    const container = categoriesContainerRef.current
    if (container) {
      container.scrollTop = scrollPositionRef.current
    }
  }, [filter.categories])

  // Transform flat categories into hierarchical structure
  function transformCategories(categories: OriginalFilterCategoryType[]): CategoryWithSubCategories[] {
    const categoryObj: Record<string, CategoryWithSubCategories> = {}

    // Create category entries in the object
    categories.forEach((category) => {
      categoryObj[category.categoryId] = {
        name: category.name,
        categoryId: category.categoryId,
        totalProducts: category.totalProducts,
        subCategories: [],
      }
    })

    // Populate subcategories for each category
    categories.forEach((category) => {
      if (category.subCategories?.length > 0) {
        category.subCategories.forEach((subCategoryId) => {
          const subCategory = categoryObj[subCategoryId]
          if (subCategory) {
            categoryObj[category.categoryId].subCategories.push(subCategory)
          }
        })
      }
    })

    // Return only root categories (those that are not subcategories of any other category)
    return Object.values(categoryObj).filter((cat) => {
      return !categories.some((c) => c.subCategories.includes(cat.categoryId))
    })
  }

  // Calculate total products for a category including all its subcategories
  const calculateTotalProducts = (category: CategoryWithSubCategories): number => {
    let total = category.totalProducts

    if (category.subCategories && category.subCategories.length > 0) {
      category.subCategories.forEach((subCat) => {
        total += calculateTotalProducts(subCat)
      })
    }

    return total
  }

  // Add calculated total products to each category
  const addCalculatedTotals = (categories: CategoryWithSubCategories[]): CategoryWithTotals[] => {
    return categories.map((category) => {
      const calculatedTotalProducts = calculateTotalProducts(category)

      return {
        ...category,
        calculatedTotalProducts,
        subCategories: addCalculatedTotals(category.subCategories),
      }
    })
  }

  // Get all subcategory IDs recursively
  const getAllSubcategoryIds = (category: CategoryWithTotals | CategoryWithSubCategories): string[] => {
    const ids = [category.categoryId]

    if (category.subCategories && category.subCategories.length > 0) {
      category.subCategories.forEach((subCat) => {
        ids.push(...getAllSubcategoryIds(subCat))
      })
    }

    return ids
  }

  // Handle category selection/deselection with propagation to children
  const handleCategorySelect = (category: CategoryWithTotals, checked: boolean, event?: React.MouseEvent): void => {
    // Save current scroll position
    if (categoriesContainerRef.current) {
      scrollPositionRef.current = categoriesContainerRef.current.scrollTop
    }

    // Prevent event propagation if event is provided
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const allIds = getAllSubcategoryIds(category)

    setFilter((prevFilter) => {
      let newCategories: string[]

      if (checked) {
        // Add this category and all its subcategories
        const uniqueCategories = [...new Set([...prevFilter.categories, ...allIds])]
        newCategories = uniqueCategories
      } else {
        // Remove this category and all its subcategories
        newCategories = prevFilter.categories.filter((id) => !allIds.includes(id))
      }

      return {
        ...prevFilter,
        page: "1",
        categories: newCategories,
      }
    })
  }

  // Toggle category expansion
  const toggleCategory = (categoryId: string, event: React.MouseEvent): void => {
    // Save current scroll position
    if (categoriesContainerRef.current) {
      scrollPositionRef.current = categoriesContainerRef.current.scrollTop
    }

    // Prevent event propagation to avoid any default behaviors
    event.stopPropagation()

    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Expand all parent categories of matching search results
  const expandParentsOfMatches = (categories: CategoryWithTotals[], searchTerm: string): void => {
    const newExpanded: Record<string, boolean> = { ...expandedCategories }

    const checkAndExpandParents = (cats: CategoryWithTotals[]): boolean => {
      let hasMatch = false

      cats.forEach((cat) => {
        // Check if this category matches the search
        const matches = cat.name.toLowerCase().includes(searchTerm.toLowerCase())

        // Check if any subcategories match
        let subMatches = false
        if (cat.subCategories.length > 0) {
          subMatches = checkAndExpandParents(cat.subCategories as CategoryWithTotals[])
        }

        // If this category or any subcategories match, expand this category
        if (matches || subMatches) {
          newExpanded[cat.categoryId] = true
          hasMatch = true
        }
      })

      return hasMatch
    }

    checkAndExpandParents(categories)
    setExpandedCategories(newExpanded)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = e.target.value
    setCategorySearchTerm(searchTerm)

    if (searchTerm) {
      expandParentsOfMatches(categoriesWithTotals, searchTerm)
    }
  }

  // Clear search
  const clearSearch = (): void => {
    setCategorySearchTerm("")
  }

  // Filter categories based on search term
  const filterCategoriesBySearchTerm = (cats: CategoryWithTotals[]): CategoryWithTotals[] => {
    if (!categorySearchTerm) return cats

    return cats
      .filter((cat) => {
        const matchesSearch = cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
        const hasMatchingChildren =
          cat.subCategories.length > 0 &&
          filterCategoriesBySearchTerm(cat.subCategories as CategoryWithTotals[]).length > 0

        return matchesSearch || hasMatchingChildren
      })
      .map((cat) => ({
        ...cat,
        subCategories: filterCategoriesBySearchTerm(cat.subCategories as CategoryWithTotals[]),
      }))
  }

  // Transform categories
  const transformedCategories = useMemo<CategoryWithSubCategories[]>(
    () => transformCategories(categories as OriginalFilterCategoryType[]),
    [categories],
  )

  // Add calculated total products to each category
  const categoriesWithTotals = useMemo<CategoryWithTotals[]>(
    () => addCalculatedTotals(transformedCategories),
    [transformedCategories],
  )

  // Filter categories based on search
  const filteredCategories = useMemo<CategoryWithTotals[]>(
    () => (categorySearchTerm ? filterCategoriesBySearchTerm(categoriesWithTotals) : categoriesWithTotals),
    [categorySearchTerm, categoriesWithTotals],
  )

  // Calculate if a category is in indeterminate state
  const isIndeterminate = (category: CategoryWithTotals): boolean => {
    if (filter.categories.includes(category.categoryId)) return false

    const allSubIds = getAllSubcategoryIds(category).filter((id) => id !== category.categoryId)
    const someSelected = allSubIds.some((id) => filter.categories.includes(id))
    const allSelected = allSubIds.length > 0 && allSubIds.every((id) => filter.categories.includes(id))

    return someSelected && !allSelected
  }

  // Highlight text that matches search
  const highlightMatch = (text: string): ReactNode => {
    if (!categorySearchTerm) return text

    try {
      const regex = new RegExp(`(${categorySearchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
      const parts = text.split(regex)

      return (
        <>
          {parts.map((part, i) => {
            if (part.toLowerCase() === categorySearchTerm.toLowerCase()) {
              return (
                <span key={i} className="bg-yellow-200">
                  {part}
                </span>
              )
            }
            return part
          })}
        </>
      )
    } catch (e) {
      // Fallback in case of regex error
      return text
    }
  }

  // Recursive category component
  const CategoryItem = ({
    category,
    depth = 0,
  }: {
    category: CategoryWithTotals
    depth?: number
  }): JSX.Element => {
    const hasSubcategories = category.subCategories && category.subCategories.length > 0
    const isChecked = filter.categories.includes(category.categoryId)
    const indeterminate = isIndeterminate(category)
    const isExpanded = !!expandedCategories[category.categoryId]

    // Handle checkbox click with event
    const handleCheckboxClick = (e: React.MouseEvent) => {
      handleCategorySelect(category, !isChecked, e)
    }

    return (
      <div className="w-full">
        <div
          className={`flex items-center gap-1 py-1 px-1 rounded-md hover:bg-gray-50 ${
            categorySearchTerm && category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
              ? "bg-gray-50"
              : ""
          }`}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => toggleCategory(category.categoryId, e)}
              className="p-0.5 rounded-sm hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
              aria-label={isExpanded ? "Collapse category" : "Expand category"}
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasSubcategories && <div className="w-5" />}

          <div className="flex-1 flex items-center gap-2">
            <div onClick={handleCheckboxClick} className="cursor-pointer">
              <Checkbox
                id={category.categoryId}
                className="size-4 rounded-md border-neutral-600 data-[state=checked]:bg-black data-[state=checked]:text-white"
                checked={isChecked}
                data-state={indeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"}
                // Use a dummy handler since we're handling clicks at the wrapper level
                onCheckedChange={() => {}}
              />
            </div>
            <label
              htmlFor={category.categoryId}
              className="text-small-regular leading-none flex-1 cursor-pointer"
              onClick={handleCheckboxClick}
            >
              {highlightMatch(category.name)}
            </label>
            <span className="text-subtle-medium text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              {category.calculatedTotalProducts}
            </span>
          </div>
        </div>

        {hasSubcategories && isExpanded && (
          <div className="ml-5 pl-2 border-l border-gray-200">
            {(category.subCategories as CategoryWithTotals[]).map((subCategory) => (
              <CategoryItem key={subCategory.categoryId} category={subCategory} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Count selected categories
  const selectedCount = filter.categories.length

  return (
    <div className="mt-4 pb-4 w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3">
            <span className="flex items-center gap-2">
              Категорії
              {selectedCount > 0 && (
                <span className="text-subtle-medium font-normal bg-black text-white px-2 py-0.5 rounded-full">
                  {selectedCount}
                </span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2">
            <div className="relative mt-4 mb-3">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Пошук категорій..."
                value={categorySearchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 h-9 text-small-regular border rounded-lg focus-visible:ring-1 focus-visible:ring-black"
              />
              {categorySearchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-3 flex items-center"
                  aria-label="Clear search"
                  type="button"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div ref={categoriesContainerRef} className="max-h-[350px] overflow-y-auto pr-1 space-y-1">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => <CategoryItem key={category.categoryId} category={category} />)
              ) : (
                <div className="text-center py-4 text-gray-500">Категорії не знайдено</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default CategoriesSelect

