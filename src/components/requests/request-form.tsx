"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Upload, X, FileText, AlertCircle, Plus, Trash2, Database, Filter, ChevronDown, ChevronRight, Info, Eye, Building, User } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { DataRequest } from "@/lib/data"
import { DATASET_CATEGORIES, TRANSACTION_TYPES, LAND_USE_TYPES } from "@/lib/dataset-config"
import DateRangePicker from "@/components/date-range-picker"
import AdministrativeLevelSelector from "@/components/administrative-level-selector"
import MultiSelectDropdown from "@/components/multi-select-dropdown"

interface DatasetSelection {
    id: string
    category: string
    type: string
    criteria: Record<string, any>
    isOpen: boolean
}

interface RequestFormProps {
    mode: 'create' | 'edit'
    initialData?: DataRequest
}

interface FileWithCategory {
    file: File
    category: 'verification' | 'research' | 'authorization' | 'other'
}

const UpiBadge = ({ upi, onRemove }: { upi: string, onRemove: () => void }) => (
    <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
        {upi}
        <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
    </Badge>
)

const UpiInput = ({ value, onChange, placeholder }: {
    value: string[],
    onChange: (upis: string[]) => void,
    placeholder: string
}) => {
    const [inputValue, setInputValue] = useState('')

    const addUpi = () => {
        if (inputValue.trim() && !value.includes(inputValue.trim())) {
            onChange([...value, inputValue.trim()])
            setInputValue('')
        }
    }

    const removeUpi = (upiToRemove: string) => {
        onChange(value.filter(upi => upi !== upiToRemove))
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addUpi()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedText = e.clipboardData.getData('text')
        const upis = pastedText.split(/[,\n\r]+/).map(upi => upi.trim()).filter(upi => upi)
        const newUpis = upis.filter(upi => !value.includes(upi))
        onChange([...value, ...newUpis])
    }

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type === 'text/csv') {
            const reader = new FileReader()
            reader.onload = (e) => {
                const csvContent = e.target?.result as string
                const lines = csvContent.split('\n')
                const upis = lines
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('UPI')) // Skip headers
                    .filter(upi => !value.includes(upi))

                onChange([...value, ...upis])
                toast.success(`Added ${upis.length} UPIs from CSV file`)
            }
            reader.readAsText(file)
        } else {
            toast.error('Please upload a valid CSV file')
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button type="button" onClick={addUpi} size="sm" disabled={!inputValue.trim()}>
                    Add
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload CSV
                </Button>
                <span className="text-xs text-muted-foreground">or paste/type manually</span>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md min-h-[2.5rem]">
                    {value.map((upi, index) => (
                        <UpiBadge key={index} upi={upi} onRemove={() => removeUpi(upi)} />
                    ))}
                </div>
            )}
            <p className="text-xs text-muted-foreground">
                Enter UPIs manually, paste multiple UPIs, or upload a CSV file with UPI column
            </p>
        </div>
    )
}

const DatasetPreview = ({ dataset }: { dataset: any }) => {
    const [showPreview, setShowPreview] = useState(false)

    if (!dataset?.fields) return null

    const sampleData = [
        dataset.fields.reduce((acc: any, field: string, index: number) => {
            acc[field] = `Sample ${index + 1}`
            return acc
        }, {}),
        dataset.fields.reduce((acc: any, field: string, index: number) => {
            acc[field] = `Example ${index + 1}`
            return acc
        }, {}),
        dataset.fields.reduce((acc: any, field: string, index: number) => {
            acc[field] = `Data ${index + 1}`
            return acc
        }, {})
    ]

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
            >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide' : 'Show'} Data Preview
            </Button>

            {showPreview && (
                <div className="border rounded-lg p-3 bg-gray-50">
                    <h5 className="font-medium text-sm mb-2">Sample Data Structure:</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                            <tr className="bg-gray-100">
                                {dataset.fields.slice(0, 5).map((field: string, index: number) => (
                                    <th key={index} className="border p-1 text-left font-medium">
                                        {field}
                                    </th>
                                ))}
                                {dataset.fields.length > 5 && <th className="border p-1 text-left">...</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {sampleData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {dataset.fields.slice(0, 5).map((field: string, colIndex: number) => (
                                        <td key={colIndex} className="border p-1 text-gray-600">
                                            {row[field]}
                                        </td>
                                    ))}
                                    {dataset.fields.length > 5 && <td className="border p-1 text-gray-400">...</td>}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {dataset.fields.length > 5 && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Showing first 5 of {dataset.fields.length} columns
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default function RequestForm({ mode, initialData }: RequestFormProps) {
    const { user, getUserDisplayInfo, getRequiredDocuments } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
    })

    const [datasetSelections, setDatasetSelections] = useState<DatasetSelection[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<FileWithCategory[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!user) return null

    const userInfo = getUserDisplayInfo()
    const requiredDocuments = getRequiredDocuments()

    const getAvailableDatasets = () => {


        const userDatasets = Object.entries(DATASET_CATEGORIES).reduce((acc, [categoryKey, category]) => {
            const filteredDatasets = category.datasets.filter(dataset => {

                if (user.role === 'external') {

                    return !dataset.id.includes('internal-') && !dataset.id.includes('admin-')
                }
                return true // Internal users can access all
            })

            if (filteredDatasets.length > 0) {
                acc[categoryKey] = { ...category, datasets: filteredDatasets }
            }
            return acc
        }, {} as typeof DATASET_CATEGORIES)

        return userDatasets
    }

    const availableDatasets = getAvailableDatasets()

    const addDatasetSelection = () => {
        const newSelection: DatasetSelection = {
            id: Date.now().toString(),
            category: '',
            type: '',
            criteria: {},
            isOpen: true
        }

        const updatedSelections = datasetSelections.map(selection => ({
            ...selection,
            isOpen: false
        }))

        setDatasetSelections([...updatedSelections, newSelection])
    }

    const removeDatasetSelection = (id: string) => {
        setDatasetSelections(datasetSelections.filter(selection => selection.id !== id))
    }

    const updateDatasetSelection = (id: string, field: string, value: any) => {
        setDatasetSelections(selections =>
            selections.map(selection =>
                selection.id === id
                    ? {
                        ...selection,
                        [field]: value,
                        ...(field === 'category' ? { type: '', criteria: {} } : {})
                    }
                    : selection
            )
        )
    }

    const toggleDatasetOpen = (id: string) => {
        setDatasetSelections(selections =>
            selections.map(selection => ({
                ...selection,
                isOpen: selection.id === id ? !selection.isOpen : false
            }))
        )
    }

    const updateDatasetCriteria = (selectionId: string, criterion: string, value: any) => {
        setDatasetSelections(selections =>
            selections.map(selection =>
                selection.id === selectionId
                    ? { ...selection, criteria: { ...selection.criteria, [criterion]: value } }
                    : selection
            )
        )
    }

    const renderDatasetCategoryCard = (selection: DatasetSelection, index: number) => {
        const category = availableDatasets[selection.category as keyof typeof availableDatasets]
        const dataset = category?.datasets.find(d => d.id === selection.type)

        return (
            <Card key={selection.id} className="relative border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                <Collapsible open={selection.isOpen} onOpenChange={() => toggleDatasetOpen(selection.id)}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                    <Database className="h-5 w-5 mr-2 text-primary" />
                                    Dataset {index + 1}
                                    {selection.isOpen ? (
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    )}
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeDatasetSelection(selection.id)
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            {category && (
                                <CardDescription className="flex items-center">
                                    <span className="text-lg mr-2">{category.icon}</span>
                                    {category.description}
                                </CardDescription>
                            )}
                        </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Data Category *</Label>
                                    <Select
                                        value={selection.category}
                                        onValueChange={(value) => updateDatasetSelection(selection.id, 'category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a data category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(availableDatasets).map(([key, category]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{category.icon}</span>
                                                        {category.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label>Specific Dataset *</Label>
                                        {dataset && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <div className="space-y-2">
                                                            <p className="font-medium">{dataset.name}</p>
                                                            <p className="text-sm">{dataset.description}</p>
                                                            {dataset.fields && (
                                                                <div>
                                                                    <p className="text-sm font-medium">Available Fields:</p>
                                                                    <p className="text-xs text-gray-600">
                                                                        {dataset.fields.slice(0, 5).join(', ')}
                                                                        {dataset.fields.length > 5 && ` and ${dataset.fields.length - 5} more...`}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <Select
                                        value={selection.type}
                                        onValueChange={(value) => updateDatasetSelection(selection.id, 'type', value)}
                                        disabled={!selection.category}
                                    >
                                        <SelectTrigger className="max-w-64 overflow-x-clip">
                                            <SelectValue placeholder="Select specific dataset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selection.category && availableDatasets[selection.category as keyof typeof availableDatasets]?.datasets.map(dataset => (
                                                <SelectItem key={dataset.id} value={dataset.id}>
                                                    <div>
                                                        <div className="font-medium">{dataset.name}</div>
                                                        <div className="text-xs text-gray-500 truncate">{dataset.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {dataset && <DatasetPreview dataset={dataset} />}

                            {dataset && (
                                <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center">
                                        <Filter className="h-4 w-4 mr-2 text-primary" />
                                        <h4 className="font-medium text-gray-900">Dataset Configuration</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {dataset.hasAdminLevel && (
                                            <div className="md:col-span-2">
                                                <AdministrativeLevelSelector
                                                    value={selection.criteria.administrativeSelection || {
                                                        provinces: [],
                                                        districts: [],
                                                        sectors: [],
                                                        cells: [],
                                                        villages: [],
                                                    }}
                                                    onChange={(adminSelection) => updateDatasetCriteria(selection.id, 'administrativeSelection', adminSelection)}
                                                />
                                            </div>
                                        )}

                                        {dataset.hasTransactionType && (
                                            <div className="space-y-2">
                                                <Label>Transaction Types</Label>
                                                <MultiSelectDropdown
                                                    options={TRANSACTION_TYPES}
                                                    selectedValues={selection.criteria.transactionTypes || []}
                                                    onSelectionChange={(selected) => updateDatasetCriteria(selection.id, 'transactionTypes', selected)}
                                                    placeholder="Select transaction types"
                                                />
                                            </div>
                                        )}

                                        {dataset.hasLandUse && (
                                            <div className="space-y-2">
                                                <Label>Land Use Types</Label>
                                                <MultiSelectDropdown
                                                    options={LAND_USE_TYPES}
                                                    selectedValues={selection.criteria.landUseTypes || []}
                                                    onSelectionChange={(selected) => updateDatasetCriteria(selection.id, 'landUseTypes', selected)}
                                                    placeholder="Select land use types"
                                                />
                                            </div>
                                        )}

                                        {dataset.hasSizeRange && (
                                            <div className="space-y-2">
                                                <Label>Size Range (hectares)</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={selection.criteria.minSize || ''}
                                                        onChange={(e) => updateDatasetCriteria(selection.id, 'minSize', e.target.value)}
                                                        placeholder="Min size"
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={selection.criteria.maxSize || ''}
                                                        onChange={(e) => updateDatasetCriteria(selection.id, 'maxSize', e.target.value)}
                                                        placeholder="Max size"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {dataset.hasUserLevel && (
                                            <div className="space-y-2">
                                                <Label>User ID *</Label>
                                                <Input
                                                    value={selection.criteria.userId || ''}
                                                    onChange={(e) => updateDatasetCriteria(selection.id, 'userId', e.target.value)}
                                                    placeholder="Enter user ID"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {dataset.requiresPeriod && (
                                            <div className="space-y-2">
                                                <Label>Date Period *</Label>
                                                <DateRangePicker
                                                    dateRange={selection.criteria.dateRange}
                                                    onDateRangeChange={(range) => updateDatasetCriteria(selection.id, 'dateRange', range)}
                                                />
                                            </div>
                                        )}

                                        {(dataset.requiresUpi || dataset.requiresUpiList) && (
                                            <div className="space-y-2">
                                                <Label>UPI List *</Label>
                                                <UpiInput
                                                    value={selection.criteria.upiList || []}
                                                    onChange={(upis) => updateDatasetCriteria(selection.id, 'upiList', upis)}
                                                    placeholder="Enter UPI (e.g., 3/01/11/01/88)"
                                                />
                                                {dataset.requiresUpi && (
                                                    <p className="text-sm text-muted-foreground">
                                                        At least one UPI is required for shapefile generation
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {dataset.requiresIdList && (
                                            <div className="space-y-2">
                                                <Label>National ID List *</Label>
                                                <UpiInput
                                                    value={selection.criteria.idList || []}
                                                    onChange={(ids) => updateDatasetCriteria(selection.id, 'idList', ids)}
                                                    placeholder="Enter National ID"
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Upload a CSV file with IDs or enter them manually
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        )
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        const filesWithCategory = files.map(file => ({
            file,
            category: 'other' as const
        }))
        setUploadedFiles(prev => [...prev, ...filesWithCategory])
    }

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const updateFileCategory = (index: number, category: 'verification' | 'research' | 'authorization' | 'other') => {
        setUploadedFiles(prev =>
            prev.map((fileObj, i) =>
                i === index ? { ...fileObj, category } : fileObj
            )
        )
    }

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error('Please enter a request title')
            return false
        }

        if (!formData.description.trim()) {
            toast.error('Please provide a description')
            return false
        }

        if (datasetSelections.length === 0) {
            toast.error('Please add at least one dataset')
            return false
        }

        for (const selection of datasetSelections) {
            if (!selection.category || !selection.type) {
                toast.error('Please complete all dataset selections')
                return false
            }

            const category = availableDatasets[selection.category as keyof typeof availableDatasets]
            const dataset = category?.datasets.find(d => d.id === selection.type)

            if (dataset?.hasAdminLevel && !selection.criteria.administrativeSelection?.provinces?.length) {
                toast.error('Please select administrative level for all datasets')
                return false
            }

            if (dataset?.requiresPeriod && !selection.criteria.dateRange) {
                toast.error('Please select date range for all datasets that require it')
                return false
            }

            if ((dataset?.requiresUpi || dataset?.requiresUpiList) && (!selection.criteria.upiList || selection.criteria.upiList.length === 0)) {
                toast.error('Please provide at least one UPI for datasets that require it')
                return false
            }

            if (dataset?.requiresIdList && (!selection.criteria.idList || selection.criteria.idList.length === 0)) {
                toast.error('Please provide at least one National ID for datasets that require it')
                return false
            }
        }

        const requiredDocs = requiredDocuments.filter(doc => doc.required)
        if (user.role === 'external' && requiredDocs.length > 0 && uploadedFiles.length === 0 && mode === 'create') {
            toast.error('Please upload required supporting documents')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 2000))

            const action = mode === 'create' ? 'created' : 'updated'
            toast.success(`Request ${action} successfully`)
            router.push('/requests')

        } catch (error: any) {
            toast.error(`Failed to ${mode} request`)
            console.error('Error submitting request:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {mode === 'create' ? 'Create New Data Request' : 'Edit Data Request'}
                </h1>
                <p className="text-gray-600">
                    {mode === 'create'
                        ? 'Submit a request to access land administration data with specific criteria'
                        : 'Update your data request details and configuration'
                    }
                </p>
            </div>

            
            <Card className="bg-blue p-4 text-white">
                <CardContent className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        {userInfo.isOrganization ? (
                            <Building className="h-6 w-6" />
                        ) : (
                            <User className="h-6 w-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium">{userInfo.displayName}</h3>
                        <p className="text-sm text-white/80">{userInfo.typeLabel}</p>
                        <Badge className="bg-white/20 text-white border-white/20 mt-1">
                            {userInfo.roleLabel}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Provide basic details about your data request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Request Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Land Use Analysis for Kigali District"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the purpose of your data request and how the data will be used..."
                                rows={4}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Database className="h-5 w-5 mr-2" />
                            Dataset Selection
                        </CardTitle>
                        <CardDescription>
                            Choose the specific datasets you need and configure their parameters. Available datasets are filtered based on your user type and access permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {datasetSelections.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets selected</h3>
                                <p className="text-gray-600 mb-4">Start by adding your first dataset to the request.</p>
                                <Button
                                    type="button"
                                    onClick={addDatasetSelection}
                                    className="inline-flex items-center"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Dataset
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {datasetSelections.map((selection, index) => renderDatasetCategoryCard(selection, index))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addDatasetSelection}
                                    className="w-full border-dashed border-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Dataset
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Supporting Documents</CardTitle>
                        <CardDescription>
                            Upload required documents to support your request based on your user type
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-900">Required Documents for {userInfo.typeLabel}</h4>
                                    <ul className="mt-2 space-y-1">
                                        {requiredDocuments.map((doc, idx) => (
                                            <li key={idx} className="text-sm text-blue-800 flex items-center">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="flex-1">{doc.text}</span>
                                                {doc.required && (
                                                    <Badge className="bg-red-100 text-red-800 text-xs ml-2">Required</Badge>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Upload Documents</Label>
                            <div className="mt-1">
                                <Input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xlsx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="w-full h-20 border-dashed border-2 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-6 w-6 mb-2" />
                                        <span>Choose Files or Drag & Drop</span>
                                        <span className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG, CSV, XLSX (Max 10MB each)</span>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {uploadedFiles.map((fileObj, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{fileObj.file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(idx)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pb-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-green hover:bg-green/90"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {mode === 'create' ? 'Creating Request...' : 'Updating Request...'}
                            </>
                        ) : (
                            mode === 'create' ? 'Submit Request' : 'Update Request'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}