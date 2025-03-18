"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  categoryId: string
  name: string
}

interface DeleteAndMoveProductsDialogProps {
  categoryName: string
  allCategories: Category[]
  onDeleteAndMove: (newCategoryName: string) => void
  onCancel: () => void
}

export function DeleteCategory({
  categoryName,
  allCategories,
  onDeleteAndMove,
  onCancel,
}: DeleteAndMoveProductsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newCategory, setNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [confirmationCategoryName, setConfirmationCategoryName] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const handleCancelDelete = () => {
    setIsOpen(false)
    onCancel()
  }

  const confirmDeleteAndMove = () => {
    onDeleteAndMove(newCategoryName)
    setIsOpen(false)
  }

  const resetForm = () => {
    setNewCategory(false)
    setNewCategoryName("")
    setConfirmationCategoryName("")
    setDeleteConfirmation("")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Delete and Move Products</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Category and Move Products</DialogTitle>
        </DialogHeader>
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
                This action will delete the <span className="font-bold">{categoryName}</span> category and move its
                products to another category.
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
                    />
                    {allCategories.map((category) => category.name).includes(newCategoryName) && (
                      <p className="text-subtle-medium text-yellow-600 mt-1">
                        Category already exists.{" "}
                        <Button variant="link" className="p-0" onClick={() => setNewCategory(false)}>
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
                    <Select value={newCategoryName} onValueChange={setNewCategoryName}>
                      <SelectTrigger id="destinationCategory" className="text-base-regular">
                        <SelectValue placeholder="Choose existing category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((category) => (
                          <SelectItem key={category.categoryId} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setNewCategory(!newCategory)
                    setNewCategoryName("")
                  }}
                  variant="outline"
                  className="text-base-medium w-full"
                >
                  {newCategory ? "Choose existing category" : "Create new category"}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-base-bold mb-4 text-gray-700">Confirmation Required</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName" className="text-base-semibold mb-2 block">
                    Type category name to confirm
                  </Label>
                  <Input
                    id="categoryName"
                    value={confirmationCategoryName}
                    onChange={(e) => setConfirmationCategoryName(e.target.value)}
                    className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                    placeholder={categoryName}
                  />
                </div>
                <div>
                  <Label htmlFor="deleteConfirmation" className="text-base-semibold mb-2 block">
                    Type <span className="font-semibold text-red-500">delete</span> to confirm
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                    placeholder="Type delete"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 max-[485px]:flex-col">
              <Button variant="outline" onClick={handleCancelDelete} className="text-base-medium">
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAndMove}
                className="text-base-medium text-white bg-yellow-500 hover:bg-yellow-600"
                disabled={
                  !newCategoryName || confirmationCategoryName !== categoryName || deleteConfirmation !== "delete"
                }
              >
                Delete and Move Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

