"use client"

import { notFound } from 'next/navigation'
import { use } from 'react'
import RequestForm from '@/components/requests/request-form'
import { DUMMY_REQUESTS } from '@/lib/data'
import { useAuth } from '@/contexts/auth-context'

interface EditRequestPageProps {
    params: Promise<{
        id: string
    }>
}

export default function EditRequestPage({ params }: EditRequestPageProps) {
    const { user, hasPermission } = useAuth()

    const resolvedParams = use(params)
    const request = DUMMY_REQUESTS.find(req => req.id === resolvedParams.id)

    if (!request) {
        notFound()
    }

    const canEdit = user && (
        (user.id === request.userId && request.status === 'pending') ||
        hasPermission('canApproveRequests')
    )

    if (!canEdit) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You don&#39;t have permission to edit this request.
                </p>
                <p className="text-sm text-gray-500">
                    You can only edit your own pending requests.
                </p>
            </div>
        )
    }

    return <RequestForm mode="edit" initialData={request} />
}