"use client"

import React from "react"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Search, ChevronDown, ChevronRight, GripVertical, X, FolderClosed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Store } from "@/constants/store"

// Type definitions
interface Category {
  name: string
  _id: string
  products: string[]
  totalValue: number
  subCategories: string[]
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
  isRoot: boolean
  path: string[]
  totalProducts: number // Total products including all subcategories
}

interface CategoryManagerProps {
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}

// DnD item types
const ItemTypes = {
  CATEGORY: "category",
}

// Draggable category component - using React.memo for performance
const DraggableCategory = React.memo(function DraggableCategory({
  category,
  depth = 0,
  parentId = null,
  moveCategory,
  expandedCategories,
  searchTerm,
  toggleExpand,
  highlightMatch,
  setDraggedCategoryId,
  isDescendantOf,
  categories,
  Store,
}: {
  category: CategoryWithChildren
  depth?: number
  parentId?: string | null
  moveCategory: (categoryId: string, sourceParentId: string | null, targetParentId: string | null) => void
  expandedCategories: Record<string, boolean>
  searchTerm: string
  toggleExpand: (categoryId: string) => void
  highlightMatch: (text: string) => React.ReactNode
  setDraggedCategoryId: React.Dispatch<React.SetStateAction<string | null>>
  isDescendantOf: (potentialChildId: string, parentId: string, cats: Category[]) => boolean
  categories: Category[]
  Store: any
}) {
  const isExpanded = !!expandedCategories[category._id]

  // Set up drag source
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: ItemTypes.CATEGORY,
      item: () => {
        // Set the dragged category ID and handle the "begin" logic here
        setDraggedCategoryId(category._id)
        return { id: category._id, parentId }
      },
      end: () => {
        setDraggedCategoryId(null)
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [category._id, parentId, setDraggedCategoryId],
  )

  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.CATEGORY,
      canDrop: (item: { id: string; parentId: string | null }) => {
        // Prevent dropping onto self or descendants
        return item.id !== category._id && !isDescendantOf(category._id, item.id, categories)
      },
      drop: (item: { id: string; parentId: string | null }) => {
        moveCategory(item.id, item.parentId, category._id)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [category._id, categories, moveCategory, isDescendantOf],
  )

  // Combine drag and drop refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    if (!el) return
    drag(el)
    drop(el)
  }

  // Only render children if expanded (for performance)
  const renderChildren = isExpanded && category.children.length > 0

  return (
    <div
      // @ts-ignore
      ref={dragPreview}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${depth > 0 ? "ml-6 pl-2 border-l border-gray-200" : ""}`}
    >
      <div
        ref={dragDropRef}
        className={`
          flex items-center gap-2 p-2 rounded-md 
          ${isOver && canDrop ? "bg-green-50 border border-green-200" : ""}
          ${isOver && !canDrop ? "bg-red-50 border border-red-200" : ""}
          ${!isOver ? "hover:bg-gray-50" : ""}
          ${searchTerm && category.name.toLowerCase().includes(searchTerm.toLowerCase()) ? "bg-yellow-50" : ""}
        `}
      >
        <div className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <button
          onClick={() => toggleExpand(category._id)}
          className="p-0.5 rounded-sm hover:bg-gray-200 focus:outline-none"
          type="button"
        >
          {category.children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 text-base-medium">{highlightMatch(category.name)}</div>

        <Badge variant="outline" className="text-subtle-medium">
          {category.totalProducts} товарів
        </Badge>

        {category.totalValue && (
          <Badge variant="secondary" className="text-subtle-medium">
            {Store.currency_sign}
            {category.totalValue}
          </Badge>
        )}
      </div>

      {renderChildren && (
        <div className="mt-1">
          {category.children.map((child) => (
            <DraggableCategory
              key={child._id}
              category={child}
              depth={depth + 1}
              parentId={category._id}
              moveCategory={moveCategory}
              expandedCategories={expandedCategories}
              searchTerm={searchTerm}
              toggleExpand={toggleExpand}
              highlightMatch={highlightMatch}
              setDraggedCategoryId={setDraggedCategoryId}
              isDescendantOf={isDescendantOf}
              categories={categories}
              Store={Store}
            />
          ))}
        </div>
      )}
    </div>
  )
})

// Fix the FloatingDropArea component to ensure canDrop always returns a boolean
function FloatingDropArea({
  draggedCategoryId,
  categories,
  moveCategory,
}: {
  draggedCategoryId: string | null
  categories: Category[]
  moveCategory: (categoryId: string, sourceParentId: string | null, targetParentId: string | null) => void
}) {
  // Set up drop target
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: ItemTypes.CATEGORY,
      canDrop: (item: { id: string; parentId: string | null }) => {
        // Ensure we return a boolean
        return (
          item.parentId !== null &&
          !!draggedCategoryId &&
          // Check if the dragged category is not already a root category
          categories.some((cat) => cat.subCategories.includes(draggedCategoryId))
        )
      },
      drop: (item: { id: string; parentId: string | null }) => {
        if (item.parentId) {
          moveCategory(item.id, item.parentId, null)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [moveCategory, draggedCategoryId, categories],
  )

  // Only render if we have a dragged category that's not already a root category
  if (!draggedCategoryId) return null

  const draggedCategory = categories.find((cat) => cat._id === draggedCategoryId)
  if (!draggedCategory) return null

  const isAlreadyRoot = !categories.some((cat) => cat.subCategories.includes(draggedCategoryId))
  if (isAlreadyRoot) return null

  return (
    <div
      // @ts-ignore
      ref={dropRef}
      className={`fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 border-2 border-dashed 
        ${isOver && canDrop ? "border-green-300 bg-green-50" : "border-primary"} 
        animate-pulse cursor-pointer`}
    >
      <p className="text-small-medium">Перетягніть сюди, щоб винести &quot;{draggedCategory.name}&quot; на верхній рівень</p>
    </div>
  )
}

export default function CategoryStructureManager({ categories, setCategories }: CategoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Check if potentialChild is a descendant of parent (to prevent circular references)
  const isDescendantOf = useCallback((potentialChildId: string, parentId: string, cats: Category[]): boolean => {
    const parent = cats.find((cat) => cat._id === parentId)
    if (!parent) return false

    if (parent.subCategories.includes(potentialChildId)) return true

    return parent.subCategories.some((subId) => isDescendantOf(potentialChildId, subId, cats))
  }, [])

  // Move a category to a new parent
  const moveCategory = useCallback(
    (categoryId: string, sourceParentId: string | null, targetParentId: string | null) => {
      setCategories((prevCategories) => {
        const newCategories = [...prevCategories]

        // Find the category to move
        const categoryToMove = newCategories.find((cat) => cat._id === categoryId)
        if (!categoryToMove) return prevCategories

        // Check if the category is already in the target parent's subCategories
        if (targetParentId) {
          const targetParent = newCategories.find((cat) => cat._id === targetParentId)
          if (targetParent && targetParent.subCategories.includes(categoryId)) {
            // Category is already a child of the target parent, no need to move
            return prevCategories
          }
        }

        // Remove from source parent's subCategories
        if (sourceParentId) {
          const sourceParent = newCategories.find((cat) => cat._id === sourceParentId)
          if (sourceParent) {
            sourceParent.subCategories = sourceParent.subCategories.filter((id) => id !== categoryId)
          }
        }

        // Add to target parent's subCategories
        if (targetParentId) {
          const targetParent = newCategories.find((cat) => cat._id === targetParentId)
          if (targetParent) {
            // Prevent circular references and duplicates
            if (
              categoryId !== targetParentId &&
              !isDescendantOf(targetParentId, categoryId, newCategories) &&
              !targetParent.subCategories.includes(categoryId)
            ) {
              targetParent.subCategories.push(categoryId)
            }
          }
        }

        console.log("Category structure after move:", JSON.stringify(newCategories, null, 2))
        return newCategories
      })
    },
    [setCategories, isDescendantOf],
  )

  // Memoize the calculation of total products to improve performance
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}

    // Calculate total products for a category (including all subcategories)
    const calculateTotalProducts = (categoryId: string): number => {
      // If we've already calculated this category's total, return it
      if (totals[categoryId] !== undefined) return totals[categoryId]

      const category = categories.find((cat) => cat._id === categoryId)
      if (!category) return 0

      // Start with this category's own products
      let total = category.products.length

      // Add products from all subcategories recursively
      for (const subCatId of category.subCategories) {
        total += calculateTotalProducts(subCatId)
      }

      // Cache the result
      totals[categoryId] = total

      return total
    }

    // Calculate totals for all categories
    categories.forEach((category) => {
      calculateTotalProducts(category._id)
    })

    return totals
  }, [categories])

  // Transform flat categories into hierarchical structure with total products
  const hierarchicalCategories = useMemo(() => {
    // Create a map of all categories by ID for quick lookup
    const categoryMap = new Map<string, CategoryWithChildren>()

    // Initialize the map with all categories
    categories.forEach((category) => {
      categoryMap.set(category._id, {
        ...category,
        children: [],
        isRoot: true, // Initially mark all as root
        path: [category._id],
        totalProducts: categoryTotals[category._id] || category.products.length,
      })
    })

    // Build the hierarchy by adding children to their parents
    categories.forEach((category) => {
      if (category.subCategories.length > 0) {
        category.subCategories.forEach((subCategoryId) => {
          const subCategory = categoryMap.get(subCategoryId)
          if (subCategory) {
            // Add as child to parent
            const parent = categoryMap.get(category._id)
            if (parent) {
              parent.children.push({
                ...subCategory,
                path: [...parent.path, subCategory._id],
              })
            }

            // Mark as non-root since it's a child of another category
            subCategory.isRoot = false
          }
        })
      }
    })

    // Return only root categories
    return Array.from(categoryMap.values()).filter((category) => category.isRoot)
  }, [categories, categoryTotals])

  // Check if a category or any of its descendants match the search
  const categoryMatches = useCallback((category: CategoryWithChildren, searchLower: string): boolean => {
    if (category.name.toLowerCase().includes(searchLower)) return true
    return category.children.some((child) => categoryMatches(child, searchLower))
  }, [])

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return hierarchicalCategories

    const searchLower = searchTerm.toLowerCase()

    // Filter root categories
    return hierarchicalCategories.filter((category) => categoryMatches(category, searchLower))
  }, [hierarchicalCategories, searchTerm, categoryMatches])

  // Expand parent categories of matching search results
  useEffect(() => {
    if (!searchTerm) return

    const searchLower = searchTerm.toLowerCase()
    const newExpanded = { ...expandedCategories }
    let hasChanges = false

    const expandMatchingPaths = (category: CategoryWithChildren) => {
      if (category.name.toLowerCase().includes(searchLower)) {
        // Expand all parent categories in the path
        category.path.forEach((id, index) => {
          if (index < category.path.length - 1 && !newExpanded[id]) {
            newExpanded[id] = true
            hasChanges = true
          }
        })
      }

      category.children.forEach(expandMatchingPaths)
    }

    filteredCategories.forEach(expandMatchingPaths)

    // Only update state if there are changes to avoid unnecessary renders
    if (hasChanges) {
      setExpandedCategories(newExpanded)
    }
  }, [searchTerm, filteredCategories, expandedCategories])

  // Toggle category expansion
  const toggleExpand = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }, [])

  // Collapse all categories
  const collapseAll = useCallback(() => {
    setExpandedCategories({})
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  // Highlight text that matches search
  const highlightMatch = useCallback(
    (text: string) => {
      if (!searchTerm) return text

      try {
        const parts = text.split(new RegExp(`(${searchTerm})`, "gi"))
        return (
          <>
            {parts.map((part, i) =>
              part.toLowerCase() === searchTerm.toLowerCase() ? (
                <span key={i} className="bg-yellow-200">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </>
        )
      } catch (e) {
        return text
      }
    },
    [searchTerm],
  )

  // Root drop area for making categories top-level
  const [{ isOver: isRootOver, canDrop: canRootDrop }, rootDropRef] = useDrop(
    () => ({
      accept: ItemTypes.CATEGORY,
      canDrop: (item: { id: string; parentId: string | null }) => {
        return item.parentId !== null
      },
      drop: (item: { id: string; parentId: string | null }) => {
        if (item.parentId) {
          moveCategory(item.id, item.parentId, null)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [moveCategory],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 h-10 text-base-regular"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={collapseAll} className="flex items-center gap-2">
          <FolderClosed className="h-4 w-4" />
          <span>Згорнути все</span>
        </Button>
      </div>

      <div className="text-small-semibold text-gray-500 mb-2">Перетягуйте, щоб змінити структуру</div>

      <Separator className="my-4" />

      <ScrollArea className="h-[500px] pr-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <DraggableCategory
                key={category._id}
                category={category}
                depth={0}
                parentId={null}
                moveCategory={moveCategory}
                expandedCategories={expandedCategories}
                searchTerm={searchTerm}
                toggleExpand={toggleExpand}
                highlightMatch={highlightMatch}
                setDraggedCategoryId={setDraggedCategoryId}
                isDescendantOf={isDescendantOf}
                categories={categories}
                Store={Store}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No categories match your search" : "No categories found"}
            </div>
          )}
        </div>

        <div
          // @ts-ignore
          ref={rootDropRef}
          className={`
            mt-4 p-3 border-2 border-dashed rounded-lg text-center
            ${isRootOver && canRootDrop ? "border-green-300 bg-green-50" : "border-gray-300"}
          `}
        >
          <p className="text-small-medium text-gray-500">Перетягніть сюди, щоб винести на верхній рівень</p>
        </div>
      </ScrollArea>

      <FloatingDropArea draggedCategoryId={draggedCategoryId} categories={categories} moveCategory={moveCategory} />
    </div>
  )
}

