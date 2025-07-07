"use client"

import { notFound } from 'next/navigation'
import { use } from 'react'
import UserDetails from '@/components/users/user-details'
import { DUMMY_USERS } from '@/lib/data'

interface UserDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
    const resolvedParams = use(params)
    const user = DUMMY_USERS.find(u => u.id === resolvedParams.id)

    if (!user) {
        notFound()
    }

    return <UserDetails userId={resolvedParams.id} />
}