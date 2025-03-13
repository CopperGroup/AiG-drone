import React from 'react'
import Filter from '@/components/shared/Filter'
import ProductCard from '@/components/cards/ProductCard'
import Search from '@/components/shared/Search'
import PaginationForCatalog from '@/components/shared/PaginationForCatalog'

import { getSession } from '@/lib/getServerSession'
import BannerSmall from '@/components/banner/BannerSmall'
import { fetchCatalog } from '@/lib/actions/redis/catalog.actions'
import { fetchAllProducts } from '@/lib/actions/product.actions'
import { filterProductsByKey, getCounts, getFiltredProducts, pretifyProductName, processProductParams } from '@/lib/utils'
import { getCategoriesNamesIdsTotalProducts } from '@/lib/actions/categories.actions'
import { getFilterSettingsAndDelay } from '@/lib/actions/filter.actions'
import { Metadata } from 'next';
import { Store } from '@/constants/store'

export const metadata: Metadata = {
  title: "Catalog",
  robots: {
    index: false,
    follow: true
  }
}


const Catalog = async ({searchParams,data}:any) => {
  let filtredProducts: any[] = await fetchCatalog();
  
  const email = await getSession()

  const categories: { name: string, categoryId: string, totalProducts: number}[] = await getCategoriesNamesIdsTotalProducts();

  const {filterSettings, delay} = await getFilterSettingsAndDelay();

  if(searchParams.sort === 'low_price'){
    filtredProducts = filtredProducts.sort((a,b) => a.price - b.price)
  }else if(searchParams.sort == 'hight_price'){
    filtredProducts.sort((a,b) => b.price - a.price)
  }
  
  const searchedCategories = searchParams.categories 

  filtredProducts = filtredProducts.filter(product => {

    const matchesCategories = searchedCategories ? categories.filter(cat => searchedCategories.includes(cat.categoryId)).map(cat => cat.name).includes(product.category): true
  
    searchedCategories && (categories.filter(cat => searchedCategories.includes(cat.categoryId)).map(cat => cat.name).includes(product.category) && console.log(product.name))

    return matchesCategories
  })

  const unitParams: Record<string, { totalProducts: number, type: string, min: number, max: number }> = {};
  const selectParams: Record<string, { totalProducts: number, type: string, values: { value: string, valueTotalProducts: number }[] }> = {};

  // Iterate over filterSettings
  if(searchedCategories) {
    Object.entries(filterSettings).forEach(([categoryId, categoryData]) => {
      // Check if categoryId is in searchedCategories
      if (!searchedCategories.includes(categoryId)) return;
  
      Object.entries(categoryData.params).forEach(([paramName, paramData]) => {
        if (paramData.type.startsWith("unit-")) {
          unitParams[paramName] = { totalProducts: paramData.totalProducts, type: paramData.type, min: 0, max: 0};
        } else if (paramData.type === "select") {
          selectParams[paramName] = { totalProducts: paramData.totalProducts, type: paramData.type, values: []};
        }
      });
    });
  }
  
  processProductParams(filtredProducts, unitParams, selectParams);
  
  
  const maxPrice = Math.max(...filtredProducts.map(item => item.priceToShow));
  const minPrice = Math.min(...filtredProducts.map(item => item.priceToShow));
  const vendors = Array.from(new Set (filtredProducts.map(item => item.vendor))).filter(function(item) {return item !== '';});

  const counts = getCounts(filtredProducts)
  filtredProducts = getFiltredProducts(filtredProducts, searchParams);

  // filtredProducts = filterProductsByKey(filtredProducts, "name", " ", -1);

  const countOfPages = Math.ceil(filtredProducts.length/12)
  const pageNumber = searchParams.page

  let min = 0
  let max = 12


  if(pageNumber === 1 || pageNumber === undefined){
    
  } else{
      min = (pageNumber-1)*12
      max = min+12
  } 
  return (
    <section>
      <BannerSmall/>
      <div className="flex mt-12">
        <Filter  
         category={searchParams.category} 
         minPrice={minPrice} 
         maxPrice={maxPrice} 
         categories={categories}
         checkParams={{vendors}} 
         selectParams={selectParams}
         unitParams={unitParams}
         delay={delay}
         counts={counts}
        />
        <div className='w-full'>
          <div className='w-full flex gap-2 justify-center items-center px-6 ml-auto max-md:w-full max-[560px]:px-10 max-[450px]:px-4'>
            <Search />
            
          </div> 
        
          <div className='grid auto-cols-max gap-4 mt-8 grid-cols-4 px-4 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:px-10 max-[450px]:px-4'>
            {filtredProducts
            .slice(min, max)
            .map((product) =>(
              <div key={product.id}>
               
                <ProductCard 
                  id={product._id}
                  productId={product.id}
                  email={email}
                  url={product._id} 
                  price={product.price} 
                  imageUrl={product.images[Store.default_image.product_card]} 
                  description={product.description.replace(/[^а-яА-ЯіІ]/g, ' ').substring(0, 35) + '...'}  
                  priceToShow={product.priceToShow} 
                  name={pretifyProductName(product.name, [], product.articleNumber || "")}
                  // @ts-ignore
                  likedBy={product.likedBy}
                />
             
              </div>

            ))}        
          </div>
          <PaginationForCatalog minPrice={minPrice} maxPrice={maxPrice} countOfPages={countOfPages} />
        </div>
      </div>
    </section>
  )
};



export default Catalog;