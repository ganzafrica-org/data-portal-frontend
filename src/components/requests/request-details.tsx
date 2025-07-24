"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarDays, Download, Edit, FileText, CheckCircle, XCircle, Clock, User, Building, ArrowLeft, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DataRequest, DUMMY_USERS } from "@/lib/data"
import { toast } from "sonner"

interface RequestDetailsProps {
    request: DataRequest
}

export default function RequestDetails({ request }: RequestDetailsProps) {
    const { user, hasPermission } = useAuth()
    const [adminNotes, setAdminNotes] = useState(request.adminNotes || '')
    const [isProcessing, setIsProcessing] = useState(false)

    if (!user) return null

    const canEdit = (user.id === request.userId && request.status === 'pending') || hasPermission('canApproveRequests')
    const canApprove = hasPermission('canApproveRequests') && request.status === 'pending'
    const isOwner = user.id === request.userId

    const requester = DUMMY_USERS.find(u => u.id === request.userId)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600" />
            default:
                return <FileText className="h-5 w-5" />
        }
    }

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

    const getUserTypeLabel = (userType: string) => {
        const labels = {
            'individual': 'Individual Researcher',
            'academic_institution': 'Academic Institution',
            'research_organization': 'Research Organization',
            'private_company': 'Private Company',
            'ngo': 'NGO/Non-Profit',
            'government_agency': 'Government Agency',
            'international_organization': 'International Organization',
            'employee': 'NLA Employee'
        }
        return labels[userType as keyof typeof labels] || userType
    }

    const getPriorityLevel = () => {

        if (requester?.userType === 'government_agency') return { level: 'High', color: 'bg-red-100 text-red-800' }
        if (requester?.userType === 'academic_institution') return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
        if (requester?.role === 'internal') return { level: 'High', color: 'bg-red-100 text-red-800' }
        return { level: 'Standard', color: 'bg-gray-100 text-gray-800' }
    }

    const priority = getPriorityLevel()

    const handleApprove = async () => {
        setIsProcessing(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('Request approved successfully')
        } catch (error: any) {
            toast.error('Failed to approve request')
            console.error('Error approving request:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!adminNotes.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setIsProcessing(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('Request rejected')
        } catch (error: any) {
            toast.error('Failed to reject request')
            console.error('Error rejecting request:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleUpdateNotes = async () => {
        setIsProcessing(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Notes updated successfully')
        } catch (error: any) {
            toast.error('Failed to update notes')
            console.error('Error updating notes:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/requests">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Requests
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                        <p className="text-gray-600">{request.requestNumber}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    <Badge className={priority.color}>
                        {priority.level} Priority
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">DESCRIPTION</Label>
                                <p className="mt-1 text-gray-900">{request.description}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-500">REQUESTED DATASETS</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {request.requestedDatasets.map((dataset, idx) => (
                                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                                            {dataset}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {request.dateRange && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">DATE RANGE</Label>
                                    <p className="mt-1 text-gray-900 flex items-center">
                                        <CalendarDays className="h-4 w-4 mr-2" />
                                        {new Date(request.dateRange.from).toLocaleDateString()} - {new Date(request.dateRange.to).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium text-gray-500">USER TYPE</Label>
                                <div className="mt-1 flex items-center">
                                    {requester?.userType === 'individual' || requester?.userType === 'employee' ? (
                                        <User className="h-4 w-4 mr-2 text-blue-600" />
                                    ) : (
                                        <Building className="h-4 w-4 mr-2 text-green-600" />
                                    )}
                                    <span className="text-gray-900">{getUserTypeLabel(requester?.userType || 'individual')}</span>
                                </div>
                            </div>

                            {requester?.organizationName && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">ORGANIZATION</Label>
                                    <p className="mt-1 text-gray-900">{requester.organizationName}</p>
                                    {requester.organizationEmail && (
                                        <p className="text-sm text-gray-600">{requester.organizationEmail}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {request.supportingDocuments && request.supportingDocuments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Supporting Documents</CardTitle>
                                <CardDescription>
                                    Documents submitted with this request
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {request.supportingDocuments.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-sm text-gray-500">{doc.size} • {doc.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getDocumentCategoryColor(doc.category)} variant="outline">
                                                    {doc.category}
                                                </Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    
                    {hasPermission('canApproveRequests') && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center text-amber-800">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Access Control Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-amber-700">USER VERIFICATION STATUS</Label>
                                        <div className="flex items-center mt-1">
                                            {requester?.isVerified ? (
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                                            )}
                                            <span className={requester?.isVerified ? 'text-green-700' : 'text-red-700'}>
                                                {requester?.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-amber-700">ACCOUNT CREATED</Label>
                                        <p className="mt-1 text-amber-800">{new Date(requester?.dateJoined || '').toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-amber-700">PERMISSIONS</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge className="bg-amber-100 text-amber-800">
                                            {requester?.permissions.requiresApproval ? 'Requires Approval' : 'Pre-approved'}
                                        </Badge>
                                        {requester?.permissions.canExportData && (
                                            <Badge className="bg-green-100 text-green-800">Can Export Data</Badge>
                                        )}
                                        {requester?.role === 'internal' && (
                                            <Badge className="bg-blue-100 text-blue-800">Internal User</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(request.status !== 'pending' || hasPermission('canApproveRequests')) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {request.status === 'approved' && request.approvedBy && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">APPROVED BY</Label>
                                        <p className="mt-1 text-green-700 font-medium">{request.approvedBy}</p>
                                        {request.dateUpdated && (
                                            <p className="text-sm text-gray-500">
                                                on {new Date(request.dateUpdated).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {request.status === 'rejected' && request.rejectionReason && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">REJECTION REASON</Label>
                                        <p className="mt-1 text-red-700">{request.rejectionReason}</p>
                                        {request.dateUpdated && (
                                            <p className="text-sm text-gray-500">
                                                on {new Date(request.dateUpdated).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {hasPermission('canApproveRequests') && (
                                    <div>
                                        <Label htmlFor="admin-notes" className="text-sm font-medium text-gray-500">
                                            ADMIN NOTES {request.status === 'pending' && '(Required for rejection)'}
                                        </Label>
                                        <Textarea
                                            id="admin-notes"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this request..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                        {adminNotes !== (request.adminNotes || '') && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleUpdateNotes}
                                                disabled={isProcessing}
                                                className="mt-2"
                                            >
                                                Update Notes
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {!hasPermission('canApproveRequests') && request.adminNotes && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">ADMIN NOTES</Label>
                                        <p className="mt-1 text-gray-700">{request.adminNotes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {request.status === 'approved' && isOwner && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-800">Download Data</CardTitle>
                                <CardDescription className="text-green-700">
                                    Your request has been approved. Download your data package below.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-green-100 border border-green-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-green-900">Data Package Ready</p>
                                        <p className="text-sm text-green-700">
                                            Approved on {request.dateUpdated && new Date(request.dateUpdated).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Download link expires in 7 days
                                        </p>
                                    </div>
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Package
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Requester Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                {requester?.userType === 'individual' || requester?.userType === 'employee' ? (
                                    <User className="h-8 w-8 text-blue-600" />
                                ) : (
                                    <Building className="h-8 w-8 text-green-600" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{request.userName}</p>
                                    <p className="text-sm text-gray-600">{getUserTypeLabel(requester?.userType || 'individual')}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-500">EMAIL</Label>
                                <p className="mt-1 text-gray-900">{request.userEmail}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-500">REQUEST DATE</Label>
                                <p className="mt-1 text-gray-900">{new Date(request.dateCreated).toLocaleDateString()}</p>
                            </div>

                            {request.dateUpdated && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">LAST UPDATED</Label>
                                    <p className="mt-1 text-gray-900">{new Date(request.dateUpdated).toLocaleDateString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {canEdit && request.status === 'pending' && (
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/requests/${request.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Request
                                    </Link>
                                </Button>
                            )}

                            {canApprove && (
                                <>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Request
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleReject}
                                        disabled={isProcessing}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Request
                                    </Button>
                                </>
                            )}

                            {request.status === 'approved' && hasPermission('canExportData') && (
                                <Button variant="outline" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Admin Copy
                                </Button>
                            )}

                            {hasPermission('canViewAuditTrail') && (
                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Audit Trail
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Request Created</p>
                                        <p className="text-xs text-gray-500">{new Date(request.dateCreated).toLocaleString()}</p>
                                        <p className="text-xs text-gray-600">Request submitted by {request.userName}</p>
                                    </div>
                                </div>

                                {request.status === 'approved' && (
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Request Approved</p>
                                            <p className="text-xs text-gray-500">{request.dateUpdated && new Date(request.dateUpdated).toLocaleString()}</p>
                                            <p className="text-xs text-gray-600">Approved by {request.approvedBy}</p>
                                        </div>
                                    </div>
                                )}

                                {request.status === 'rejected' && (
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Request Rejected</p>
                                            <p className="text-xs text-gray-500">{request.dateUpdated && new Date(request.dateUpdated).toLocaleString()}</p>
                                            <p className="text-xs text-gray-600">Reason: {request.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                                {request.status === 'pending' && (
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 animate-pulse"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Under Review</p>
                                            <p className="text-xs text-gray-600">Awaiting approval from administrators</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}