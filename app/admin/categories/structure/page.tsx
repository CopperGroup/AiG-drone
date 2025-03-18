import CategoryStructureClient from "@/components/admin-components/Categories/category-structure/CategoryStructureClient"
import { fetchAllCategories } from "@/lib/actions/categories.actions"

export default async function CategoriesAdminPage() {
  const stringifiedCategories = await fetchAllCategories("json")

  return (
    <section className="w-full px-10 py-10 max-[360px]:px-4"> 
      <h1 className="w-full text-heading1-bold drop-shadow-text-blue">Категорії</h1>
      <CategoryStructureClient stringifiedCategories={stringifiedCategories} />
    </section>
  )
}

