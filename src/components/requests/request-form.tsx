"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Upload, X, FileText, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { AVAILABLE_DATASETS, DataRequest } from "@/lib/data"
import { cn } from "@/lib/utils"

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
        selectedDatasets: initialData?.requestedDatasets || [],
        dateFrom: initialData?.dateRange?.from ? new Date(initialData.dateRange.from) : undefined,
        dateTo: initialData?.dateRange?.to ? new Date(initialData.dateRange.to) : undefined,
    })

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!user) return null

    const isExternal = user.role === 'external'

    const handleDatasetToggle = (datasetId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedDatasets: prev.selectedDatasets.includes(datasetId)
                ? prev.selectedDatasets.filter(d => d !== datasetId)
                : [...prev.selectedDatasets, datasetId]
        }))
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

        if (formData.selectedDatasets.length === 0) {
            toast.error('Please select at least one dataset')
            return false
        }

        if (!formData.dateFrom || !formData.dateTo) {
            toast.error('Please select a date range')
            return false
        }

        if (formData.dateFrom >= formData.dateTo) {
            toast.error('End date must be after start date')
            return false
        }

        if (formData.dateTo > new Date()) {
            toast.error('End date cannot be in the future')
            return false
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
        <div className="max-w-full space-y-2">
            
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Create New Request' : 'Edit Request'}
                </h1>
                <p className="text-gray-600">
                    {mode === 'create'
                        ? 'Submit a request to access land administration data'
                        : 'Update your data request details'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Provide basic details about your data request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Request Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Land Use Analysis for Kigali District"
                                required
                            />
                        </div>

                        <div>
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
                            <div>
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
                        <CardTitle>Dataset Selection</CardTitle>
                        <CardDescription>
                            Choose the datasets you need for your research or project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {AVAILABLE_DATASETS.map((dataset) => (
                                <div
                                    key={dataset.id}
                                    className={cn(
                                        "border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50",
                                        formData.selectedDatasets.includes(dataset.name) && "border-primary bg-primary/5"
                                    )}
                                    onClick={() => handleDatasetToggle(dataset.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            checked={formData.selectedDatasets.includes(dataset.name)}
                                            onChange={() => handleDatasetToggle(dataset.id)}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {formData.selectedDatasets.length > 0 && (
                            <div className="mt-4">
                                <Label>Selected Datasets:</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.selectedDatasets.map((dataset, idx) => (
                                        <Badge key={idx} variant="secondary">{dataset}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                
                <Card>
                    <CardHeader>
                        <CardTitle>Date Range</CardTitle>
                        <CardDescription>
                            Specify the time period for the data you need
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>From Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dateFrom && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateFrom ? format(formData.dateFrom, "PPP") : "Select start date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dateFrom}
                                            onSelect={(date) => setFormData(prev => ({ ...prev, dateFrom: date }))}
                                            disabled={(date) => date > new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>To Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dateTo && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateTo ? format(formData.dateTo, "PPP") : "Select end date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dateTo}
                                            onSelect={(date) => setFormData(prev => ({ ...prev, dateTo: date }))}
                                            disabled={(date) => date > new Date() || (formData.dateFrom ? date < formData.dateFrom : false)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                
                <Card>
                    <CardHeader>
                        <CardTitle>Supporting Documents</CardTitle>
                        <CardDescription>
                            Upload required documents to support your request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        
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

                        
                        <div>
                            <Label htmlFor="file-upload">Upload Documents</Label>
                            <div className="mt-1">
                                <Input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="w-full"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose Files
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                            </p>
                        </div>

                        
                        {uploadedFiles.length > 0 && (
                            <div>
                                <Label>Uploaded Files</Label>
                                <div className="space-y-2 mt-2">
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
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

                
                <div className="flex justify-end space-x-4">
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
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {mode === 'create' ? 'Creating...' : 'Updating...'}
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