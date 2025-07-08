"use client"

import React, {useState} from "react";
import {Districts, Provinces, Sectors} from "rwanda";
import {Label} from "@/components/ui/label";
import MultiSelectDropdown from "@/components/multi-select-dropdown";

interface AdministrativeSelection {
    provinces: string[]
    districts: string[]
    sectors: string[]
    cells: string[]
    villages: string[]
}

interface AdministrativeLevelSelectorProps {
    value: AdministrativeSelection
    onChange: (selection: AdministrativeSelection) => void
}

export default function AdministrativeLevelSelector({ value, onChange }: AdministrativeLevelSelectorProps) {
    const [currentSelection, setCurrentSelection] = useState<AdministrativeSelection>(
        value || { provinces: [], districts: [], sectors: [], cells: [], villages: [] }
    )

    const provinces = Provinces()

    const updateSelection = (level: keyof AdministrativeSelection, items: string[]) => {
        const newSelection = { ...currentSelection, [level]: items }

        if (level === 'provinces') {
            newSelection.districts = []
            newSelection.sectors = []
            newSelection.cells = []
            newSelection.villages = []
        } else if (level === 'districts') {
            newSelection.sectors = []
            newSelection.cells = []
            newSelection.villages = []
        } else if (level === 'sectors') {
            newSelection.cells = []
            newSelection.villages = []
        } else if (level === 'cells') {
            newSelection.villages = []
        }

        setCurrentSelection(newSelection)
        onChange(newSelection)
    }

    const getAvailableDistricts = () => {
        if (currentSelection.provinces.length === 0) return []

        const allDistricts: string[] = []
        currentSelection.provinces.forEach(province => {
            const provinceDistricts = Districts(province)
            if (provinceDistricts) {
                allDistricts.push(...provinceDistricts)
            }
        })
        return allDistricts
    }

    const getAvailableSectors = () => {
        if (currentSelection.districts.length === 0) return []

        const allSectors: string[] = []
        currentSelection.districts.forEach(district => {

            const province = currentSelection.provinces.find(p => {
                const provinceDistricts = Districts(p)
                return provinceDistricts?.includes(district)
            })

            if (province) {
                const districtSectors = Sectors(province, district)
                if (districtSectors) {
                    allSectors.push(...districtSectors)
                }
            }
        })
        return allSectors
    }

    return (
        <div className="space-y-4">
            <Label>Administrative Level *</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Provinces</Label>
                <MultiSelectDropdown
                    options={provinces.map(p => ({ value: p, label: p }))}
                    selectedValues={currentSelection.provinces}
                    onSelectionChange={(selected) => updateSelection('provinces', selected)}
                    placeholder="Select provinces"
                />
            </div>


            
            {currentSelection.provinces.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Districts</Label>
                    <MultiSelectDropdown
                        options={getAvailableDistricts().map(d => ({ value: d, label: d }))}
                        selectedValues={currentSelection.districts}
                        onSelectionChange={(selected) => updateSelection('districts', selected)}
                        placeholder="Select districts"
                    />
                </div>
            )}

            
            {currentSelection.districts.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Sectors (Optional)</Label>
                    <MultiSelectDropdown
                        options={getAvailableSectors().map(s => ({ value: s, label: s }))}
                        selectedValues={currentSelection.sectors}
                        onSelectionChange={(selected) => updateSelection('sectors', selected)}
                        placeholder="Select sectors (optional)"
                    />
                </div>
            )}
            </div>
            
            {currentSelection.provinces.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm">
                        <p className="font-medium text-blue-900">Selected Administrative Areas:</p>
                        <p className="text-blue-800">
                            {currentSelection.provinces.length} province{currentSelection.provinces.length !== 1 ? 's' : ''}
                            {currentSelection.districts.length > 0 && `, ${currentSelection.districts.length} district${currentSelection.districts.length !== 1 ? 's' : ''}`}
                            {currentSelection.sectors.length > 0 && `, ${currentSelection.sectors.length} sector${currentSelection.sectors.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
            )}

        </div>
    )
}
