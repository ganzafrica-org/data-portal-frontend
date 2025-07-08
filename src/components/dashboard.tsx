"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, XCircle, Plus, ArrowRight, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_REQUESTS, DUMMY_USERS } from "@/lib/data"

export default function Dashboard() {
    const { user, hasPermission, canViewRequest } = useAuth()

    if (!user) return null

    const visibleRequests = DUMMY_REQUESTS.filter(req => canViewRequest(req.userId))

    const getStats = () => {
        if (hasPermission('canViewAllRequests')) {
            return {
                totalRequests: DUMMY_REQUESTS.length,
                pendingRequests: DUMMY_REQUESTS.filter(r => r.status === 'pending').length,
                approvedRequests: DUMMY_REQUESTS.filter(r => r.status === 'approved').length,
                rejectedRequests: DUMMY_REQUESTS.filter(r => r.status === 'rejected').length,
                totalUsers: DUMMY_USERS.length,
                externalUsers: DUMMY_USERS.filter(u => u.role === 'external').length,
                showSystemStats: true
            }
        } else {
            const userRequests = visibleRequests.filter(req => req.userId === user.id)
            return {
                totalRequests: userRequests.length,
                pendingRequests: userRequests.filter(r => r.status === 'pending').length,
                approvedRequests: userRequests.filter(r => r.status === 'approved').length,
                rejectedRequests: userRequests.filter(r => r.status === 'rejected').length,
                showSystemStats: false
            }
        }
    }

    const stats = getStats()

    const getRecentRequests = () => {
        if (hasPermission('canApproveRequests')) {
            return DUMMY_REQUESTS
                .filter(r => r.status === 'pending')
                .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
                .slice(0, 5)
        } else {
            return visibleRequests
                .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
                .slice(0, 5)
        }
    }

    const recentRequests = getRecentRequests()

    const getWelcomeMessage = () => {
        switch (user.role) {
            case 'admin':
                return {
                    title: 'Admin Dashboard',
                    subtitle: 'Manage data requests, users, and system oversight.'
                }
            case 'internal':
                return {
                    title: `Welcome back, ${user.name}!`,
                    subtitle: hasPermission('canApproveRequests')
                        ? 'Review and manage data requests.'
                        : 'Access internal data and submit requests.'
                }
            case 'external':
                return {
                    title: `Welcome back, ${user.name}!`,
                    subtitle: 'Manage your data requests and track their progress here.'
                }
            default:
                return {
                    title: 'Dashboard',
                    subtitle: 'Welcome to the NLA Data Portal.'
                }
        }
    }

    const welcomeMessage = getWelcomeMessage()

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow" />
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green" />
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const renderStatsCards = () => {
        const baseCards = [
            {
                title: "Total Requests",
                value: stats.totalRequests,
                icon: <FileText className="h-6 w-6 text-white" />,
                description: stats.showSystemStats ? "All data requests" : "Your requests",
                bgColor: "bg-blue",
                iconBg: "bg-blue/80"
            },
            {
                title: stats.showSystemStats ? "Pending Approval" : "Pending",
                value: stats.pendingRequests,
                icon: hasPermission('canApproveRequests')
                    ? <AlertCircle className="h-6 w-6 text-green" />
                    : <Clock className="h-6 w-6 text-green" />,
                description: stats.showSystemStats ? "Need attention" : "Awaiting approval",
                bgColor: "bg-yellow",
                iconBg: "bg-yellow/80"
            },
            {
                title: "Approved",
                value: stats.approvedRequests,
                icon: <CheckCircle className="h-6 w-6 text-white" />,
                description: stats.showSystemStats ? "Processed requests" : "Ready for download",
                bgColor: "bg-green",
                iconBg: "bg-green/80"
            },
            {
                title: "Rejected",
                value: stats.rejectedRequests,
                icon: <XCircle className="h-6 w-6 text-white" />,
                description: stats.showSystemStats ? "Declined requests" : "Need attention",
                bgColor: "bg-red-500",
                iconBg: "bg-red-600"
            }
        ]

        if (stats.showSystemStats && hasPermission('canManageUsers')) {
            baseCards[3] = {
                title: "Total Users",
                value: stats.totalUsers!,
                icon: <Users className="h-6 w-6 text-white" />,
                description: `${stats.externalUsers} external, ${stats.totalUsers! - stats.externalUsers!} internal`,
                bgColor: "bg-blue",
                iconBg: "bg-blue/80"
            }
        }

        return baseCards.map((card, index) => (
            <Card key={index} className={`${card.bgColor} p-4 text-white relative overflow-hidden`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    {card.icon}
                </CardHeader>
                <CardContent>
                    <p className={`text-2xl font-bold ${card.bgColor === 'bg-yellow' ? 'text-green' : 'text-white'}`}>
                        {card.value}
                    </p>
                    <p className={`text-xs ${card.bgColor === 'bg-yellow' ? 'text-green' : 'text-white'}`}>
                        {card.description}
                    </p>
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
                    </div>
                </CardContent>
            </Card>
        ))
    }

    const getRequestsCardTitle = () => {
        if (hasPermission('canApproveRequests')) {
            return {
                title: "Pending Requests",
                description: "Requests awaiting your approval"
            }
        }
        return {
            title: "Recent Requests",
            description: stats.showSystemStats ? "Latest system activity" : "Your recent data requests"
        }
    }

    const requestsCardInfo = getRequestsCardTitle()

    return (
        <div className="space-y-6">
            <div className="bg-green rounded-lg p-6  relative overflow-hidden">
                <h1 className="text-2xl font-bold text-white mb-2">
                    {welcomeMessage.title}
                </h1>
                <p className="text-yellow mb-4">
                    {welcomeMessage.subtitle}
                </p>
                {(user.role === 'internal' || user.role === 'external') && (
                    <Button asChild>
                        <Link href="/requests/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Link>
                    </Button>
                )}

                <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <div className="w-full h-full bg-white rounded-full -translate-y-16 translate-x-16"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
                    <div className="w-full h-full bg-white rounded-full translate-y-12 -translate-x-12"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {renderStatsCards()}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{requestsCardInfo.title}</CardTitle>
                        <CardDescription>
                            {requestsCardInfo.description}
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/requests">
                            View All
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {recentRequests.length === 0 ? (
                        <div className="text-center py-8">
                            {hasPermission('canApproveRequests') ? (
                                <>
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                                    <p className="text-gray-600">No pending requests to review.</p>
                                </>
                            ) : (
                                <>
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                                    <p className="text-gray-600 mb-4">Start by creating your first data request.</p>
                                    {user.role === 'external' && (
                                        <Button asChild>
                                            <Link href="/requests/new">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Request
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {getStatusIcon(request.status)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{request.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {request.requestNumber}
                                                {stats.showSystemStats && ` • ${request.userName}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Created {new Date(request.dateCreated).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge className={getStatusColor(request.status)}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </Badge>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/requests/${request.id}`}>
                                                {hasPermission('canApproveRequests') && request.status === 'pending' ? 'Review' : 'View'}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}