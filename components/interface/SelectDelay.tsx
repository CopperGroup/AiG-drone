"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const delayOptions = [
    { value: "0", label: "0" },
    { value: "166", label: "0.10 sec" },
    { value: "250", label: "0.15 sec" },
    { value: "333", label: "0.20 sec" },
    { value: "500", label: "0.30 sec" },
    { value: "750", label: "0.45 sec" },
    { value: "833", label: "50 sec" },
    { value: "1000", label: "1 minute" },
  ];

export function SelectDelay({ delay, setDelay }: { delay: number, setDelay: React.Dispatch<React.SetStateAction<number>>
}) {
    const [selectedDelay, setSelectedDelay] = useState(delayOptions.find(option => option.value === delay.toString())?.value || "250")
    const [isOpen, setIsOpen] = useState(false);

    const handleSetDelay = () => {
        setDelay(parseFloat(delayOptions.find(option => option.value === selectedDelay.toString())?.value || "250"))
        setIsOpen(false)
    }

    return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-small-medium px-2">
            <Clock className="h-5 w-5 mr-1" />
            {delayOptions.find(option => option.value === selectedDelay.toString())?.label || "0.15 sec"}
            {/* <div className="h-7 flex items-start">
                <span className="text-tiny-medium">({delayOptions.find(option => option.value === selectedDelay.toString())?.label || "0.15 sec"})</span>
            </div> */}
        </Button>
        </DialogTrigger>
        <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle className="text-heading4-medium">Choose Delay</DialogTitle>
            <DialogDescription>Delay before the filter will start search</DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Select value={selectedDelay} onValueChange={setSelectedDelay}>
            <SelectTrigger className="w-full text-small-medium h-9">
                <SelectValue placeholder="Select a delay" />
            </SelectTrigger>
            <SelectContent>
                {delayOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-small-medium">
                    {option.label}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <Button onClick={handleSetDelay} size="sm" className="w-full text-small-semibold text-white">
            Set Delay
            <span className="ml-2 text-tiny-medium">{delayOptions.find(option => option.value === selectedDelay.toString())?.label || "0.15 sec"}</span>
        </Button>
        </DialogContent>
    </Dialog>
    )
}

