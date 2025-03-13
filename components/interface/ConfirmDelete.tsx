"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

type ConfirmDeleteProps = { label: string, value: string, setConfirmationName: React.Dispatch<React.SetStateAction<string>>, disabled?: boolean} & ({ stages: "one" } | { stages: "two", secondLabel: string, secondValue: string, setSecondConfirmation: React.Dispatch<React.SetStateAction<string>>})

const ConfirmDelete = (props: ConfirmDeleteProps) => {
  return (
    <>
        <h3 className="text-base-bold mb-4 text-gray-700">Confirmation Required</h3>
        <div className="space-y-4">
        <div>
            <Label htmlFor="categoryName" className="text-base-semibold mb-2 block">
            Type {props.label} to confirm
            </Label>
            <Input
              id="categoryName"
              value={props.value}
              onChange={(e) => props.setConfirmationName(e.target.value)}
              className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
              placeholder={props.label}
              disabled={props.disabled}
            />
        </div>
        {props.stages == "two" && (
            <div>
                <Label htmlFor="deleteConfirmation" className="text-base-semibold mb-2 block">
                Type <span className="font-semibold text-red-500">{props.secondLabel}</span> to confirm
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={props.secondValue}
                  onChange={(e) => props.setSecondConfirmation(e.target.value)}
                  className="text-base-regular border-gray-300 focus:border-gray-400 rounded-md"
                  placeholder={`Type ${props.secondLabel}`}
                  disabled={props.disabled}
                />
            </div>
        )}
        </div>
    </>
  )
}

export default ConfirmDelete