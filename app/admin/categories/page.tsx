import { fetchCategoriesProperties } from "@/lib/actions/categories.actions";
import CategoryCard from "@/components/cards/CategoryCard";
import CategoryCardList from "@/components/admin-components/Categories/CategoriesList";
const Page = async () => {

  const categories = await fetchCategoriesProperties();

  return (
    <section className="w-full px-10 py-10 max-[360px]:px-4"> 
      <h1 className="w-full text-heading1-bold drop-shadow-text-blue">Категорії</h1>
        <CategoryCardList categories={categories} />
    </section>
  )
}

export default Page;