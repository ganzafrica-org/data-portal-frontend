"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Shield, Mail, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_REQUESTS } from "@/lib/data"
import { toast } from "sonner"

interface UserDetailsProps {
    userId: string
}

export default function UserDetails({userId}: UserDetailsProps) {
    const { user: currentUser, hasPermission } = useAuth()

    const user = {
        id: '2',
        name: 'Marie Uwimana',
        email: 'marie.uwimana@nla.gov.rw',
        role: 'internal' as const,
        dateJoined: '2023-06-10',
        permissions: {
            canViewAllRequests: true,
            canApproveRequests: false,
            canManageUsers: false,
            canViewAuditTrail: true,
            canExportData: true,
            requiresApproval: true
        }
    }

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: { ...user.permissions }
    })

    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    if (!currentUser || !hasPermission('canManageUsers') && currentUser.id !== userId) {
        return (
            <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">You don&#39;t have permission to view user details.</p>
            </div>
        )
    }

    const userRequests = DUMMY_REQUESTS.filter(req => req.userId === user.id)

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'internal':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'external':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator'
            case 'internal':
                return 'Internal Staff'
            case 'external':
                return 'External User'
            default:
                return role
        }
    }

    const handlePermissionChange = (permission: keyof typeof formData.permissions, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: checked
            }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {

            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success('User updated successfully')
            setIsEditing(false)
        } catch (error: any) {
            toast.error('Failed to update user')
            console.error('Error updating user:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetPassword = async () => {
        try {

            await new Promise(resolve => setTimeout(resolve, 1000))

            toast.success('Password reset email sent to user')
        } catch (error: any) {
            toast.error('Failed to send password reset')
            console.error('Error sending password reset:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="max-w-full space-y-6">
            
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/users">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                    </Badge>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            Edit User
                        </Button>
                    ) : (
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                
                <div className="lg:col-span-2 space-y-2">
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                User account details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="role">User Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value: 'internal' | 'admin' | 'external') =>
                                        setFormData(prev => ({ ...prev, role: value as 'internal' }))
                                    }
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="external">External User</SelectItem>
                                        <SelectItem value="internal">Internal Staff</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Configure what this user can do in the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="canViewAllRequests"
                                        checked={formData.permissions.canViewAllRequests}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange('canViewAllRequests', checked as boolean)
                                        }
                                        disabled={!isEditing}
                                    />
                                    <div>
                                        <Label htmlFor="canViewAllRequests" className="text-sm font-medium">
                                            View All Requests
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Can see requests from all users
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="canApproveRequests"
                                        checked={formData.permissions.canApproveRequests}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange('canApproveRequests', checked as boolean)
                                        }
                                        disabled={!isEditing}
                                    />
                                    <div>
                                        <Label htmlFor="canApproveRequests" className="text-sm font-medium">
                                            Approve Requests
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Can approve or reject data requests
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="canManageUsers"
                                        checked={formData.permissions.canManageUsers}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange('canManageUsers', checked as boolean)
                                        }
                                        disabled={!isEditing}
                                    />
                                    <div>
                                        <Label htmlFor="canManageUsers" className="text-sm font-medium">
                                            Manage Users
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Can create, edit, and delete users
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="canExportData"
                                        checked={formData.permissions.canExportData}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange('canExportData', checked as boolean)
                                        }
                                        disabled={!isEditing}
                                    />
                                    <div>
                                        <Label htmlFor="canExportData" className="text-sm font-medium">
                                            Export Data
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Can download and export datasets
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="canViewAuditTrail"
                                        checked={formData.permissions.canViewAuditTrail}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange('canViewAuditTrail', checked as boolean)
                                        }
                                        disabled={!isEditing}
                                    />
                                    <div>
                                        <Label htmlFor="canViewAuditTrail" className="text-sm font-medium">
                                            View Audit Trail
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Can access system audit logs
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="requiresApproval"
                                        checked={formData.permissions.requiresApproval}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange('requiresApproval', checked as boolean)
                                        }
                                        disabled={!isEditing}
                                    />
                                    <div>
                                        <Label htmlFor="requiresApproval" className="text-sm font-medium">
                                            Requires Approval
                                        </Label>
                                        <p className="text-xs text-gray-500">
                                            Requests need admin approval
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Requests</CardTitle>
                            <CardDescription>
                                Data requests submitted by this user
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {userRequests.length === 0 ? (
                                <div className="text-center py-6">
                                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">No requests found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {userRequests.slice(0, 5).map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-900">{request.title}</h4>
                                                <p className="text-xs text-gray-600">{request.requestNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(request.dateCreated).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(request.status)}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </Badge>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/requests/${request.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {userRequests.length > 5 && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/requests?user=${user.id}`}>
                                                View all {userRequests.length} requests
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                
                <div className="space-y-2">
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>User Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">MEMBER SINCE</Label>
                                <p className="mt-1 text-gray-900 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(user.dateJoined).toLocaleDateString()}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-sm font-medium text-gray-500">TOTAL REQUESTS</Label>
                                <p className="mt-1 text-2xl font-bold text-gray-900">{userRequests.length}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">APPROVED REQUESTS</Label>
                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    {userRequests.filter(r => r.status === 'approved').length}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">PENDING REQUESTS</Label>
                                <p className="mt-1 text-2xl font-bold text-yellow-600">
                                    {userRequests.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleResetPassword}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Password Reset
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href={`/requests?user=${user.id}`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View All Requests
                                </Link>
                            </Button>

                            {user.id !== currentUser.id && (
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this user?')) {
                                            toast.success('User deleted successfully')
                                        }
                                    }}
                                >
                                    Delete User
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}