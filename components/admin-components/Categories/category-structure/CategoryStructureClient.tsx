"use client"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from 'react-hot-toast';
import  CategoryStructureManager  from "./CategoryStructureManager"
import { updateSubcategories } from "@/lib/actions/categories.actions"

interface CategoryAdminClientProps {
  stringifiedCategories: string
}

export default function CategoryStructureClient({ stringifiedCategories }: CategoryAdminClientProps) {
  // Parse the JSON string to get the categories
  const initialCategories = JSON.parse(stringifiedCategories)
  const [categories, setCategories] = useState(initialCategories)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const changedCategories = categories.filter((category: any) => {
        const originalCategory = initialCategories.find(
          (initialCategory: any) => initialCategory._id === category._id
        )
  
        // Compare only if the category exists in the initial state
        if (originalCategory) {
          return JSON.stringify(category.subCategories) !== JSON.stringify(originalCategory.subCategories)
        }
  
        return false
      })

      await updateSubcategories({ categories: changedCategories })

      toast.success("Вашу структуру категорій успішно оновлено.");
      } catch (error) {
        console.error("Помилка збереження категорій:", error)
        toast.error("Виникла проблема під час збереження змін. Спробуйте ще раз.");
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleSave} className="flex items-center gap-2" disabled={isSaving}>
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? "Збереження..." : "Зберегти"}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-heading3-bold">Налаштуйте структуру категорій</CardTitle>
        </CardHeader>
        <CardContent>
          <DndProvider backend={HTML5Backend}>
            <CategoryStructureManager categories={categories} setCategories={setCategories} />
          </DndProvider>
        </CardContent>
      </Card>
    </>
  )
}

