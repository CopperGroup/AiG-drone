"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Percent, MoveRight, Pencil, BarChart, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ProductType, ReadOnly } from "@/lib/types/types"
import { Store } from "@/constants/store"
import AnimatedNumber from "@/components/shared/AnimatedNumber"
import { getTopProductsBySales } from "@/lib/utils"
import {
  changeCategoryName,
  createNewCategory,
  deleteCategory,
  getCategoriesNamesAndIds,
  moveProductsToCategory,
  setCategoryDiscount,
  updateCategories,
} from "@/lib/actions/categories.actions"
import ProductsTable from "@/components/shared/ProductsTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ConfirmDelete from "@/components/interface/ConfirmDelete"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/shared/SearchableSelect"

interface CategoryPageProps {
  _id: string
  categoryName: string
  totalProducts: number
  totalValue: number
  averageProductPrice: number
  averageDiscountPercentage: number
  stringifiedProducts: string
}

export default function EditCategoryPage(props: ReadOnly<CategoryPageProps>) {
  const [activeSection, setActiveSection] = useState<"main" | "rename" | "discount" | "move" | "delete-with-products" | "delete-and-move">("main")
  const [categoryName, setCategoryName] = useState(props.categoryName)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryId, setNewCategoryId] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState(props.averageDiscountPercentage.toString())
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [newCategory, setNewCategory] = useState(false)
  const [isDiscountInputFocused, setIsDiscountInputFocused] = useState(false)
  const [allCategories, setAllCategories] = useState<{ name: string; categoryId: string }[]>([])
  const products: ProductType[] = JSON.parse(props.stringifiedProducts)
  const topProducts = getTopProductsBySales(products)

  const [confirmationCategoryName, setConfirmationCategoryName] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [refetchAllCategories, setRefetchAllCategories] = useState(0)

  const router = useRouter()
  useEffect(() => {
    console.log("fetch")
    const fetchAllCategories = async () => {
      const result = await getCategoriesNamesAndIds()
      setAllCategories(result)
    }

    fetchAllCategories()
  }, [refetchAllCategories])

  const handleConfirmChangeName = async () => {
    try {
      setIsLoading(true)
      await changeCategoryName({ categoryId: props._id, newName: newCategoryName })
      setCategoryName(newCategoryName)
      setActiveSection("main")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmSetDiscount = async () => {
    try {
      setIsLoading(true)
      await setCategoryDiscount({ categoryId: props._id, percentage: parseFloat(discountPercentage) })
    } finally {
      setIsLoading(false)
    }
    setActiveSection("main")
  }

  const handleConfirmMoveProducts = async () => {
    try{
      setIsLoading(true)
      if (!newCategory) {
        if (newCategoryId) {
          await moveProductsToCategory({
            initialCategoryId: props._id,
            targetCategoryId: newCategoryId,
            productIds: products.filter((product) => Array.from(selectedProducts).includes(product._id)).map(p => p._id),
          })
        }
      } else {
        await createNewCategory({
          name: newCategoryName,
          products: products.filter((product) => Array.from(selectedProducts).includes(product._id)),
          previousCategoryId: props._id,
        })
      }
    } finally {
      setIsLoading(false)
    }
    setActiveSection("main")
    setRefetchAllCategories(prev => prev + 1)
  }

  const handleSelectionChange = (props: {
    selectType: "select-one" | "select-all"
    productId?: string
    productIds?: string[]
  }) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (props.selectType === "select-all" && props.productIds) {
        if (newSelected.size === props.productIds.length) {
          newSelected.clear()
        } else {
          props.productIds.forEach((id) => newSelected.add(id))
        }
      } else if (props.selectType === "select-one" && props.productId) {
        if (newSelected.has(props.productId)) {
          newSelected.delete(props.productId)
        } else {
          newSelected.add(props.productId)
        }
      }
      return newSelected
    })
  }

  const confirmDeleteWithProducts = async () => {
    try{
      setIsLoading(true)
      if (confirmationCategoryName === categoryName && deleteConfirmation === "delete") {
        await deleteCategory({ categoryId: props._id, removeProducts: true })
        setActiveSection("main")
        setDeleteConfirmation("")
      }
    } finally {
      setIsLoading(false)
      router.refresh()
      router.push('/admin/categories')
    }
  }

  const confirmDeleteAndMove = async () => {
    try {
      setIsLoading(true);
      if (confirmationCategoryName === categoryName && deleteConfirmation === "delete") {
        if (newCategory) {
          // Create new category and move products
          await createNewCategory({ name: newCategoryName, products: products, previousCategoryId: props._id })
        } else {
          // Move products to existing category
          // const targetCategoryId = allCategories.find((cat) => cat.name === newCategoryName)?.categoryId
          if (newCategoryId) {
            await moveProductsToCategory({
              initialCategoryId: props._id,
              targetCategoryId: newCategoryId,
              productIds: products.map((p) => p._id),
            })
          }
        }
        // Delete the current category
        await deleteCategory({ categoryId: props._id, removeProducts: false})
        setActiveSection("main")
        setDeleteConfirmation("")
      }
    } finally {
      setIsLoading(false)
      router.refresh()
      router.push('/admin/categories')
    }
  }


  const handleCancelDelete = () => {
    setActiveSection("main");
    setConfirmationCategoryName("");
    setDeleteConfirmation("");
  }

  return (
    <div className="min-h-screen pb-20">
      <h1 className="text-heading1-bold mb-8">Edit Category: {categoryName}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-heading3-bold">Category Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-base-semibold">Total Products:</span>
                <span className="text-base-medium">
                  <AnimatedNumber number={props.totalProducts} duration={2000} easingName="easeOutExpo" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-semibold">Average Price:</span>
                <span className="text-base-medium">
                  {Store.currency_sign}
                  <AnimatedNumber number={props.averageProductPrice} duration={2000} easingName="easeOutExpo" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-semibold">Total Sales:</span>
                <span className="text-base-medium">
                  <AnimatedNumber
                    number={products.reduce((sum: number, product: ProductType) => sum + product.orderedBy.length, 0)}
                    duration={2000}
                    easingName="easeOutExpo"
                  />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-heading3-bold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topProducts.map((product) => (
                <li key={product.id} className="flex justify-between items-center">
                  <span className="text-base-semibold truncate mr-2">{product.name}</span>
                  <span className="text-small-medium text-gray-600 whitespace-nowrap">
                    {product.orderedBy.length} sales
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {activeSection === "main" && (
        <div className="grid gap-3 grid-cols-3 max-[1350px]:grid-cols-2 max-[750px]:grid-cols-1">
          {[
            {
              title: "Rename category",
              description: "Change the category name",
              icon: Pencil,
              onClick: () => setActiveSection("rename"),
              color: "text-gray-800",
            },
            {
              title: "Set category discount",
              description: "Apply a discount to all products",
              icon: Percent,
              onClick: () => setActiveSection("discount"),
              color: "text-gray-800",
            },
            {
              title: "Move products",
              description: "Relocate products",
              icon: MoveRight,
              onClick: () => setActiveSection("move"),
              color: "text-gray-800",
            },
            {
              title: "Delete category and products",
              description: "Remove this category and products",
              icon: Trash2,
              onClick: () => setActiveSection("delete-with-products"),
              color: "text-red-500 hover:text-red-700",
            },
            {
              title: "Delete category",
              description: "Delete category and move products",
              icon: MoveRight,
              onClick: () => setActiveSection("delete-and-move"),
              color: "text-red-500 hover:text-red-700",
            },
          ].map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`h-full py-4 px-4 justify-start text-left bg-white hover:bg-gray-100 ${action.color} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-start w-full`}
            >
              <div className="flex items-center w-full mb-2">
                <span className="text-base-semibold font-semibold flex-grow pr-2">{action.title}</span>
                <action.icon className="w-5 h-5 flex-shrink-0" />
              </div>
              <p className="text-small-regular text-gray-600">{action.description}</p>
            </Button>
          ))}
        </div>
      )}
      {activeSection === "rename" && (
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-heading3-bold">Rename Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newCategoryName" className="text-base-semibold mb-2 block">
                New Category Name
              </Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
                className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setActiveSection("main")} className="text-base-medium" disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleConfirmChangeName} className="text-base-medium text-white" disabled={loading}>
                {loading ? 
                <>
                  <span>In progress</span>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> 
                </>
                : "Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "discount" && (
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-heading3-bold">Set Category Discount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="discountPercentage" className="text-base-semibold mb-2 block">
                Discount Percentage
              </Label>
              <Input
                id="discountPercentage"
                value={isDiscountInputFocused ? discountPercentage : `${discountPercentage}%`}
                onChange={(e) => {
                  const inputValue = e.target.value.replace("%", "")
                  let numericValue = Number.parseFloat(inputValue)
                  if (isNaN(numericValue)) {
                    numericValue = 0
                  } else {
                    numericValue = Math.max(0, Math.min(100, numericValue))
                  }
                  setDiscountPercentage(numericValue.toFixed(0))
                }}
                onFocus={() => setIsDiscountInputFocused(true)}
                onBlur={() => setIsDiscountInputFocused(false)}
                placeholder="Enter discount percentage"
                className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                disabled={loading}
              />
            </div>
            <div>
              <Label className="text-base-semibold mb-2 block">Discount Preview</Label>
              <Progress value={100 - parseFloat(discountPercentage)} className="h-2 bg-gray-200" />
              <span className="text-small-medium text-gray-600 mt-1 block">
                {Store.currency_sign}
                {(props.averageProductPrice - (props.averageProductPrice * parseFloat(discountPercentage)) / 100).toFixed()}{" "}
                average price after discount
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setActiveSection("main")} className="text-base-medium" disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSetDiscount} className="text-base-medium text-white" disabled={loading}>
                {loading ? 
                  <>
                    <span>In progress</span>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" /> 
                  </>
                  : "Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "move" && (
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-heading3-bold">Move Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm py-4">
              <ProductsTable
                stringifiedProducts={props.stringifiedProducts}
                categoryName={categoryName}
                selectedProducts={selectedProducts}
                onSelectionChange={handleSelectionChange}
              />
            </div>
            <div>
              <Label className="text-base-semibold mb-2 block">Destination Category</Label>
              {newCategory ? (
                <>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name"
                    className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                    disabled={loading}
                  />
                  {allCategories.some((category) => category.name === newCategoryName) && (
                    <p className="text-subtle-medium text-yellow-600 mt-1">
                      Category already exists.{" "}
                      <Button variant="link" className="p-0" onClick={() => {setNewCategoryId((allCategories.filter(category => category.name === newCategoryName))[0].categoryId); setNewCategory(false); setNewCategoryName("")}} disabled={loading}>
                        Click here to select instead
                      </Button>
                    </p>
                  )}
                </>
              ) : (
                // <Select value={newCategoryId} onValueChange={setNewCategoryId} disabled={loading}>
                //   <SelectTrigger className="text-base-regular">
                //     <SelectValue placeholder="Choose existing category" />
                //   </SelectTrigger>
                //   <SelectContent>
                //     {allCategories.map((category, index) => (
                //       <SelectItem key={index} value={category.categoryId} className="text-base-regular">
                //         {category.name}
                //       </SelectItem>
                //     ))}
                //   </SelectContent>
                // </Select>
                <SearchableSelect
                  isForm={false}
                  items={allCategories}
                  placeholder="Choose existing category"
                  value={newCategoryId}
                  onValueChange={setNewCategoryId}
                  renderValue="name"
                  searchValue="name"
                  itemValue="categoryId"
                  className="min-w-[300px] text-base-regular bg-white"
                  triggerStyle="font-normal mt-1"
                  disabled={loading}
                />
              )}
            </div>
            <Button onClick={() => {setNewCategory(!newCategory), setNewCategoryName("")}} variant="outline" className="text-base-medium" disabled={loading}>
              {newCategory ? "Choose existing category" : "Create new category"}
            </Button>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setActiveSection("main")} className="text-base-medium" disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleConfirmMoveProducts} className="text-base-medium text-white" disabled={loading || allCategories.some((category) => category.name === newCategoryName)}>
                {loading ? 
                  <>
                    <span>In progress</span>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" /> 
                  </>
                  : "Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {
        activeSection === "delete-with-products" && (
          <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="text-heading3-bold flex items-center text-red-700">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
                Delete Category and Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. This will permanently delete the{" "}
                  <span className="font-bold">{categoryName}</span> category and all its products.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ConfirmDelete 
                 stages="two" 
                 label="Category Name" 
                 value={confirmationCategoryName} 
                 setConfirmationName={setConfirmationCategoryName}
                 secondLabel={"delete"} 
                 secondValue={deleteConfirmation}
                 setSecondConfirmation={setDeleteConfirmation}
                 disabled={loading}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 max-[485px]:flex-col">
                <Button variant="outline" onClick={handleCancelDelete} className="text-base-medium" disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteWithProducts}
                  className="text-base-medium text-white bg-red-500 hover:bg-red-600"
                  disabled={confirmationCategoryName !== categoryName || deleteConfirmation !== "delete" || loading}
                >
                  {loading ? 
                  <>
                    <span>In progress</span>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" /> 
                  </>
                  : "Delete Category and Products"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }

      {
        activeSection === "delete-and-move" && (
          <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-yellow-50 border-b border-yellow-100">
              <CardTitle className="text-heading3-bold flex items-center text-yellow-700">
                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
                Delete Category and Move Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Caution</AlertTitle>
                <AlertDescription>
                  This action will delete the <span className="font-bold">{categoryName}</span> category and move its products
                  to another category.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base-bold mb-4 text-gray-700">Select Destination Category</h3>
                <div className="space-y-4">
                  {newCategory ? (
                    <div>
                      <Label htmlFor="newCategoryName" className="text-base-semibold mb-2 block">
                        New Category Name
                      </Label>
                      <Input
                        id="newCategoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                        disabled={loading}
                      />
                      {allCategories.some((category) => category.name === newCategoryName) && (
                        <p className="text-subtle-medium text-yellow-600 mt-1">
                          Category already exists.{" "}
                          <Button variant="link" className="p-0" onClick={() => {setNewCategoryId((allCategories.filter(category => category.name === newCategoryName))[0].categoryId); setNewCategory(false); setNewCategoryName("")}} disabled={loading}>
                            Click here to select instead
                          </Button>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="destinationCategory" className="text-base-semibold mb-2 block">
                        Destination Category
                      </Label>
                      <SearchableSelect
                        isForm={false}
                        items={allCategories}
                        placeholder="Choose existing category"
                        value={newCategoryId}
                        onValueChange={setNewCategoryId}
                        renderValue="name"
                        searchValue="name"
                        itemValue="categoryId"
                        className="min-w-[300px] text-base-regular bg-white"
                        triggerStyle="font-normal mt-1"
                        disabled={loading}
                      />
                    </div>
                  )}
                  <Button onClick={() => {setNewCategory(!newCategory); setNewCategoryName("")}} variant="outline" className="text-base-medium w-full">
                    {newCategory ? "Choose existing category" : "Create new category"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ConfirmDelete 
                 stages="two" 
                 label="Category Name" 
                 value={confirmationCategoryName} 
                 setConfirmationName={setConfirmationCategoryName}
                 secondLabel={"delete"} 
                 secondValue={deleteConfirmation}
                 setSecondConfirmation={setDeleteConfirmation}
                 disabled={loading}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 max-[485px]:flex-col">
                <Button variant="outline" onClick={handleCancelDelete} className="text-base-medium" disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteAndMove}
                  className="text-base-medium text-white bg-yellow-500 hover:bg-yellow-600"
                  disabled={(newCategory ? !newCategoryName: !newCategoryId) || confirmationCategoryName !== categoryName || deleteConfirmation !== "delete" || loading || allCategories.some((category) => category.name === newCategoryName)}
                >
                {loading ? 
                  <>
                    <span>In progress</span>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" /> 
                  </>
                  : "Delete Category and Products"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }
    </div>
  )
}