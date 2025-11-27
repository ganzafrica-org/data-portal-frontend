"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Calendar,
  Paperclip,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { Request } from "@/lib/api-config"

interface RequestsListProps {
  requests: Request[]
  showUserInfo?: boolean
}

export function RequestsList({ requests, showUserInfo = false }: RequestsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'in_review':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'resubmitted':
        return <FileText className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'resubmitted':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (requests.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">Try adjusting your filters or create a new request.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Request Info */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(request.status)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/requests/${request.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-green transition-colors"
                      >
                        {request.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.requestNumber}
                      </p>
                    </div>
                  </div>

                  {request.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {request.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {showUserInfo && request.user && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{request.user.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                {request.datasets.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{request.datasets.length} dataset{request.datasets.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {request.documents.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-4 w-4" />
                    <span>{request.documents.length} document{request.documents.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {request._count.comments > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{request._count.comments} comment{request._count.comments !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Status & Actions */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(request.priority)} variant="outline">
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </Badge>
              </div>
              <Button size="sm" asChild>
                <Link href={`/requests/${request.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function RequestsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
