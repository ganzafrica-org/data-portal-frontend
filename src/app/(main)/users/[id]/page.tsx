"use client"

import { notFound } from 'next/navigation'
import UserDetails from '@/components/users/user-details'
import { DUMMY_USERS } from '@/lib/data'

interface UserDetailPageProps {
    params: {
        id: string
    }
}

export default function UserDetailPage({ params }: UserDetailPageProps) {

    const user = DUMMY_USERS.find(u => u.id === params.id)

    if (!user) {
        notFound()
    }

    return <UserDetails userId={params.id} />
}