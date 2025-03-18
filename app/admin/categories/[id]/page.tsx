import CategoryPage from "@/components/admin-components/Categories/CategoryPage";
import { fetchCategory } from "@/lib/actions/categories.actions";

const Page = async ({ params }: { params: { id: string } }) => {

    if (!params.id) {
        return null;
    }

    // // Decode the category name to handle encoded characters
    // const decodedCategoryName = decodeURIComponent(params.categoryName.replace('_', ' '));

    // console.log("Decoded Category name:", decodedCategoryName);

    // Fetch category information based on the decoded name
    const categoryInfo = await fetchCategory({ categoryId: params.id });

    return (
        <section className="w-full px-10 pt-10 ml-2 max-[400px]:px-6 max-[360px]:px-4">
            <CategoryPage {...categoryInfo} />
        </section>
    );
}

export default Page;
