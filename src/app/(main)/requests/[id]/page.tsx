"use client"

import { notFound } from 'next/navigation'
import RequestDetails from '@/components/requests/request-details'
import { DUMMY_REQUESTS } from '@/lib/data'

interface RequestDetailPageProps {
    params: {
        id: string
    }
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {

    const request = DUMMY_REQUESTS.find(req => req.id === params.id)

    if (!request) {
        notFound()
    }

    return <RequestDetails request={request} />
}