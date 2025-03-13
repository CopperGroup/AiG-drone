'use client'

import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import { capitalize, cn, createSearchString, extractNumber, sleep } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from 'use-debounce'
import { useEffect } from 'react'
import { useAppContext } from "@/app/(root)/context"
import { useRef } from 'react';
import { Button } from '../ui/button'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link'
import { Slider } from '../ui/slider'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import ClearFilterButton from '../interface/ClearFilterButton'
import { CategoryType } from '@/lib/types/types'
import ApplyFilterButton from '../interface/ApplyFilterButton'
import { Input } from '../ui/input'

interface Props {
  maxPrice:number,
  minPrice:number, 
  categories: { name: string, categoryId: string, totalProducts: number }[],
  checkParams: {
    vendors: string[], 
  },
  unitParams: Record<string, { totalProducts: number; type: string; min: number; max: number }>;
  selectParams: Record<string, { totalProducts: number, type: string, values: { value: string, valueTotalProducts: number }[] }>;
  category:any, 
  delay: number,
  counts: {
    categoriesCount: { [key: string]: number },
    vendorsCount: { [key: string]: number },
  } 
}

const params = ["width", "height", "depth"] as const;
const paramsUa = { width: "Ширина", height: "Висота", depth: "Глибина" };
type ParamsName = typeof params[number];

const checkParamsNames = ["vendors" ] as const;
const checkParamsNamesUa = {vendors: "Виробник"};
type CheckParams = typeof checkParamsNames[number];

type PageFilterType = {
  page: string,
  price: [number, number],
  categories: string[],
  vendors: string[],
  selectParamsValues: string[],
  unitParamsValues: string[]
}

const Filter = ({ maxPrice, minPrice, categories, checkParams, selectParams, unitParams, category, delay, counts }: Props) => {
  const {catalogData, setCatalogData} = useAppContext();
  const [filter, setFilter] = useState<PageFilterType>({
    page: "1",
    price:[minPrice, maxPrice],
    categories: [],
    vendors:[],
    selectParamsValues: [],
    unitParamsValues: []
  })
  const [screenWidth, setScreenWidth] = useState(0);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [bodyOverflow, setBodyOverflow] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const [checkParamsSearchTerms, setCheckParamsSearchTerms] = useState<{ [key: string]: string }>({})
  const [ isLoaded, setIsLoaded ] = useState(false)

  
  const router = useRouter();
  const search = useSearchParams();
  const page = useSearchParams().get("page");
  
  useEffect(() => {
    const searchParams = Object.fromEntries(search.entries());
    
    setFilter((...prev) => ({
      ...prev,
      page: page || "1",
      price: [
        parseFloat(searchParams.minPrice || minPrice.toString()),
        parseFloat(searchParams.maxPrice || maxPrice.toString()),
      ],
      categories: searchParams.categories ? searchParams.categories.split(","): [],
      vendors: searchParams.vendor ? searchParams.vendor.split(',') : [],
      selectParamsValues: searchParams.categories ? (searchParams.selectParams ? searchParams.selectParams.split(',') : []) : [],
      unitParamsValues: searchParams.categories ? (searchParams.unitParams ? searchParams.unitParams.split(',') : []) : []
    }))
    
    setCatalogData((prev: any) => ({...prev, sort: searchParams.sort || "default"}))

    setIsLoaded(true)
  }, [search, minPrice, maxPrice, checkParams, categories, counts]);
  
  
  useEffect(() => {
    if(!isLoaded) return

    const startSearch = async () => {
      
      await sleep(delay);
      
      const searchString = createSearchString({
        pNumber: filter.page, // Reset to page 1 on filter change
        sort: catalogData.sort,
        categories: filter.categories,
        vendors: filter.vendors,
        search: catalogData.search,
        price: filter.price,
        category,
        minPrice,
        maxPrice,
        selectParamsValues: filter.categories.length > 0 ? filter.selectParamsValues : [],
        unitParamsValues: filter.categories.length > 0 ? filter.unitParamsValues: []
        // maxMin,
      });
      router.push(`/catalog?${searchString}`);
    }
    
    startSearch()
  }, [catalogData.search, catalogData.sort]);  
  
  const handleApplyFilter = () => {
    const searchString = createSearchString({
      pNumber: filter.page,
      sort: catalogData.sort,
      categories: filter.categories,
      vendors: filter.vendors,
      search: catalogData.search,
      price: filter.price,
      category,
      minPrice,
      maxPrice,
      selectParamsValues: filter.categories.length > 0 ? filter.selectParamsValues : [],
      unitParamsValues: filter.categories.length > 0 ? filter.unitParamsValues: []
    });
    router.push(`/catalog?${searchString}`);
  }
  
  useEffect(() => {
    const currentScreenWidth = window.screen.width;
    
    setScreenWidth(currentScreenWidth);
  }, [])
  
  const handleChange = (newValue: [number, number]) => {
    setFilter({...filter, page: "1", price:newValue})
  };
  
  const handleCategoriesCheckboxChange = (categoryId: string) => {
    const isChecked = filter.categories.includes(categoryId);
    
    setFilter((prevFilter):any => {
      if (!isChecked) {
        return {...prevFilter, page: "1", categories: [...prevFilter.categories, categoryId]};
      } else {
        return {...prevFilter, page: "1", categories: prevFilter.categories.filter(id => id !== categoryId)};
      }
    });
  };
  
  const handleCheckboxChange = (checkParam: CheckParams, value: string) => {
    const isChecked = filter[checkParam].includes(value);
    
    setFilter((prevFilter):any => {
      if (!isChecked) {
        return {...prevFilter, page: "1", [checkParam]: [...prevFilter[checkParam], value]};
      } else {
        return {...prevFilter, page: "1", [checkParam]: prevFilter[checkParam].filter(param => param !== value)};
      }
    });
  };
  
  const handleSelectParamChange = (paramName: string, value: string) => {
    setFilter((prevFilter) => {
        // Find if the param already exists in the selectParamsValues
        const existingEntry = prevFilter.selectParamsValues.find((entry) =>
          entry.startsWith(`${paramName}--`)
      );
      
      let updatedParams = [...prevFilter.selectParamsValues];
      
      if (existingEntry) {
        // Remove the `${paramName}--` prefix and split the values by `__`
        const values = existingEntry.replace(`${paramName}--`, "").split("__");
        
        if (values.includes(value)) {
          // Remove the value from the array if it's already selected
          const updatedValues = values.filter((v) => v !== value);
          
          if (updatedValues.length > 0) {
            // Update the selectParamsValues with the modified values
            updatedParams = updatedParams.map((entry) =>
                entry.startsWith(`${paramName}--`) ? `${paramName}--${updatedValues.join("__")}` : entry
          );
        } else {
          // If no values are left, remove this param completely
          updatedParams = updatedParams.filter((entry) => !entry.startsWith(`${paramName}--`));
        }
      } else {
        // Add new value to the list if not already selected
        updatedParams = updatedParams.map((entry) =>
          entry.startsWith(`${paramName}--`) ? `${paramName}--${[...values, value].join("__")}` : entry
      );
    }
  } else {
    // If the param doesn't exist in the list, add it
    updatedParams.push(`${paramName}--${value}`);
  }

  return { ...prevFilter, page: "1", selectParamsValues: updatedParams };
  });
  };

  const handleUnitParamChange = async (paramName: string, min: number, max: number) => {
    setFilter((prevFilter) => {
      const { unitParamsValues } = prevFilter;
      const existingEntryIndex = unitParamsValues.findIndex((entry) =>
        entry.startsWith(`${paramName}--`)
    );
    
    const paramMin = unitParams[paramName]?.min;
    const paramMax = unitParams[paramName]?.max;
    
    let updatedParams = [...unitParamsValues];
    
    if (min === paramMin && max === paramMax) {
      // Remove the param from the array if it matches the full range
      updatedParams = updatedParams.filter((entry) => !entry.startsWith(`${paramName}--`));
    } else {
      const newEntry = `${paramName}--${min}m${max}`;
      if (existingEntryIndex !== -1) {
        // Replace the existing entry
        updatedParams[existingEntryIndex] = newEntry;
      } else {
        // Add new entry
        updatedParams.push(newEntry);
      }
    }
    
    return { ...prevFilter, page: "1", unitParamsValues: updatedParams };
  });
  };


  const toggleOverflow = (e:any) =>{
    if (divRef.current) {
      if (bodyOverflow) {
        document.body.style.overflow = 'auto';
        //@ts-ignore
        divRef.current.style.overflow = 'hidden';
        //@ts-ignore
        divRef.current.style.transform = `translateX(-100%)`
        if(screenWidth <= 360) {
          if(filterButtonRef.current) {
            filterButtonRef.current.style.display = "block";
            filterButtonRef.current.style.transform = `translateX(0px)`;
          }
        } else {
          e.target.style.transform = `translateX(0px)`;
        }
      } else {
        document.body.style.overflow = 'hidden';
        //@ts-ignore
        divRef.current.style.overflowY = 'auto';
        //@ts-ignore
        divRef.current.style.transform = `translateX(0%)`
        e.target.style.transform = `translateX(300px)`
        if(screenWidth <= 360) {
          e.target.style.display = "none";
        }
      } 
    }
    setBodyOverflow(!bodyOverflow);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  )

  const handleSearchChange = (param: string, value: string) => {
    setCheckParamsSearchTerms(prev => ({ ...prev, [param]: value }))
  }

  const filterValues = (param: string, values: string[]) => {
    const searchTerm = checkParamsSearchTerms[param] || ""
    return values.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
return (
    <>
    <Button ref={filterButtonRef} onClick={(e)=>toggleOverflow(e)} className="fixed duration-300 left-0 top-36 rounded-none rounded-r md:hidden transition-all"><i className="fa fa-filter pointer-events-none"></i></Button>
    <div ref={divRef} className='transition-all duration-300 w-[25%] border-[1.5px] shadow-small px-5 rounded-3xl max-[1023px]:w-[30%] max-[850px]:w-[35%] max-[1080px]:px-3 max-[880px]:px-2 max-md:w-[300px] max-md:rounded-l-none max-md:fixed max-md:bg-white  max-md:flex max-md:flex-col justify-center z-50 items-center max-md:overflow-y-scroll overflow-x-hidden max-md:h-full  max-md:translate-x-[-100%] max-[360px]:w-full max-[360px]:rounded-none top-0  left-0 ' >
      <div className='h-full max-md:w-[270px] py-10'>
          <div className="w-full h-fit flex justify-between"> 
            <h2 className='text-[28px]'>Фільтр</h2>
            <Button onClick={(e)=>toggleOverflow(e)} className="duration-300 size-12 rounded-full md:hidden transition-all min-[361px]:hidden"><i className="fa fa-filter pointer-events-none"></i></Button>
          </div>            
            <div className='mt-4 pb-4 w-full'>
              <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3">Ціна</AccordionTrigger>
                  <AccordionContent className="flex flex-col items-center shrink-0 px-3">
                    <Slider
                        value={filter.price}
                        onValueChange={handleChange}
                        max={maxPrice}
                        min={minPrice}
                        step={1}
                        className={cn("w-full mt-4")}
                      />
                      <div className='flex gap-1 justify-between mt-7 w-full'>
                        <div>
                          <label htmlFor="minPrice">Від</label>
                          <input className='w-20 h-8 mt-2 text-center border flex items-center justify-center rounded-2xl' onChange={(e) => setFilter({...filter, price: [e.target.value !== "₴" ? parseFloat(e.target.value.slice(1)) : 0, maxPrice]})} value={`₴${filter.price[0]}`} id="minPrice"/>
                        </div>
                        <div>
                          <label htmlFor="maxPrice">До</label>
                          <input className='w-20 h-8 mt-2 text-center border flex items-center justify-center rounded-2xl' onChange={(e) => setFilter({...filter, price: [minPrice, e.target.value !== "₴" ? parseFloat(e.target.value.slice(1)): 0]})} value={`₴${filter.price[1]}`} id="maxPrice"/>
                        </div>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div className='mt-4 pb-4 w-full min-[601px]:hidden'>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className='text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3'>Сортування</AccordionTrigger>
                  <AccordionContent className="px-3">
                  <RadioGroup className="py-3" onValueChange={(element)=>setCatalogData((prev: any) => ({...prev, sort: element}))} value={catalogData.sort}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="default" />
                      <Label htmlFor="default">Default</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low_price" id="low_price" />
                      <Label htmlFor="low_price">Ціна(низька)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hight_price" id="hight_price" />
                      <Label htmlFor="hight_price">Ціна(Висока)</Label>
                    </div>
                  </RadioGroup>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="mt-4 pb-4 w-full">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3">
                    Категорії
                  </AccordionTrigger>
                  <AccordionContent className="pl-3">
                    <Input
                      type="text"
                      placeholder="Пошук категорій..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="h-8 w-11/12 text-small-medium border-0 border-b rounded-none focus-visible:ring-transparent focus-visible:border-black mt-4 mb-1"
                    />
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredCategories.map((cat, index) => (
                        <div key={index} className="w-full h-fit flex justify-between items-center">
                          <div className="flex items-center space-x-2 mt-4">
                            <Checkbox
                              id={cat.categoryId}
                              className="size-5 rounded-md border-neutral-600 data-[state=checked]:bg-black data-[state=checked]:text-white"
                              onCheckedChange={() => handleCategoriesCheckboxChange(cat.categoryId)}
                              checked={filter.categories.includes(cat.categoryId)}
                            />
                            <label
                              htmlFor={cat.categoryId}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {cat.name}
                            </label>
                          </div>
                          <p className="w-fit text-small-medium text-blue drop-shadow-xl mt-3 px-4">
                            {cat.totalProducts}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <>
              {checkParamsNames.map((param) => (
                <div key={param} className='mt-4 pb-4 w-full'>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className='text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3'>
                        {checkParamsNamesUa[param]}
                      </AccordionTrigger>
                      <AccordionContent className="pl-3">
                        <Input
                          type="text"
                          placeholder={`Пошук ${checkParamsNamesUa[param].toLowerCase()}...`}
                          value={checkParamsSearchTerms[param] || ""}
                          onChange={(e) => handleSearchChange(param, e.target.value)}
                      className="h-8 w-11/12 text-small-medium border-0 border-b rounded-none focus-visible:ring-transparent focus-visible:border-black mt-4 mb-1"
                        />
                        <div className="max-h-[300px] overflow-y-auto">
                          {filterValues(param, checkParams[param]).map((value, index) => (
                            <div key={index} className="w-full h-fit flex justify-between items-center">
                              <div className="flex items-center space-x-2 mt-4">
                                <Checkbox 
                                  id={`${param}-${value}`}
                                  className="size-5 rounded-md border-neutral-600 data-[state=checked]:bg-black data-[state=checked]:text-white"
                                  onCheckedChange={() => handleCheckboxChange(param, value)}
                                  checked={filter[param].includes(value)}
                                />
                                <label
                                  htmlFor={`${param}-${value}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {value}
                                </label>
                              </div>
                              <p className="w-fit text-small-medium text-blue drop-shadow-xl mt-3 px-4">
                                {counts[`${param}Count`][value]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </>

            {Object.entries(selectParams).length > 0 && 
              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="selectParams">
                  <AccordionTrigger className='text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3'>
                    Параметри
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='overflow-hidden'>
                      <div className='max-h-[300px] overflow-y-auto pl-2'>
                        {Object.entries(selectParams).map(([paramName, paramData]) => (
                          <div key={paramName} className='mt-4 w-full '>
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value={paramName}>
                                <AccordionTrigger className='text-[14px] bg-neutral-100 rounded-3xl font-normal py-[6px] px-3'>
                                  {paramName}
                                </AccordionTrigger>
                                <AccordionContent className="pl-3 max-h-[300px] overflow-y-auto">
                                  {paramData.values.map(({value, valueTotalProducts}, index) => {
                                    // Find the existing entry for the param in selectParamsValues
                                    const existingEntry = filter.selectParamsValues.find((entry) =>
                                      entry.startsWith(`${paramName}--`)
                                    );

                                    // Initialize isChecked as false
                                    let isChecked = false;

                                    if (existingEntry) {
                                      // Remove `${paramName}--` and split by `__`
                                      const values = existingEntry.replace(`${paramName}--`, "").split("__");
                                      // Check if the value is in the list of selected values
                                      isChecked = values.includes(value);
                                    }

                                    return (
                                      <div key={index} className="w-full h-fit flex justify-between items-center">
                                        <div className="flex items-center space-x-2 mt-4">
                                          <Checkbox
                                            id={value}
                                            className="size-5 rounded-md border-neutral-600 data-[state=checked]:bg-black data-[state=checked]:text-white"
                                            onCheckedChange={() => handleSelectParamChange(paramName, value)}
                                            checked={isChecked}
                                          />
                                          <label
                                            htmlFor={value}
                                            className="text-small-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {value}
                                          </label>
                                        </div>
                                        <p className="w-fit text-subtle-medium text-blue drop-shadow-xl mt-3 px-4">
                                          {valueTotalProducts}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            } 
          
          {unitParams && 
            <>
              {Object.entries(unitParams).map(([paramName, { min, max }]) => {
                const currentEntry = filter.unitParamsValues.find((entry) => entry.startsWith(`${paramName}--`));

                let currentMin = min;
                let currentMax = max;

                if (currentEntry) {
                  const [, range] = currentEntry.split("--");
                  [currentMin, currentMax] = range.split("m").map(Number);
                }

                return (
                  <UnitSlider 
                    key={paramName}
                    paramName={paramName}
                    currentMin={currentMin}
                    currentMax={currentMax}
                    minBoundary={min}
                    maxBoundary={max}
                    handleUnitParamChange={handleUnitParamChange}
                  />
                  );
              })}

            </>
          }
          <div className="space-y-3 pb-5 mt-6">
            <ApplyFilterButton onClick={handleApplyFilter}/>
            <ClearFilterButton />
          </div>
          </div>
        </div>
    </>
  )
}

export default Filter

const UnitSlider = ({ paramName, currentMin, currentMax, minBoundary, maxBoundary, handleUnitParamChange}: {
  paramName: string, 
  currentMin: number,
  currentMax: number,
  minBoundary: number,
  maxBoundary: number,
  handleUnitParamChange: ( paramName: string, min: number, max: number) => void;
}) => {

  const [sliderValues, setSliderValues] = useState<{ min: number, max: number}>({ min: currentMin, max: currentMax});

  const handleCommit = () => {
    handleUnitParamChange(paramName, sliderValues.min, sliderValues.max)
  }
  return (
    <div className="mt-4 pb-4 w-full" key={paramName}>
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-[18px] bg-zinc-100 rounded-3xl font-medium py-[6px] px-3">
            {paramName}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col items-center shrink-0 px-3">
            <Slider
              value={[sliderValues.min, sliderValues.max]}
              onValueChange={([newMin, newMax]) => setSliderValues({ min: newMin, max: newMax })}
              onValueCommit={handleCommit}
              max={maxBoundary}
              min={minBoundary}
              step={1}
              className="w-full mt-4"
            />

            <div className="flex justify-between mt-7 w-full">
              <FilterInput
                paramName={paramName}
                setting="min"
                currentMin={sliderValues.min}
                currentMax={sliderValues.max}
                minBoundary={minBoundary}
                maxBoundary={maxBoundary}
                handleUnitParamChange={handleUnitParamChange}
              />
              <FilterInput
                paramName={paramName}
                setting="max"
                currentMin={sliderValues.min}
                currentMax={sliderValues.max}
                minBoundary={minBoundary}
                maxBoundary={maxBoundary}
                handleUnitParamChange={handleUnitParamChange}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const FilterInput = ({ paramName, setting, currentMin, currentMax, minBoundary, maxBoundary, handleUnitParamChange}: { 
  paramName: string, 
  setting: "min" | "max", 
  currentMin: number,
  currentMax: number,
  minBoundary: number, 
  maxBoundary: number,
  handleUnitParamChange: ( paramName: string, min: number, max: number) => void;
}) => {
  const [inputValue, setInputValue] = useState<string>(setting === "min" ? currentMin.toString() : currentMax.toString());

  useEffect(() => {
    setInputValue(setting === "min" ? currentMin.toString() : currentMax.toString())
  }, [currentMin, currentMax])


  const handleChange = (value: string) => {
    setInputValue(value)
  }

  const handleInputUnfocus = () => {
    let numericalValue = parseFloat(extractNumber(inputValue) || (setting === "min" ? minBoundary.toString() : maxBoundary.toString()))

    if(numericalValue < minBoundary || numericalValue > maxBoundary) {
      numericalValue = setting === "min" ? minBoundary : maxBoundary
    }
    setInputValue(numericalValue.toString())

    handleUnitParamChange(
      paramName,
      setting === "min" ? numericalValue : minBoundary,
      setting === "max" ? numericalValue : maxBoundary
    );
  }
  return (
    <div>
      <label htmlFor={`${setting}-${paramName}`}>{setting === "min" ? "Від" : "До"}</label>
      <input
        className="w-20 h-8 mt-2 text-center border flex items-center justify-center rounded-2xl"
        value={inputValue} // Bind inputValue to the input field
        onChange={(e) => handleChange(e.currentTarget.value)} // Update local state on change
        onBlur={handleInputUnfocus} // Update global filter state on blur
        id={`${setting}-${paramName}`}
      />
    </div>
  );
};


