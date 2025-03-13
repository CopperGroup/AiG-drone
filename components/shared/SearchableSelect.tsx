"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"

export type Item = {
  [key: string]: string
}

interface SearchableSelectProps<T extends Item> {
  isForm: boolean
  items: T[]
  placeholder?: string
  value?: string
  onValueChange: (value: string) => void
  renderValue: keyof T
  searchValue: keyof T
  itemValue: keyof T
  className?: string
  triggerStyle?: string
  disabled?: boolean
}

export function SearchableSelect<T extends Item>({
  isForm,
  items,
  placeholder = "Select an item",
  value,
  onValueChange,
  renderValue,
  searchValue,
  itemValue,
  className,
  triggerStyle,
  disabled = false
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  // Prevent scroll when popover is open
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = originalStyle
    }
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [open])

  const filteredItems = React.useMemo(() => {
    setIsLoading(true)
    const result = items.filter((item) => String(item[searchValue]).toLowerCase().includes(searchQuery.toLowerCase()))
    setIsLoading(false)
    return result
  }, [items, searchValue, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isForm ? (
            <FormControl>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", triggerStyle)} disabled={disabled}>
                    <span className="truncate">{value ? items.find((item) => item[itemValue] === value)?.[renderValue] : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </FormControl>

        ): (
            <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", triggerStyle)} disabled={disabled}>
                <span className="truncate">{value ? items.find((item) => item[itemValue] === value)?.[renderValue] : placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0 min-h-[260px]", className)}>
        <Command className="w-full">
          <CommandInput placeholder="Search items..." onValueChange={setSearchQuery} />
          <CommandList>
            {isLoading ? (
              <CommandItem className="justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Loading...
              </CommandItem>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>No items found.</CommandEmpty>
            ) : (
              <CommandGroup className="h-[200px] overflow-y-auto">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item[itemValue]}
                    onSelect={() => {
                      onValueChange(item[itemValue] === value ? "" : item[itemValue])
                      setOpen(false)
                    }}
                    className="flex items-center"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        value === item[itemValue] ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{item[renderValue]}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

