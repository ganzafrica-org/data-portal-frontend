import React, {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {ChevronDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Checkbox} from "@/components/ui/checkbox";

interface MultiSelectDropdownProps {
    options: { value: string; label: string }[]
    selectedValues: string[]
    onSelectionChange: (selected: string[]) => void
    placeholder: string
}

export default function MultiSelectDropdown({ options, selectedValues, onSelectionChange, placeholder }: MultiSelectDropdownProps) {
    const [open, setOpen] = useState(false)

    const toggleOption = (value: string) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value]
        onSelectionChange(newSelected)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedValues.length === 0
                        ? placeholder
                        : `${selectedValues.length} selected`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No options found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList className="max-h-60 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => toggleOption(option.value)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={selectedValues.includes(option.value)}
                                            onChange={() => {}}
                                        />
                                        <span>{option.label}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
