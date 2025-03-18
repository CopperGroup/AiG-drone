import { fetchCategory } from "@/lib/actions/categories.actions";
import EditCategoryPage from "../../../../../components/admin-components/Categories/EditCategoryPage";

const Page = async ({ params }: { params: { id: string } }) => {

    if (!params.id) {
        return null;
    }

    const categoryInfo = await fetchCategory({ categoryId: params.id });

    return (
        <section className="w-full px-10 pt-10 pb-20 ml-2 max-[1040px]:px-8 max-[400px]:px-6 max-[360px]:px-4">
            <EditCategoryPage {...categoryInfo}/>
        </section>
    );
}

export default Page;
