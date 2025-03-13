"use client"

import { useState, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Eye, Loader2, Plus, Sparkles, Stars } from "lucide-react"
import Pagination from "@/components/shared/Pagination"
import { createFilter } from "@/lib/actions/filter.actions"
import { CategoriesParams, CreateFilterProps } from "@/lib/types/types"
import { capitalize } from "@/lib/utils"
import { SelectDelay } from "@/components/interface/SelectDelay"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface ParamType {
  name: string
  totalProducts: number
  type: string
}

const PER_PAGE = 7;

const initializeStates = (categories: CategoriesParams) => {
  const checked: Record<string, boolean> = {};
  const types: Record<string, ParamType["type"]> = {};
  const units: Record<string, string> = {};

  Object.entries(categories).forEach(([categoryId, category]) => {
    category.params.forEach(param => {
      const key = `${categoryId}-${param.name}`;

      // Determine if param should be checked
      checked[key] = param.type === "select" || param.type.startsWith("unit-");

      // Process paramTypes and paramUnits
      if (param.type.startsWith("unit-")) {
        const [_, unit] = param.type.split("-");
        types[key] = "Unit";
        units[key] = unit;
      } else {
        types[key] = capitalize(param.type); // Capitalize first letter
      }
    });
  });

  return { checked, types, units };
};

export default function FilterCategoryList({ stringifiedCategories, filterDelay}: { stringifiedCategories: string, filterDelay: number }) {
  const categories: CategoriesParams = JSON.parse(stringifiedCategories)
  const { checked, types, units } = initializeStates(categories);

//   console.log("Data", checked, types, units)
  const [searchTerm, setSearchTerm] = useState("")
  const [checkedParams, setCheckedParams] = useState<Record<string, boolean>>(checked)
  const [paramTypes, setParamTypes] = useState<Record<string, ParamType["type"]>>(types)
  const [paramUnits, setParamUnits] = useState<Record<string, string>>(units)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [ creatingState, setCreatingState ] = useState<"Initial" | "Creating" | "Success" | "Error">("Initial")
  const [delay, setDelay] = useState<number>(filterDelay)
  const containerRef = useRef(null)

  const filteredCategories = useMemo(() => {
    return Object.entries(categories).filter(
      ([id, category]) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.totalProducts.toString().includes(searchTerm) ||
        category.params.some((param) => param.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [categories, searchTerm])

  const pageNumber = Math.ceil(filteredCategories.length / PER_PAGE)

  const handleParamCheck = (categoryId: string, paramName: string) => {
    const key = `${categoryId}-${paramName}`
    setCheckedParams((prev) => ({ ...prev, [key]: !prev[key] }))
    setCreatingState("Initial")
  }

  const handleParamTypeChange = (categoryId: string, paramName: string, type: ParamType["type"]) => {
    const key = `${categoryId}-${paramName}`
    setParamTypes((prev) => ({ ...prev, [key]: type }))
    setCreatingState("Initial")
  }

  const handleUnitChange = (categoryId: string, paramName: string, unit: string) => {
    const key = `${categoryId}-${paramName}`
    setParamUnits((prev) => ({ ...prev, [key]: unit }))
    setCreatingState("Initial")
  }

  const getBadgeColor = (categoryId: string, paramName: string) => {
    const key = `${categoryId}-${paramName}`
    if (!checkedParams[key]) return "bg-blue"
    if (!paramTypes[key]) return "bg-yellow-500"
    if (paramTypes[key] === "Unit" && !paramUnits[key]) return "bg-yellow-500"
    return "bg-green-500 text-white"
  }

  const getSelectedParams = (categoryId: string, params: ParamType[]) => {
    return params.filter((param) => checkedParams[`${categoryId}-${param.name}`])
  }

  const isFilterComplete = useMemo(() => {
    return Object.entries(checkedParams).every(([key, isChecked]) => {
      if (!isChecked) return true
      const [categoryId, paramName] = key.split("-")
      const type = paramTypes[key]
      return type && (type !== "Unit" || paramUnits[key])
    })
  }, [checkedParams, paramTypes, paramUnits])

  const handleSaveFilter = async () => {
    if (!isFilterComplete) {
        setCreatingState('Error')
        return
    }

    const categoriesObject: CreateFilterProps = {}

    Object.entries(categories).forEach(([categoryId, category]) => {
      const selectedParams = getSelectedParams(categoryId, category.params)
      if (selectedParams.length > 0) {
        categoriesObject[categoryId] = {
          categoryName: category.name,
          totalProducts: category.totalProducts,
          params: {},
        }
        selectedParams.forEach((param) => {
          const paramType = paramTypes[`${categoryId}-${param.name}`]?.toLowerCase() || "select"
          categoriesObject[categoryId].params[param.name] = {
            name: param.name,
            totalProducts: param.totalProducts,
            type: paramType === "unit" ? `unit-${paramUnits[`${categoryId}-${param.name}`]}` : paramType,
          }
        })
      }
    })

    try {
        setCreatingState("Creating")
        const result = await createFilter(categoriesObject, delay, "json")

        const createdFilter = JSON.parse(result);
    } finally {
        setCreatingState("Success")
  
        setTimeout(() => setCreatingState("Initial"), 500)
    }
  }

  const handleSetRecommendedToSelect = () => {
    const updatedCheckedParams = { ...checkedParams }
    const updatedParamTypes = { ...paramTypes }
  
    Object.entries(categories).forEach(([categoryId, category]) => {
      category.params.forEach((param) => {
        if (param.totalProducts >= (category.totalProducts / 1.4)) {
          const key = `${categoryId}-${param.name}`
          updatedCheckedParams[key] = true  // Ensure it's checked
          updatedParamTypes[key] = "Select" // Set type to "Select"
        }
      })
    })
  
    setCheckedParams(updatedCheckedParams)
    setParamTypes(updatedParamTypes)
    
    console.log("Updated Filter:", { checkedParams: updatedCheckedParams, paramTypes: updatedParamTypes })
  }
  
  return (
    <div className="mt-12" ref={containerRef}>
      <div className="mb-6 flex gap-2 justify-between max-[560px]:flex-col">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9"
        />
        <div className="w-fit flex gap-2">
            <SelectDelay 
                delay={delay}
                setDelay={setDelay}
            />
            <Button
            size={"sm"}
            onClick={handleSaveFilter}
            disabled={!isFilterComplete}
            className="w-fit"
            >
                {["Initial", "Error"].includes(creatingState) &&
                    <>
                        <Plus className="h-5 w-5 mr-1"/>
                        Save Filter
                    </>
                }
                {creatingState === "Creating" && (
                <>
                    Saving
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
                )}
                {creatingState === "Success" && (
                <>
                    {creatingState}
                    <Check className="ml-2 h-4 w-4" />
                </>
                )}
            </Button>

        </div>
      </div>
      <p className="text-subtle-medium text-red-500 mb-5">{creatingState === "Error" && "All values must be specified"}</p>
      <div className="space-y-4" >
        {filteredCategories.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE).map(([categoryId, category]) => (
          <Accordion type="single" collapsible key={categoryId} className="w-full">
            <AccordionItem value={categoryId} className="border rounded-lg bg-white shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 py-2 hover:no-underline hover:bg-gray-50 transition duration-300 ease-in-out">
                <div className="flex gap-2 items-start w-full max-[650px]:flex-col">
                  <div className="min-w-fit flex items-start space-x-3">
                    <span className="font-medium">{category.name}</span>
                    <Badge
                      variant="secondary"
                      className="ml-2 text-[10px] bg-sky-100 text-sky-800 font-medium px-2 py-1 rounded-full max-[650px]:hidden"
                    >
                      {category.totalProducts} {category.totalProducts !== 1 ? 'prodcuts' : 'product'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-2">
                    <Badge
                        variant="secondary"
                        className="ml-2 text-[10px] bg-sky-100 text-sky-800 font-medium px-2 py-1 rounded-full min-[650px]:hidden"
                        >
                        {category.totalProducts} {category.totalProducts !== 1 ? 'prodcuts' : 'product'}
                    </Badge>
                    {getSelectedParams(categoryId, category.params).map((param, paramIndex) => (
                      <Badge
                        key={paramIndex}
                        variant="secondary"
                        className={`${getBadgeColor(categoryId, param.name)} text-[10px] text-white px-3 py-1 rounded-full`}
                      >
                        {param.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {category.params.map((param, paramIndex) => (
                    <div key={paramIndex} className="flex flex-col space-y-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`${categoryId}-${param.name}`}
                            checked={checkedParams[`${categoryId}-${param.name}`] || false}
                            onCheckedChange={() => handleParamCheck(categoryId, param.name)}
                            className="w-5 h-5"
                          />
                          <label htmlFor={`${categoryId}-${param.name}`} className="text-small-medium font-medium text-gray-900">
                            {param.name}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`${getBadgeColor(categoryId, param.name)} text-[10px] font-medium px-3 rounded-full`}
                          >
                            {param.totalProducts === category.totalProducts ? "All" : param.totalProducts}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Link href={`/admin/filter/${category.name}&${param.name}`} target="_blank"><Eye className="w-4 h-4"/></Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-subtle-medium">Preview product</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                          {param.totalProducts === category.totalProducts && (
                            <span className="text-[10px] ml-2 font-medium">(Recommended)</span>
                          )}
                      {checkedParams[`${categoryId}-${param.name}`] && (
                        <div className="flex space-x-3 mt-2">
                          <Select
                            onValueChange={(value) =>
                              handleParamTypeChange(categoryId, param.name, value as ParamType["type"])
                            }
                            value={paramTypes[`${categoryId}-${param.name}`]}
                          >
                            <SelectTrigger className="w-full sm:w-[140px] text-[12px] h-7 bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-md">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Select">Select</SelectItem>
                              <SelectItem value="Unit">Unit</SelectItem>
                            </SelectContent>
                          </Select>
                          {paramTypes[`${categoryId}-${param.name}`] === "Unit" && (
                            <Input 
                             className="w-full sm:w-[140px] text-[12px] h-7 bg-white border-gray-300 hover:bg-gray-50 focus:ring-0.5 focus:ring-sky-500 focus:border-sky-500 rounded-md"
                             value={paramUnits[`${categoryId}-${param.name}`]}
                             defaultValue=""
                             onChange={(e) => handleUnitChange(categoryId, param.name, e.currentTarget.value)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      <Pagination
        className="mt-12"
        totalPages={pageNumber}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        scrollToTheTop={true}
        containerRef={containerRef}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="fixed right-10 bottom-10 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
              variant="outline"
              size="icon"
              onClick={handleSetRecommendedToSelect}
            >
              <Sparkles className="h-6 w-6 text-blue" />
              <span className="sr-only">Generate with AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" align="center" className="bg-gray-900 text-white">
            <p className="text-sm font-medium">Generate with AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

