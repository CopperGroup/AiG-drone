import ProductPage from '@/components/shared/ProductPage';
import { fetchProductPageInfo } from '@/lib/actions/cache';
import { fetchProductAndRelevantParams } from '@/lib/actions/product.actions';
import { pretifyProductName } from '@/lib/utils';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { product, selectParams } = await fetchProductPageInfo(params.id, "name", " ", -1);

  return {
    title: pretifyProductName(product.name, [], product.articleNumber || ""),
    description: product.description,
    openGraph: {
      images: [
        {
          url: `https://fo-scandinavia.vercel.app/${product.images[0]}`
        }
      ]
    }
  }
}

const Page = async ({ params }: { params: { id: string } }) => {
  if(!params.id) {
    return <h1>Product does not exist</h1>
  }

  const { product, selectParams } = await fetchProductPageInfo(params.id, "articleNumber", " ", -1);

  return (
    <section className="max-lg:-mt-24">
      <ProductPage productJson={JSON.stringify(product)} selectParams={selectParams} />
    </section>
  );
};

export default Page;

