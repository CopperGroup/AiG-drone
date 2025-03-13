'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PlusCircle, Settings } from 'lucide-react'

const existingConfigurators = ['Default', 'Custom 1', 'Custom 2']

export default function SelectConfigurator() {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [newConfiguratorName, setNewConfiguratorName] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedOption === 'new' && newConfiguratorName) {
    } else if (selectedOption !== 'new') {
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Choose Configurator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup onValueChange={setSelectedOption} className="space-y-4">
            {existingConfigurators.map((configurator) => (
              <div key={configurator} className="flex items-center space-x-2">
                <RadioGroupItem value={configurator} id={configurator} />
                <Label htmlFor={configurator} className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>{configurator}</span>
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Create New Configurator</span>
              </Label>
            </div>
          </RadioGroup>

          {selectedOption === 'new' && (
            <div className="space-y-2">
              <Label htmlFor="newConfiguratorName">New Configurator Name</Label>
              <Input
                id="newConfiguratorName"
                value={newConfiguratorName}
                onChange={(e) => setNewConfiguratorName(e.target.value)}
                placeholder="Enter new configurator name"
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            {selectedOption === 'new' ? 'Create' : 'Select'} Configurator
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

