"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CalendarDays, ChevronDown, ChevronRight, Download, Edit, Eye, FileText, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_REQUESTS, DataRequest } from "@/lib/data"

interface RequestsTableProps {
    showCreateButton?: boolean
}

export default function RequestsTable({ showCreateButton = true }: RequestsTableProps) {
    const { user, canViewRequest, hasPermission } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    if (!user) return null

    const visibleRequests = DUMMY_REQUESTS.filter(req => canViewRequest(req.userId))

    const filteredRequests = visibleRequests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.userName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter

        return matchesSearch && matchesStatus
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
                </div>
                {showCreateButton && user.role === 'external' && (
                    <Button asChild>
                        <Link href="/requests/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Link>
                    </Button>
                )}
            </div>

            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by title, request number, or requester..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
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
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'Create your first data request to get started.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredRequests.map((request) => (
                                <Collapsible key={request.id}>
                                    <div className="border rounded-lg overflow-hidden">
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
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-gray-900">{request.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {request.requestNumber}
                                                            {hasPermission('canViewAllRequests') && ` • ${request.userName}`}
                                                        </p>
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
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </Badge>
                                                    <div className="flex space-x-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/requests/${request.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {canEditRequest(request) && (
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/requests/${request.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {canDeleteRequest(request) && (
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <div className="px-4 pb-4 border-t bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                    
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-3">Request Details</h5>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500">DESCRIPTION</span>
                                                                <p className="text-sm text-gray-900">{request.description}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500">DATASETS REQUESTED</span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {request.requestedDatasets.map((dataset, idx) => (
                                                                        <Badge key={idx} variant="outline" className="text-xs">
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
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500">APPLICANT TYPE</span>
                                                                <p className="text-sm text-gray-900 capitalize">{request.applicantType}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-3">Additional Information</h5>
                                                        <div className="space-y-3">
                                                            
                                                            {request.supportingDocuments && request.supportingDocuments.length > 0 && (
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">SUPPORTING DOCUMENTS</span>
                                                                    <div className="space-y-2 mt-1">
                                                                        {request.supportingDocuments.map((doc, idx) => (
                                                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                                                        <p className="text-xs text-gray-500">{doc.size} • {doc.type}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <Badge className={getDocumentCategoryColor(doc.category)} variant="outline">
                                                                                        {doc.category}
                                                                                    </Badge>
                                                                                    <Button variant="ghost" size="sm">
                                                                                        <Download className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
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
                                                                    {request.dateUpdated && (
                                                                        <p className="text-xs text-gray-500">
                                                                            on {new Date(request.dateUpdated).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {request.adminNotes && (
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">ADMIN NOTES</span>
                                                                    <p className="text-sm text-gray-700">{request.adminNotes}</p>
                                                                </div>
                                                            )}

                                                            
                                                            {request.status === 'approved' && (
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">DOWNLOAD</span>
                                                                    <div className="mt-2">
                                                                        <Button size="sm" className="w-full">
                                                                            <Download className="h-4 w-4 mr-2" />
                                                                            Download Data Package
                                                                        </Button>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Link expires in 7 days
                                                                        </p>
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
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}