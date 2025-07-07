"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, UserPlus, Mail, Trash2, Edit, Shield, Download, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_USERS } from "@/lib/data"
import { toast } from "sonner"

export default function UsersTable() {
    const { user: currentUser, hasPermission } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [inviteEmails, setInviteEmails] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    if (!currentUser || !hasPermission('canManageUsers')) {
        return (
            <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">You don&#39;t have permission to manage users.</p>
            </div>
        )
    }

    const filteredUsers = DUMMY_USERS.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = roleFilter === 'all' || user.role === roleFilter

        return matchesSearch && matchesRole
    })

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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleBulkImport = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to import')
            return
        }

        setIsProcessing(true)
        try {

            await new Promise(resolve => setTimeout(resolve, 2000))


            toast.success('Bulk import completed successfully')
            setIsImportDialogOpen(false)
            setSelectedFile(null)
        } catch (error: any) {
            toast.error('Failed to import users')
            console.error('Import error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSendInvites = async () => {
        const emails = inviteEmails.split('\n').filter(email => email.trim())

        if (emails.length === 0) {
            toast.error('Please enter at least one email address')
            return
        }

        setIsProcessing(true)
        try {

            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success(`Invitations sent to ${emails.length} users`)
            setIsInviteDialogOpen(false)
            setInviteEmails('')
        } catch (error: any) {
            toast.error('Failed to send invitations')
            console.error('Invite error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser.id) {
            toast.error("You cannot delete your own account")
            return
        }

        setIsProcessing(true)
        try {

            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('User deleted successfully')
        } catch (error: any) {
            toast.error('Failed to delete user')
            console.error('Delete error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const downloadTemplate = () => {

        const csvContent = "Name,Email,Role\nJohn Doe,john.doe@nla.gov.rw,internal\nJane Smith,jane.smith@nla.gov.rw,internal"
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'user_import_template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage system users and their permissions</p>
                </div>
                <div className="flex gap-2">
                    
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Mail className="h-4 w-4 mr-2" />
                                Invite Users
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Internal Users</DialogTitle>
                                <DialogDescription>
                                    Enter email addresses to send invitations to internal staff members.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="invite-emails">Email Addresses (one per line)</Label>
                                    <textarea
                                        id="invite-emails"
                                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="john.doe@nla.gov.rw&#10;jane.smith@nla.gov.rw"
                                        value={inviteEmails}
                                        onChange={(e) => setInviteEmails(e.target.value)}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Users will receive an email with a temporary password
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSendInvites} disabled={isProcessing}>
                                        {isProcessing ? 'Sending...' : 'Send Invitations'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="h-4 w-4 mr-2" />
                                Bulk Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bulk Import Users</DialogTitle>
                                <DialogDescription>
                                    Import multiple internal users from a CSV or Excel file.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Upload File</Label>
                                    <div className="mt-1">
                                        <Input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Accepted formats: CSV, Excel (.xlsx, .xls)
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">File Format Requirements</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Columns: Name, Email, Role</li>
                                        <li>• Role must be: internal, admin</li>
                                        <li>• Email must be valid</li>
                                        <li>• First row should contain headers</li>
                                    </ul>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={downloadTemplate}
                                    >
                                        <Download className="h-3 w-3 mr-2" />
                                        Download Template
                                    </Button>
                                </div>

                                {selectedFile && (
                                    <div className="bg-gray-50 border rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleBulkImport} disabled={!selectedFile || isProcessing}>
                                        {isProcessing ? 'Importing...' : 'Import Users'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="internal">Internal Staff</SelectItem>
                                    <SelectItem value="external">External User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-600">
                                {searchTerm || roleFilter !== 'all'
                                    ? 'Try adjusting your filters.'
                                    : 'Start by inviting your first users.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Date Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getRoleColor(user.role)}>
                                                    {getRoleLabel(user.role)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.permissions.canViewAllRequests && (
                                                            <Badge variant="outline" className="text-xs">View All</Badge>
                                                        )}
                                                        {user.permissions.canApproveRequests && (
                                                            <Badge variant="outline" className="text-xs">Approve</Badge>
                                                        )}
                                                        {user.permissions.canManageUsers && (
                                                            <Badge variant="outline" className="text-xs">Manage Users</Badge>
                                                        )}
                                                        {user.permissions.canExportData && (
                                                            <Badge variant="outline" className="text-xs">Export Data</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                        <span className="text-sm text-gray-900">
                          {new Date(user.dateJoined).toLocaleDateString()}
                        </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-1">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={`/users/${user.id}`}>
                                                            <Edit className="h-4 w-4 text-blue" />
                                                        </a>
                                                    </Button>
                                                    {user.id !== currentUser.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={isProcessing}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <UserPlus className="h-4 w-4 text-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue">{DUMMY_USERS.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered in the system
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-green-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Internal Staff</CardTitle>
                        <Shield className="h-4 w-4 text-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green">
                            {DUMMY_USERS.filter(u => u.role === 'internal' || u.role === 'admin').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            NLA employees
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-yellow-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">External Users</CardTitle>
                        <UserPlus className="h-4 w-4 text-yellow" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow">
                            {DUMMY_USERS.filter(u => u.role === 'external').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Researchers & partners
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}