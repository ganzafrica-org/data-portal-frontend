"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Download,
    Edit,
    Eye,
    FileText,
    Trash2,
    Plus,
    User,
    Building,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_REQUESTS, DUMMY_USERS, DataRequest } from "@/lib/data"
import { toast } from "sonner"

interface RequestsTableProps {
    showCreateButton?: boolean
}

export default function RequestsTable({ showCreateButton = true }: RequestsTableProps) {
    const { user, canViewRequest, hasPermission } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [userTypeFilter, setUserTypeFilter] = useState<string>('all')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    if (!user) return null

    const visibleRequests = DUMMY_REQUESTS.filter(req => canViewRequest(req.userId))

    const getUserInfo = (userId: string) => {
        return DUMMY_USERS.find(u => u.id === userId)
    }

    const getPriorityLevel = (request: DataRequest) => {
        const requester = getUserInfo(request.userId)
        if (requester?.userType === 'government_agency') return { level: 'High', color: 'bg-red-100 text-red-800' }
        if (requester?.userType === 'academic_institution') return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
        if (requester?.role === 'internal') return { level: 'High', color: 'bg-red-100 text-red-800' }
        return { level: 'Standard', color: 'bg-gray-100 text-gray-800' }
    }

    const getUserTypeLabel = (userType: string) => {
        const labels = {
            'individual': 'Individual',
            'academic_institution': 'Academic',
            'research_organization': 'Research Org',
            'private_company': 'Private Company',
            'ngo': 'NGO',
            'government_agency': 'Government',
            'international_organization': 'International',
            'employee': 'Employee'
        }
        return labels[userType as keyof typeof labels] || userType
    }

    const filteredRequests = visibleRequests.filter(request => {
        const requester = getUserInfo(request.userId)

        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.userName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter

        const matchesUserType = userTypeFilter === 'all' || requester?.userType === userTypeFilter

        const priority = getPriorityLevel(request)
        const matchesPriority = priorityFilter === 'all' || priority.level.toLowerCase() === priorityFilter

        return matchesSearch && matchesStatus && matchesUserType && matchesPriority
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-3 w-3" />
            case 'approved':
                return <CheckCircle className="h-3 w-3" />
            case 'rejected':
                return <XCircle className="h-3 w-3" />
            default:
                return <FileText className="h-3 w-3" />
        }
    }

    const toggleRowExpansion = (requestId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(requestId)) {
            newExpanded.delete(requestId)
        } else {
            newExpanded.add(requestId)
        }
        setExpandedRows(newExpanded)
    }

    const canEditRequest = (request: DataRequest) => {
        return (user.id === request.userId && request.status === 'pending') ||
            hasPermission('canApproveRequests')
    }

    const canDeleteRequest = (request: DataRequest) => {
        return (user.id === request.userId && request.status === 'pending') ||
            hasPermission('canManageUsers')
    }

    const getDocumentCategoryColor = (category: string) => {
        switch (category) {
            case 'verification':
                return 'bg-blue-100 text-blue-800'
            case 'research':
                return 'bg-purple-100 text-purple-800'
            case 'authorization':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const handleDeleteRequest = async () => {
        try {

            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Request deleted successfully')
        } catch (error: any) {
            console.error(error)
            toast.error('Failed to delete request')
        }
    }

    const getQuickActions = (request: DataRequest) => {
        const actions = []

        if (hasPermission('canApproveRequests') && request.status === 'pending') {
            actions.push(
                <Button
                    key="approve"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 1000))
                            toast.success('Request approved successfully')
                        } catch (error: any) {
                            console.error(error)
                            toast.error('Failed to approve request')
                        }
                    }}
                >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                </Button>
            )
        }

        if (request.status === 'approved') {
            actions.push(
                <Button
                    key="download"
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                </Button>
            )
        }

        return actions
    }

    const userTypes = Array.from(new Set(
        visibleRequests.map(req => getUserInfo(req.userId)?.userType).filter(Boolean)
    ))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
                    <p className="text-gray-600">
                        {hasPermission('canViewAllRequests')
                            ? 'Manage and review all data requests'
                            : 'Track and manage your data requests'
                        }
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                        <Badge className="bg-blue-100 text-blue-800">
                            Total: {filteredRequests.length}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                            Pending: {filteredRequests.filter(r => r.status === 'pending').length}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                            Approved: {filteredRequests.filter(r => r.status === 'approved').length}
                        </Badge>
                    </div>
                </div>
                {showCreateButton && (user.role === 'internal' || user.role === 'external') && (
                    <Button asChild className="bg-green hover:bg-green/90">
                        <Link href="/requests/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Link>
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <Input
                                placeholder="Search by title, request number, or requester..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="User Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {userTypes.map(type => (
                                        <SelectItem key={type} value={type!}>
                                            {getUserTypeLabel(type!)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Requests ({filteredRequests.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all' || userTypeFilter !== 'all' || priorityFilter !== 'all'
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'Create your first data request to get started.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredRequests.map((request) => {
                                const requester = getUserInfo(request.userId)
                                const priority = getPriorityLevel(request)
                                const quickActions = getQuickActions(request)

                                return (
                                    <Collapsible key={request.id}>
                                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                            <CollapsibleTrigger
                                                onClick={() => toggleRowExpansion(request.id)}
                                                className="w-full p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            {expandedRows.has(request.id) ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            {requester?.userType === 'individual' || requester?.userType === 'employee' ? (
                                                                <User className="h-5 w-5 text-blue-600" />
                                                            ) : (
                                                                <Building className="h-5 w-5 text-green-600" />
                                                            )}
                                                            <div className="text-left">
                                                                <h4 className="font-medium text-gray-900">{request.title}</h4>
                                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                    <span>{request.requestNumber}</span>
                                                                    {hasPermission('canViewAllRequests') && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>{request.userName}</span>
                                                                            <span>•</span>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {getUserTypeLabel(requester?.userType || 'individual')}
                                                                            </Badge>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-900">
                                                                {new Date(request.dateCreated).toLocaleDateString()}
                                                            </p>
                                                            {request.dateUpdated && (
                                                                <p className="text-xs text-gray-500">
                                                                    Updated {new Date(request.dateUpdated).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end space-y-1">
                                                            <Badge className={getStatusColor(request.status)}>
                                                                {getStatusIcon(request.status)}
                                                                <span className="ml-1">
                                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                                </span>
                                                            </Badge>
                                                            <Badge className={priority.color} variant="outline">
                                                                {priority.level}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex space-x-1">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/requests/${request.id}`}>
                                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                                </Link>
                                                            </Button>
                                                            {canEditRequest(request) && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={`/requests/${request.id}/edit`}>
                                                                        <Edit className="h-4 w-4 text-yellow-600" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            {canDeleteRequest(request) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteRequest()
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <div className="px-4 pb-4 border-t bg-gray-50">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                                                        
                                                        <div>
                                                            <h5 className="font-medium text-gray-900 mb-3">Request Details</h5>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">DESCRIPTION</span>
                                                                    <p className="text-sm text-gray-900">{request.description}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">DATASETS REQUESTED</span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {request.requestedDatasets.map((dataset, idx) => (
                                                                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                                                                                {dataset}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {request.dateRange && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">DATE RANGE</span>
                                                                        <p className="text-sm text-gray-900 flex items-center">
                                                                            <CalendarDays className="h-3 w-3 mr-1" />
                                                                            {new Date(request.dateRange.from).toLocaleDateString()} - {new Date(request.dateRange.to).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        
                                                        <div>
                                                            <h5 className="font-medium text-gray-900 mb-3">Requester Information</h5>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                                                                    {requester?.userType === 'individual' || requester?.userType === 'employee' ? (
                                                                        <User className="h-6 w-6 text-blue-600" />
                                                                    ) : (
                                                                        <Building className="h-6 w-6 text-green-600" />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{request.userName}</p>
                                                                        <p className="text-sm text-gray-600">{getUserTypeLabel(requester?.userType || 'individual')}</p>
                                                                    </div>
                                                                </div>

                                                                {requester?.organizationName && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">ORGANIZATION</span>
                                                                        <p className="text-sm text-gray-900">{requester.organizationName}</p>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center space-x-2">

                                                                    {requester?.isVerified ? (
                                                                        <Badge className="bg-green-100 text-green-800">
                                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                                            Verified
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-red-100 text-red-800">
                                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                                            Unverified
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        
                                                        <div>
                                                            <h5 className="font-medium text-gray-900 mb-3">Actions & Status</h5>
                                                            <div className="space-y-3">
                                                                
                                                                {quickActions.length > 0 && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">QUICK ACTIONS</span>
                                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                                            {quickActions}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                
                                                                {request.status === 'approved' && request.approvedBy && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">APPROVED BY</span>
                                                                        <p className="text-sm text-green-700 font-medium">{request.approvedBy}</p>
                                                                        {request.dateUpdated && (
                                                                            <p className="text-xs text-gray-500">
                                                                                on {new Date(request.dateUpdated).toLocaleDateString()}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {request.status === 'rejected' && request.rejectionReason && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">REJECTION REASON</span>
                                                                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                                                                    </div>
                                                                )}

                                                                {request.adminNotes && hasPermission('canApproveRequests') && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">ADMIN NOTES</span>
                                                                        <p className="text-sm text-gray-700">{request.adminNotes}</p>
                                                                    </div>
                                                                )}

                                                                
                                                                {request.supportingDocuments && request.supportingDocuments.length > 0 && (
                                                                    <div>
                                                                        <span className="text-xs font-medium text-gray-500">
                                                                            DOCUMENTS ({request.supportingDocuments.length})
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {request.supportingDocuments.slice(0, 3).map((doc, idx) => (
                                                                                <Badge key={idx} className={getDocumentCategoryColor(doc.category)} variant="outline">
                                                                                    {doc.category}
                                                                                </Badge>
                                                                            ))}
                                                                            {request.supportingDocuments.length > 3 && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    +{request.supportingDocuments.length - 3} more
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}