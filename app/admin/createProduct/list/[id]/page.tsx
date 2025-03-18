import EditProduct from "@/components/forms/EditProduct";
import { getCategoriesNamesAndIds } from "@/lib/actions/categories.actions";
import { fetchProductById, findProductCategory } from "@/lib/actions/product.actions";

const Page = async ({ params }: { params: { id: string } }) => {
    if(!params.id) return null;
    
    const stringifiedProduct = await fetchProductById(params.id, "json")
    const categories = await getCategoriesNamesAndIds();
    const stringifiedCategory = await findProductCategory(JSON.parse(stringifiedProduct), 'json');

    return (
      <section className="px-10 py-20">
        <h1 className="w-full text-heading1-bold drop-shadow-text-blue max-[440px]:text-center">Редагувати товар</h1>
        <div className="mt-16">
          <EditProduct stringifiedProduct={stringifiedProduct} categories={categories} stringifiedCategory={stringifiedCategory}/>
        </div>
      </section>
    )
  }
  
  export default Page;