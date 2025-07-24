"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    XCircle,
    Save,
    Eye,
    EyeOff
} from 'lucide-react'
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface DatasetConfig {
    id: string
    name: string
    description: string
    category: string
    isActive: boolean
    requiresApproval: boolean
    approverRoles: string[]
    allowedUserTypes: string[]
    accessLevel: 'public' | 'restricted' | 'internal'
    hasAdminLevel: boolean
    hasTransactionType: boolean
    hasLandUse: boolean
    hasSizeRange: boolean
    hasUserLevel: boolean
    requiresPeriod: boolean
    requiresUpiList: boolean
    requiresIdList: boolean
    requiresUpi: boolean
    fields: string[]
    createdAt: string
    updatedAt: string
}

const INITIAL_DATASETS: DatasetConfig[] = [
    {
        id: '1',
        name: 'Parcel Boundaries Shapefile',
        description: 'Geographic boundaries and attributes of land parcels',
        category: 'shapefiles',
        isActive: true,
        requiresApproval: true,
        approverRoles: ['admin', 'internal'],
        allowedUserTypes: ['individual', 'academic_institution', 'research_organization'],
        accessLevel: 'restricted',
        hasAdminLevel: true,
        hasTransactionType: false,
        hasLandUse: false,
        hasSizeRange: false,
        hasUserLevel: false,
        requiresPeriod: false,
        requiresUpiList: false,
        requiresIdList: false,
        requiresUpi: true,
        fields: ['UPI', 'province', 'district', 'sector', 'cell', 'x', 'y', 'shape', 'latitude', 'longitude'],
        createdAt: '2024-01-15',
        updatedAt: '2024-11-20'
    },
    {
        id: '2',
        name: 'Transactions Pending for Approval',
        description: 'Track transactions awaiting administrative approval',
        category: 'transaction-reports',
        isActive: true,
        requiresApproval: false,
        approverRoles: ['admin'],
        allowedUserTypes: ['employee'],
        accessLevel: 'internal',
        hasAdminLevel: true,
        hasTransactionType: true,
        hasLandUse: false,
        hasSizeRange: false,
        hasUserLevel: false,
        requiresPeriod: true,
        requiresUpiList: false,
        requiresIdList: false,
        requiresUpi: false,
        fields: ['transaction_id', 'upi', 'type', 'status', 'date_submitted', 'applicant'],
        createdAt: '2024-01-10',
        updatedAt: '2024-11-15'
    },
    {
        id: '3',
        name: 'Ownership Details from UPI List',
        description: 'Detailed ownership information for specific parcels',
        category: 'parcel-reports',
        isActive: true,
        requiresApproval: true,
        approverRoles: ['admin', 'internal'],
        allowedUserTypes: ['academic_institution', 'government_agency', 'research_organization'],
        accessLevel: 'restricted',
        hasAdminLevel: false,
        hasTransactionType: false,
        hasLandUse: false,
        hasSizeRange: false,
        hasUserLevel: false,
        requiresPeriod: false,
        requiresUpiList: true,
        requiresIdList: false,
        requiresUpi: false,
        fields: ['UPI', 'administrative_level', 'size', 'land_use', 'ownership', 'ID', 'planned_land_use'],
        createdAt: '2024-02-01',
        updatedAt: '2024-11-18'
    }
]

const USER_TYPES = [
    { value: 'individual', label: 'Individual Researcher' },
    { value: 'academic_institution', label: 'Academic Institution' },
    { value: 'research_organization', label: 'Research Organization' },
    { value: 'private_company', label: 'Private Company' },
    { value: 'ngo', label: 'NGO/Non-Profit' },
    { value: 'government_agency', label: 'Government Agency' },
    { value: 'international_organization', label: 'International Organization' },
    { value: 'employee', label: 'NLA Employee' }
]

const CATEGORIES = [
    { value: 'transaction-reports', label: 'Transaction Reports', icon: '📊' },
    { value: 'user-reports', label: 'User Activity Reports', icon: '👥' },
    { value: 'parcel-reports', label: 'Parcel Analysis Reports', icon: '🗺️' },
    { value: 'shapefiles', label: 'Spatial Data (Shapefiles)', icon: '🌍' }
]

const APPROVER_ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'internal', label: 'Internal Staff' }
]

export default function DatasetConfigurationPage() {
    const { user, hasPermission } = useAuth()
    const [datasets, setDatasets] = useState<DatasetConfig[]>(INITIAL_DATASETS)
    const [selectedDataset, setSelectedDataset] = useState<DatasetConfig | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<DatasetConfig>>({})

    if (!user || !hasPermission('canConfigureDatasets')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                    <p className="text-gray-600">You don&#39;t have permission to configure datasets.</p>
                </div>
            </div>
        )
    }

    const handleAddDataset = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            isActive: true,
            requiresApproval: false,
            approverRoles: [],
            allowedUserTypes: [],
            accessLevel: 'public',
            hasAdminLevel: false,
            hasTransactionType: false,
            hasLandUse: false,
            hasSizeRange: false,
            hasUserLevel: false,
            requiresPeriod: false,
            requiresUpiList: false,
            requiresIdList: false,
            requiresUpi: false,
            fields: []
        })
        setIsEditing(false)
        setIsDialogOpen(true)
    }

    const handleEditDataset = (dataset: DatasetConfig) => {
        setFormData(dataset)
        setSelectedDataset(dataset)
        setIsEditing(true)
        setIsDialogOpen(true)
    }

    const handleSaveDataset = () => {
        if (!formData.name || !formData.description || !formData.category) {
            toast.error('Please fill in all required fields')
            return
        }

        const newDataset: DatasetConfig = {
            id: isEditing ? selectedDataset!.id : Date.now().toString(),
            name: formData.name!,
            description: formData.description!,
            category: formData.category!,
            isActive: formData.isActive ?? true,
            requiresApproval: formData.requiresApproval ?? false,
            approverRoles: formData.approverRoles ?? [],
            allowedUserTypes: formData.allowedUserTypes ?? [],
            accessLevel: formData.accessLevel ?? 'public',
            hasAdminLevel: formData.hasAdminLevel ?? false,
            hasTransactionType: formData.hasTransactionType ?? false,
            hasLandUse: formData.hasLandUse ?? false,
            hasSizeRange: formData.hasSizeRange ?? false,
            hasUserLevel: formData.hasUserLevel ?? false,
            requiresPeriod: formData.requiresPeriod ?? false,
            requiresUpiList: formData.requiresUpiList ?? false,
            requiresIdList: formData.requiresIdList ?? false,
            requiresUpi: formData.requiresUpi ?? false,
            fields: formData.fields ?? [],
            createdAt: isEditing ? selectedDataset!.createdAt : new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        }

        if (isEditing) {
            setDatasets(datasets.map(d => d.id === selectedDataset!.id ? newDataset : d))
            toast.success('Dataset updated successfully')
        } else {
            setDatasets([...datasets, newDataset])
            toast.success('Dataset created successfully')
        }

        setIsDialogOpen(false)
        setFormData({})
        setSelectedDataset(null)
    }

    const handleDeleteDataset = (id: string) => {
        setDatasets(datasets.filter(d => d.id !== id))
        toast.success('Dataset deleted successfully')
    }

    const toggleDatasetStatus = (id: string) => {
        setDatasets(datasets.map(d =>
            d.id === id ? { ...d, isActive: !d.isActive, updatedAt: new Date().toISOString().split('T')[0] } : d
        ))
        toast.success('Dataset status updated')
    }

    const getAccessLevelColor = (level: string) => {
        switch (level) {
            case 'public': return 'bg-green-100 text-green-800'
            case 'restricted': return 'bg-yellow-100 text-yellow-800'
            case 'internal': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getCategoryInfo = (categoryId: string) => {
        return CATEGORIES.find(c => c.value === categoryId) || { label: categoryId, icon: '📁' }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dataset Configuration</h1>
                    <p className="text-gray-600">Manage datasets, access controls, and approval workflows</p>
                </div>
                <Button onClick={handleAddDataset} className="bg-green hover:bg-green/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dataset
                </Button>
            </div>

            <Tabs defaultValue="datasets" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="datasets">Datasets</TabsTrigger>
                    <TabsTrigger value="access-control">Access Control</TabsTrigger>
                    <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="datasets" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {datasets.map((dataset) => (
                            <Card key={dataset.id} className="relative">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getCategoryInfo(dataset.category).icon}</span>
                                            <div>
                                                <CardTitle className="text-lg">{dataset.name}</CardTitle>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge className={getAccessLevelColor(dataset.accessLevel)}>
                                                        {dataset.accessLevel}
                                                    </Badge>
                                                    {dataset.isActive ? (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-800">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDatasetStatus(dataset.id)}
                                            >
                                                {dataset.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditDataset(dataset)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteDataset(dataset.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 line-clamp-2">{dataset.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Requires Approval:</span>
                                            <span className={dataset.requiresApproval ? 'text-orange-600' : 'text-green-600'}>
                                                {dataset.requiresApproval ? 'Yes' : 'No'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">User Types:</span>
                                            <span className="text-gray-700">{dataset.allowedUserTypes.length} types</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Fields:</span>
                                            <span className="text-gray-700">{dataset.fields.length} fields</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {dataset.hasAdminLevel && <Badge variant="outline" className="text-xs">Admin Level</Badge>}
                                        {dataset.requiresPeriod && <Badge variant="outline" className="text-xs">Period</Badge>}
                                        {dataset.requiresUpi && <Badge variant="outline" className="text-xs">UPI</Badge>}
                                        {dataset.requiresUpiList && <Badge variant="outline" className="text-xs">UPI List</Badge>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="access-control" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Control Summary</CardTitle>
                            <CardDescription>Overview of user type access permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 font-medium">User Type</th>
                                        <th className="text-left p-2 font-medium">Accessible Datasets</th>
                                        <th className="text-left p-2 font-medium">Requires Approval</th>
                                        <th className="text-left p-2 font-medium">Access Level</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {USER_TYPES.map((userType) => {
                                        const accessibleDatasets = datasets.filter(d =>
                                            d.isActive && d.allowedUserTypes.includes(userType.value)
                                        )
                                        const approvalRequired = accessibleDatasets.filter(d => d.requiresApproval).length

                                        return (
                                            <tr key={userType.value} className="border-b hover:bg-gray-50">
                                                <td className="p-2">
                                                    <div className="font-medium">{userType.label}</div>
                                                </td>
                                                <td className="p-2">
                                                    <Badge variant="outline">{accessibleDatasets.length} datasets</Badge>
                                                </td>
                                                <td className="p-2">
                                                    <Badge className={approvalRequired > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                                                        {approvalRequired}/{accessibleDatasets.length}
                                                    </Badge>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex gap-1">
                                                        {Array.from(new Set(accessibleDatasets.map(d => d.accessLevel))).map(level => (
                                                            <Badge key={level} className={getAccessLevelColor(level)}>
                                                                {level}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Total Datasets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{datasets.length}</div>
                                <p className="text-xs text-gray-600">
                                    {datasets.filter(d => d.isActive).length} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-yellow text-green">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Approval Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{datasets.filter(d => d.requiresApproval).length}</div>
                                <p className="text-xs text-gray-600">
                                    out of {datasets.length} datasets
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Access Levels</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Public:</span>
                                        <span>{datasets.filter(d => d.accessLevel === 'public').length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Restricted:</span>
                                        <span>{datasets.filter(d => d.accessLevel === 'restricted').length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Internal:</span>
                                        <span>{datasets.filter(d => d.accessLevel === 'internal').length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Dataset' : 'Add New Dataset'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update dataset configuration and access controls' : 'Create a new dataset with access controls and requirements'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dataset Name *</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter dataset name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={formData.category || ''}
                                    onValueChange={(value) => setFormData({...formData, category: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                <div className="flex items-center">
                                                    <span className="mr-2">{category.icon}</span>
                                                    {category.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe what this dataset contains and its purpose"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Access Level</Label>
                                <Select
                                    value={formData.accessLevel || 'public'}
                                    onValueChange={(value: 'public' | 'restricted' | 'internal') => setFormData({...formData, accessLevel: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="restricted">Restricted</SelectItem>
                                        <SelectItem value="internal">Internal Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        checked={formData.isActive ?? true}
                                        onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                                    />
                                    <span className="text-sm">{formData.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Allowed User Types</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                                {USER_TYPES.map((userType) => (
                                    <div key={userType.value} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`user-${userType.value}`}
                                            checked={formData.allowedUserTypes?.includes(userType.value) || false}
                                            onChange={(e) => {
                                                const current = formData.allowedUserTypes || []
                                                if (e.target.checked) {
                                                    setFormData({...formData, allowedUserTypes: [...current, userType.value]})
                                                } else {
                                                    setFormData({...formData, allowedUserTypes: current.filter(t => t !== userType.value)})
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <label htmlFor={`user-${userType.value}`} className="text-sm">{userType.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.requiresApproval || false}
                                    onCheckedChange={(checked) => setFormData({...formData, requiresApproval: checked})}
                                />
                                <Label>Requires Approval</Label>
                            </div>
                            {formData.requiresApproval && (
                                <div className="ml-6 space-y-2">
                                    <Label>Approver Roles</Label>
                                    <div className="flex gap-2">
                                        {APPROVER_ROLES.map((role) => (
                                            <div key={role.value} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`approver-${role.value}`}
                                                    checked={formData.approverRoles?.includes(role.value) || false}
                                                    onChange={(e) => {
                                                        const current = formData.approverRoles || []
                                                        if (e.target.checked) {
                                                            setFormData({...formData, approverRoles: [...current, role.value]})
                                                        } else {
                                                            setFormData({...formData, approverRoles: current.filter(r => r !== role.value)})
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`approver-${role.value}`} className="text-sm">{role.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label>Dataset Requirements</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'hasAdminLevel', label: 'Administrative Level' },
                                    { key: 'hasTransactionType', label: 'Transaction Type' },
                                    { key: 'hasLandUse', label: 'Land Use Type' },
                                    { key: 'hasSizeRange', label: 'Size Range' },
                                    { key: 'hasUserLevel', label: 'User Level' },
                                    { key: 'requiresPeriod', label: 'Time Period' },
                                    { key: 'requiresUpi', label: 'Single UPI' },
                                    { key: 'requiresUpiList', label: 'UPI List' },
                                    { key: 'requiresIdList', label: 'ID List' }
                                ].map((requirement) => (
                                    <div key={requirement.key} className="flex items-center space-x-2">
                                        <Switch
                                            checked={formData[requirement.key as keyof DatasetConfig] as boolean || false}
                                            onCheckedChange={(checked) => setFormData({...formData, [requirement.key]: checked})}
                                        />
                                        <span className="text-sm">{requirement.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Dataset Fields (comma-separated)</Label>
                            <Textarea
                                value={formData.fields?.join(', ') || ''}
                                onChange={(e) => setFormData({...formData, fields: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
                                placeholder="UPI, province, district, sector, cell, size, land_use..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveDataset} className="bg-green hover:bg-green/90">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update' : 'Create'} Dataset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}