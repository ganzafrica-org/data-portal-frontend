"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, AlertCircle, Plus, Trash2, Check, Database, Filter, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { DataRequest } from "@/lib/data"
import { DATASET_CATEGORIES, TRANSACTION_TYPES, LAND_USE_TYPES } from "@/lib/dataset-config"
import { cn } from "@/lib/utils"
import DateRangePicker from "@/components/date-range-picker";
import AdministrativeLevelSelector from "@/components/administrative-level-selector";

interface DatasetSelection {
    id: string
    category: string
    type: string
    criteria: Record<string, any>
}


interface RequestFormProps {
    mode: 'create' | 'edit'
    initialData?: DataRequest
}

export default function RequestForm({ mode, initialData }: RequestFormProps) {
    const { user } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        applicantType: initialData?.applicantType || 'individual' as const,
    })

    const [datasetSelections, setDatasetSelections] = useState<DatasetSelection[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!user) return null

    const isExternal = user.role === 'external'

    const addDatasetSelection = () => {
        const newSelection: DatasetSelection = {
            id: Date.now().toString(),
            category: '',
            type: '',
            criteria: {}
        }
        setDatasetSelections([...datasetSelections, newSelection])
    }

    const removeDatasetSelection = (id: string) => {
        setDatasetSelections(datasetSelections.filter(selection => selection.id !== id))
    }

    const updateDatasetSelection = (id: string, field: string, value: any) => {
        setDatasetSelections(selections =>
            selections.map(selection =>
                selection.id === id
                    ? { ...selection, [field]: value, ...(field === 'category' ? { type: '', criteria: {} } : {}) }
                    : selection
            )
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
        const category = DATASET_CATEGORIES[selection.category as keyof typeof DATASET_CATEGORIES]
        const dataset = category?.datasets.find(d => d.id === selection.type)

        return (
            <Card key={selection.id} className="relative border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                            <Database className="h-5 w-5 mr-2 text-primary" />
                            Dataset {index + 1}
                        </CardTitle>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDatasetSelection(selection.id)}
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
                                    {Object.entries(DATASET_CATEGORIES).map(([key, category]) => (
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
                            <Label>Specific Dataset *</Label>
                            <Select
                                value={selection.type}
                                onValueChange={(value) => updateDatasetSelection(selection.id, 'type', value)}
                                disabled={!selection.category}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select specific dataset" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selection.category && DATASET_CATEGORIES[selection.category as keyof typeof DATASET_CATEGORIES]?.datasets.map(dataset => (
                                        <SelectItem key={dataset.id} value={dataset.id}>
                                            <div>
                                                <div className="font-medium">{dataset.name}</div>
                                                <div className="text-xs text-gray-500">{dataset.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    
                    {dataset && (
                        <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center">
                                <Filter className="h-4 w-4 mr-2 text-primary" />
                                <h4 className="font-medium text-gray-900">Dataset Configuration</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {dataset.hasAdminLevel && (
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
                                )}

                                
                                {dataset.hasTransactionType && (
                                    <div className="space-y-2">
                                        <Label>Transaction Type</Label>
                                        <TransactionTypeSelector
                                            value={selection.criteria.transactionType || 'all'}
                                            onChange={(value) => updateDatasetCriteria(selection.id, 'transactionType', value)}
                                        />
                                    </div>
                                )}

                                
                                {dataset.hasLandUse && (
                                    <div className="space-y-2">
                                        <Label>Land Use Type *</Label>
                                        <Select
                                            value={selection.criteria.landUse || ''}
                                            onValueChange={(value) => updateDatasetCriteria(selection.id, 'landUse', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select land use type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LAND_USE_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                
                                {dataset.requiresUpi && (
                                    <div className="space-y-2">
                                        <Label>UPI List *</Label>
                                        <Textarea
                                            value={selection.criteria.upi || ''}
                                            onChange={(e) => updateDatasetCriteria(selection.id, 'upi', e.target.value)}
                                            placeholder="Enter UPIs separated by commas or new lines (e.g., 3/01/11/01/88, 3/01/11/01/89)"
                                            rows={3}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            At least one UPI is required for shapefile generation
                                        </p>
                                    </div>
                                )}

                                
                                {dataset.requiresUpiList && (
                                    <div className="space-y-2">
                                        <Label>UPI List *</Label>
                                        <Textarea
                                            value={selection.criteria.upiList || ''}
                                            onChange={(e) => updateDatasetCriteria(selection.id, 'upiList', e.target.value)}
                                            placeholder="Enter UPIs separated by commas or new lines"
                                            rows={4}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Upload a CSV file with UPIs or enter them manually
                                        </p>
                                    </div>
                                )}

                                
                                {dataset.requiresIdList && (
                                    <div className="space-y-2">
                                        <Label>National ID List *</Label>
                                        <Textarea
                                            value={selection.criteria.idList || ''}
                                            onChange={(e) => updateDatasetCriteria(selection.id, 'idList', e.target.value)}
                                            placeholder="Enter National IDs separated by commas or new lines"
                                            rows={4}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Upload a CSV file with IDs or enter them manually
                                        </p>
                                    </div>
                                )}

                                
                                {dataset.requiresPeriod && (
                                    <div className="space-y-2">
                                        <Label>Date Period *</Label>
                                        <DateRangePicker
                                            dateRange={selection.criteria.dateRange}
                                            onDateRangeChange={(range) => updateDatasetCriteria(selection.id, 'dateRange', range)}
                                        />
                                    </div>
                                )}

                                
                                {dataset.fields && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Available Fields</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {dataset.fields.map((field, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {field}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setUploadedFiles(prev => [...prev, ...files])
    }

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const getRequiredDocuments = () => {
        if (!isExternal) {
            return [
                'Authorization letter from supervisor/department head',
                'Project documentation (if applicable)'
            ]
        }

        const required = []

        if (formData.applicantType === 'individual') {
            required.push('National ID or Passport')
        } else {
            required.push('Organization registration certificate')
            required.push('Authorization letter from organization')
        }

        required.push('Research proposal or project documentation')

        return required
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

            const category = DATASET_CATEGORIES[selection.category as keyof typeof DATASET_CATEGORIES]
            const dataset = category?.datasets.find(d => d.id === selection.type)

            if (dataset?.hasAdminLevel && !selection.criteria.administrativeSelection?.provinces?.length) {
                toast.error('Please select administrative level for all datasets')
                return false
            }

            if (dataset?.requiresPeriod && !selection.criteria.dateRange) {
                toast.error('Please select date range for all datasets that require it')
                return false
            }

            if (dataset?.requiresUpi && !selection.criteria.upi?.trim()) {
                toast.error('Please provide at least one UPI for shapefile datasets')
                return false
            }
        }

        if (isExternal && uploadedFiles.length === 0 && mode === 'create') {
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
        <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                    {mode === 'create' ? 'Create New Data Request' : 'Edit Data Request'}
                </h1>
                <p className="text-gray-600">
                    {mode === 'create'
                        ? 'Submit a request to access land administration data with specific criteria'
                        : 'Update your data request details and configuration'
                    }
                </p>
            </div>

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

                        {isExternal && (
                            <div className="space-y-2">
                                <Label>Applicant Type *</Label>
                                <Select
                                    value={formData.applicantType}
                                    onValueChange={(value: 'individual' | 'organization' | 'company') =>
                                        setFormData(prev => ({ ...prev, applicantType: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual Researcher</SelectItem>
                                        <SelectItem value="organization">Research Organization</SelectItem>
                                        <SelectItem value="company">Private Company</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Database className="h-5 w-5 mr-2" />
                            Dataset Selection
                        </CardTitle>
                        <CardDescription>
                            Choose the specific datasets you need and configure their parameters. You can request multiple datasets with different criteria.
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
                                    className="w-full border-dashed border-2 h-12"
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
                            Upload required documents to support your request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900">Required Documents</h4>
                                    <ul className="mt-2 space-y-1">
                                        {getRequiredDocuments().map((doc, idx) => (
                                            <li key={idx} className="text-sm text-blue-800">• {doc}</li>
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
                                    className="w-full h-20 border-dashed border-2"
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
                                <Label>Uploaded Files</Label>
                                <div className="space-y-2">
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(idx)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                
                <div className="flex justify-end space-x-4 pb-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full border-b-2 border-white mr-2"></div>
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

interface TransactionTypeSelectorProps {
    value: string
    onChange: (value: string) => void
}

function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? TRANSACTION_TYPES.find((type) => type.value === value)?.label
                        : "Select transaction type..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search transaction types..." />
                    <CommandEmpty>No transaction type found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList className="max-h-60 overflow-auto">
                            {TRANSACTION_TYPES.map((type) => (
                                <CommandItem
                                    key={type.value}
                                    value={type.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === type.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {type.label}
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}