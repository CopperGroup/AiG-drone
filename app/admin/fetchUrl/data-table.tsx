"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { proceedDataToDB } from "@/lib/proceedDataToDB"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { FetchedCategory } from "@/lib/types/types"
import { Plus, Search, Columns, ChevronLeft, ChevronRight } from "lucide-react"

export type Product = {
  _id: string
  id: string | null
  name: string | null
  isAvailable: boolean
  quantity: number
  url: string | null
  priceToShow: number
  price: number
  images: (string | null)[]
  vendor: string | null
  description: string | null
  articleNumber: string | null
  params: {
    name: string | null
    value: string | null
  }[]
  isFetched: boolean
  categoryId: string
}

export type DataTableProps<TData extends Product, TValue> = {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  categories: FetchedCategory[]
}

export function DataTable<TData extends Product, TValue>({ columns, data, categories }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [buttonStates, setButtonStates] = React.useState({
    add: { text: "Додати", isProcessing: false },
    update: { text: "Оновити", isProcessing: false },
  })

  const router = useRouter()

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const isProceedDisabled = !(table.getIsAllRowsSelected() || table.getIsSomeRowsSelected())

  const handleProceed = async (data: Product[], merge: boolean) => {
    const buttonType = merge ? "update" : "add"

    setButtonStates({
      ...buttonStates,
      [buttonType]: { text: "Збереження", isProcessing: true },
      [merge ? "add" : "update"]: { ...buttonStates[merge ? "add" : "update"], isProcessing: true },
    })

    try {
      const allSelectedRowsIds = table.getSelectedRowModel().rows.map((row) => row.original.id)
      await proceedDataToDB(data, allSelectedRowsIds, categories, merge)
    } finally {
      setButtonStates({
        ...buttonStates,
        [buttonType]: { text: "Збережено", isProcessing: true },
      })

      setTimeout(() => {
        setButtonStates({
          add: { text: "Додати", isProcessing: false },
          update: { text: "Оновити", isProcessing: false },
        })
      }, 4000)

      router.push("/admin/products")
    }
  }

  return (
    <div className="w-full max-md:pb-12 bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-heading3-bold mb-2">Управління товарами</h2>
        <p className="text-base-regular text-muted-foreground">Перегляд, фільтрація та управління товарами</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Пошук за назвою товару..."
              value={(table.getColumn("name")?.getFilterValue() as string | undefined) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="pl-10 text-base-regular border-muted focus-visible:ring-primary"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto text-small-medium gap-2">
                <Columns className="h-4 w-4" />
                <span className="hidden sm:inline">Налаштувати стовпці</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white w-56">
              <DropdownMenuLabel className="text-small-semibold">Видимість стовпців</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-small-regular"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.header?.toString().replace(/[^А-ЩЬ-ЯҐЄІЇа-щь-яґєії\s]/g, "")}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/20">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-small-semibold text-muted-foreground py-4">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/10 transition-all border-b last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-base-regular py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-base-medium">
                    Данні не знайдено.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-small-medium text-muted-foreground order-2 sm:order-1 w-full sm:w-auto text-center sm:text-left">
            {table.getFilteredSelectedRowModel().rows.length} з {table.getFilteredRowModel().rows.length} товарів
            вибрано
          </div>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="text-small-medium flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Попередня
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="text-small-medium flex-1 sm:flex-none"
              >
                Наступна
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleProceed(data, false)}
                disabled={isProceedDisabled || buttonStates.update.isProcessing}
                className="text-small-medium flex-1 sm:flex-none bg-neutral-900 hover:bg-neutral-900/90 text-white"
              >
                {buttonStates.add.text}
                {buttonStates.add.isProcessing && buttonStates.add.text === "Збереження" ? (
                  <Image height={20} width={20} src="/assets/spinner.svg" alt="Loading" className="ml-2" />
                ) : buttonStates.add.isProcessing && buttonStates.add.text === "Збережено" ? (
                  <Image height={20} width={20} src="/assets/success.svg" alt="Success" className="ml-2" />
                ) : (
                  <Plus className="ml-2 h-4 w-4" />
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleProceed(data, true)}
                disabled={isProceedDisabled || buttonStates.add.isProcessing}
                className="text-small-medium flex-1 sm:flex-none bg-green-600 text-white hover:bg-green-500"
              >
                {buttonStates.update.text}
                {buttonStates.update.isProcessing && buttonStates.update.text === "Збереження" ? (
                  <Image height={20} width={20} src="/assets/spinner.svg" alt="Loading" className="ml-2" />
                ) : buttonStates.update.isProcessing && buttonStates.update.text === "Збережено" ? (
                  <Image height={20} width={20} src="/assets/success.svg" alt="Success" className="ml-2" />
                ) : (
                  <Image height={20} width={20} src="/assets/arrow-right-circle.svg" alt="Proceed" className="ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

