"use client"

import { notFound } from 'next/navigation'
import { use } from 'react'
import RequestDetails from '@/components/requests/request-details'
import { DUMMY_REQUESTS } from '@/lib/data'

interface RequestDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
    const resolvedParams = use(params)
    const request = DUMMY_REQUESTS.find(req => req.id === resolvedParams.id)

    if (!request) {
        notFound()
    }

    return <RequestDetails request={request} />
}