import FilterCategoryList from "@/components/admin-components/Filter/FilterCategoryList";
import { fetchCategoriesParams } from "@/lib/actions/categories.actions";
import { fetchFilter } from "@/lib/actions/filter.actions";
import { mergeFilterAndCategories } from "@/lib/utils";

const Page = async () => {
    const filter = await fetchFilter();

    const categoriesParams = await fetchCategoriesParams();

    let categories = "{}";

    if(filter) {
        categories = JSON.stringify(mergeFilterAndCategories(filter, categoriesParams))
    } else {
        categories = JSON.stringify(categoriesParams)
    }

    return (
        <section className="px-10 py-20 w-full max-[360px]:px-4">
            <h1 className="text-heading1-bold drop-shadow-text-blue">Налаштування фільтру</h1>
            <FilterCategoryList stringifiedCategories={categories} filterDelay={filter?.delay || 250}/>
        </section>
    )
}

export default Page