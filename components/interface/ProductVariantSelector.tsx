"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

type VariantOption = {
  _id: string
  value: string
}

type SelectParams = Record<string, VariantOption[]>

type ProductVariantSelectorProps = {
  selectParams: SelectParams
  productId: string
}

export default function ProductVariantSelector({ selectParams, productId }: ProductVariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    const initialVariants: Record<string, string> = {}

    Object.entries(selectParams).forEach(([param, options]) => {
      const defaultOption = options.find((option) => option._id === productId)
      if (defaultOption) {
        initialVariants[param] = defaultOption._id
      } else if (options.length > 0) {
        initialVariants[param] = options[0]._id // Fallback to the first option
      }
    })

    setSelectedVariants(initialVariants)
  }, [selectParams, productId])

  const handleVariantChange = (param: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [param]: value }))
    router.push(`/catalog/${value}`)
  }

  if (Object.keys(selectedVariants).length === 0) {
    // Avoid rendering until selectedVariants is fully initialized
    return null
  }

  return (
    <div>
      <p className="text-xl font-semibold mb-4 text-gray-800">Варіації</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(selectParams).map(([param, options]) => (
          <div key={param} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">{param}</h3>
            <Select defaultValue={selectedVariants[param]} onValueChange={(value) => handleVariantChange(param, value)}>
              <SelectTrigger className="w-full border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus:ring-0 hover:border-gray-800 transition-all duration-200">
                <SelectValue placeholder={`Select ${param}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option._id}
                    value={option._id}
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  >
                    <span className="text-sm">{option.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}

