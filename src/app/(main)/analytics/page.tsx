"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts'
import {
    Download,
    TrendingUp,
    Users,
    FileText,
    Calendar as CalendarComponent,
    Activity,
    Shield
} from 'lucide-react'
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import type {DateRange} from "react-day-picker";

const requestsOverTime = [
    { month: 'Jan', requests: 45, approved: 38, rejected: 7 },
    { month: 'Feb', requests: 52, approved: 44, rejected: 8 },
    { month: 'Mar', requests: 48, approved: 41, rejected: 7 },
    { month: 'Apr', requests: 61, approved: 52, rejected: 9 },
    { month: 'May', requests: 55, approved: 47, rejected: 8 },
    { month: 'Jun', requests: 67, approved: 58, rejected: 9 },
    { month: 'Jul', requests: 71, approved: 63, rejected: 8 },
    { month: 'Aug', requests: 69, approved: 61, rejected: 8 },
    { month: 'Sep', requests: 76, approved: 68, rejected: 8 },
    { month: 'Oct', requests: 82, approved: 74, rejected: 8 },
    { month: 'Nov', requests: 89, approved: 81, rejected: 8 },
    { month: 'Dec', requests: 94, approved: 87, rejected: 7 }
]

const userTypeDistribution = [
    { name: 'Individual Researchers', value: 35, count: 124, fill: 'hsl(var(--chart-1))' },
    { name: 'Academic Institutions', value: 25, count: 89, fill: 'hsl(var(--chart-2))' },
    { name: 'Research Organizations', value: 20, count: 71, fill: 'hsl(var(--chart-3))' },
    { name: 'Private Companies', value: 12, count: 43, fill: 'hsl(var(--chart-4))' },
    { name: 'Government Agencies', value: 5, count: 18, fill: 'hsl(var(--chart-5))' },
    { name: 'NGOs', value: 3, count: 11, fill: '#f97316' }
]

const datasetPopularity = [
    { name: 'Parcel Boundaries', requests: 156, approvals: 142 },
    { name: 'Transaction Reports', requests: 134, approvals: 128 },
    { name: 'Land Use Data', requests: 98, approvals: 89 },
    { name: 'Ownership Records', requests: 87, approvals: 76 },
    { name: 'Administrative Boundaries', requests: 76, approvals: 71 },
    { name: 'Zoning Information', requests: 65, approvals: 58 },
    { name: 'Infrastructure Maps', requests: 54, approvals: 48 }
]

const processingTimes = [
    { category: 'Individual', avgDays: 3.2, median: 3 },
    { category: 'Academic', avgDays: 2.8, median: 2 },
    { category: 'Research Org', avgDays: 4.1, median: 4 },
    { category: 'Private Company', avgDays: 5.6, median: 5 },
    { category: 'Government', avgDays: 2.1, median: 2 },
    { category: 'NGO', avgDays: 3.8, median: 3 }
]

const requestsChartConfig = {
    requests: {
        label: "Total Requests",
        color: "hsl(var(--chart-1))",
    },
    approved: {
        label: "Approved",
        color: "hsl(var(--chart-2))",
    },
    rejected: {
        label: "Rejected",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

const userDistributionConfig = {
    individual: {
        label: "Individual Researchers",
        color: "hsl(var(--chart-1))",
    },
    academic: {
        label: "Academic Institutions",
        color: "hsl(var(--chart-2))",
    },
    research: {
        label: "Research Organizations",
        color: "hsl(var(--chart-3))",
    },
    private: {
        label: "Private Companies",
        color: "hsl(var(--chart-4))",
    },
    government: {
        label: "Government Agencies",
        color: "hsl(var(--chart-5))",
    },
    ngo: {
        label: "NGOs",
        color: "#f97316",
    },
} satisfies ChartConfig

const datasetChartConfig = {
    requests: {
        label: "Total Requests",
        color: "hsl(var(--chart-1))",
    },
    approvals: {
        label: "Approved",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const processingChartConfig = {
    avgDays: {
        label: "Average Days",
        color: "hsl(var(--chart-1))",
    },
    median: {
        label: "Median Days",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export default function AnalyticsPage() {
    const { user, hasPermission } = useAuth()
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

    if (!user || !hasPermission('canViewAnalytics')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                    <p className="text-gray-600">You don&#39;t have permission to view analytics.</p>
                </div>
            </div>
        )
    }

    const handleExportReport = (type: string) => {
        toast.success(`${type} report export started. You'll receive it via email.`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600">Data insights and usage analytics</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !dateRange?.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={(range) => setDateRange(range ?? undefined)}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => handleExportReport('Analytics')} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards with Dashboard Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue p-4 text-white relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,247</div>
                        <p className="text-xs text-white/80">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            +12% from last month
                        </p>
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-yellow p-4 text-green relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">356</div>
                        <p className="text-xs text-green/80">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            +8% from last month
                        </p>
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green p-4 text-white relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                        <Activity className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89.2%</div>
                        <p className="text-xs text-white/80">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            +2.1% from last month
                        </p>
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-500 p-4 text-white relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
                        <CalendarComponent className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.4 days</div>
                        <p className="text-xs text-white/80">
                            -0.3 days from last month
                        </p>
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requests">Request Analytics</TabsTrigger>
                    <TabsTrigger value="users">User Analytics</TabsTrigger>
                    <TabsTrigger value="datasets">Dataset Usage</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requests Over Time</CardTitle>
                                <CardDescription>Monthly request submission and approval trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={requestsChartConfig} className="min-h-[300px] w-full">
                                    <AreaChart data={requestsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="requests"
                                            stackId="1"
                                            stroke="var(--color-requests)"
                                            fill="var(--color-requests)"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="approved"
                                            stackId="2"
                                            stroke="var(--color-approved)"
                                            fill="var(--color-approved)"
                                            fillOpacity={0.8}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="rejected"
                                            stackId="3"
                                            stroke="var(--color-rejected)"
                                            fill="var(--color-rejected)"
                                            fillOpacity={0.8}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Type Distribution</CardTitle>
                                <CardDescription>Breakdown of users by organization type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={userDistributionConfig} className="min-h-[300px] w-full">
                                    <PieChart>
                                        <Pie
                                            data={userTypeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {userTypeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dataset Popularity</CardTitle>
                            <CardDescription>Most requested datasets and their approval rates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={datasetChartConfig} className="min-h-[400px] w-full">
                                <BarChart data={datasetPopularity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="approvals" fill="var(--color-approvals)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="bg-yellow p-4 text-green">
                            <CardHeader>
                                <CardTitle>Request Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Pending</span>
                                        <Badge className="bg-green/20 text-green border-green">127</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Approved</span>
                                        <Badge className="bg-green/20 text-green border-green">1,089</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Rejected</span>
                                        <Badge className="bg-green/20 text-green border-green">31</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Under Review</span>
                                        <Badge className="bg-green/20 text-green border-green">45</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue p-4 text-white">
                            <CardHeader>
                                <CardTitle>Request Priority</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">High Priority</span>
                                        <Badge className="bg-white/20 text-white border-white/20">23</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Medium Priority</span>
                                        <Badge className="bg-white/20 text-white border-white/20">89</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Low Priority</span>
                                        <Badge className="bg-white/20 text-white border-white/20">156</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Standard</span>
                                        <Badge className="bg-white/20 text-white border-white/20">1,024</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green p-4 text-white">
                            <CardHeader>
                                <CardTitle>Data Volume</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Small (&lt;1GB)</span>
                                        <Badge className="bg-white/20 text-white border-white/20">892</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Medium (1-10GB)</span>
                                        <Badge className="bg-white/20 text-white border-white/20">234</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Large (10-100GB)</span>
                                        <Badge className="bg-white/20 text-white border-white/20">89</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Very Large (&gt;100GB)</span>
                                        <Badge className="bg-white/20 text-white border-white/20">32</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Request Timeline</CardTitle>
                            <CardDescription>Request submissions over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={requestsChartConfig} className="min-h-[300px] w-full">
                                <LineChart data={requestsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="requests"
                                        stroke="var(--color-requests)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="approved"
                                        stroke="var(--color-approved)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rejected"
                                        stroke="var(--color-rejected)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Registration Trends</CardTitle>
                                <CardDescription>New user registrations by month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={requestsChartConfig} className="min-h-[300px] w-full">
                                    <BarChart data={requestsOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="requests" fill="var(--color-requests)" name="New Users" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-green p-4 text-white">
                            <CardHeader>
                                <CardTitle>User Activity</CardTitle>
                                <CardDescription className="text-white/80">Active vs inactive users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">Active Users</span>
                                        <Badge className="bg-white/20 text-white border-white/20">356</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">Inactive Users</span>
                                        <Badge className="bg-white/20 text-white border-white/20">89</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">Pending Verification</span>
                                        <Badge className="bg-white/20 text-white border-white/20">23</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Engagement</CardTitle>
                            <CardDescription>Average requests per user by organization type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={processingChartConfig} className="min-h-[300px] w-full">
                                <BarChart data={processingTimes} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickLine={false} axisLine={false} />
                                    <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="avgDays" fill="var(--color-avgDays)" name="Avg Requests per User" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="datasets" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dataset Access Frequency</CardTitle>
                                <CardDescription>How often each dataset is requested</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={datasetChartConfig} className="min-h-[300px] w-full">
                                    <BarChart data={datasetPopularity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue p-4 text-white">
                            <CardHeader>
                                <CardTitle>Dataset Approval Rates</CardTitle>
                                <CardDescription className="text-white/80">Approval percentage by dataset type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {datasetPopularity.map((dataset, index) => {
                                        const approvalRate = Math.round((dataset.approvals / dataset.requests) * 100)
                                        return (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{dataset.name}</span>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-white/20 rounded-full h-2">
                                                        <div
                                                            className="bg-white h-2 rounded-full"
                                                            style={{ width: `${approvalRate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-white">{approvalRate}%</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dataset Usage by User Type</CardTitle>
                            <CardDescription>Which user types request which datasets most</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Dataset</th>
                                        <th className="text-left p-2">Individual</th>
                                        <th className="text-left p-2">Academic</th>
                                        <th className="text-left p-2">Research Org</th>
                                        <th className="text-left p-2">Private</th>
                                        <th className="text-left p-2">Government</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {datasetPopularity.slice(0, 5).map((dataset, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">{dataset.name}</td>
                                            <td className="p-2"><Badge variant="outline">{Math.floor(Math.random() * 30 + 10)}</Badge></td>
                                            <td className="p-2"><Badge variant="outline">{Math.floor(Math.random() * 25 + 5)}</Badge></td>
                                            <td className="p-2"><Badge variant="outline">{Math.floor(Math.random() * 20 + 5)}</Badge></td>
                                            <td className="p-2"><Badge variant="outline">{Math.floor(Math.random() * 15 + 2)}</Badge></td>
                                            <td className="p-2"><Badge variant="outline">{Math.floor(Math.random() * 10 + 1)}</Badge></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Processing Times by User Type</CardTitle>
                                <CardDescription>Average days to approve requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={processingChartConfig} className="min-h-[300px] w-full">
                                    <BarChart data={processingTimes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="category"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar dataKey="avgDays" fill="var(--color-avgDays)" name="Average Days" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="median" fill="var(--color-median)" name="Median Days" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-green p-4 text-white">
                            <CardHeader>
                                <CardTitle>System Performance</CardTitle>
                                <CardDescription className="text-white/80">Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">System Uptime</span>
                                        <Badge className="bg-white/20 text-white border-white/20">99.9%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">Avg Response Time</span>
                                        <Badge className="bg-white/20 text-white border-white/20">1.2s</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">Daily Active Users</span>
                                        <Badge className="bg-white/20 text-white border-white/20">147</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                                        <span className="font-medium">Data Transfer (GB)</span>
                                        <Badge className="bg-white/20 text-white border-white/20">2.4TB</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Performance Trends</CardTitle>
                            <CardDescription>System performance over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={requestsChartConfig} className="min-h-[300px] w-full">
                                <LineChart data={requestsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="approved"
                                        stroke="var(--color-approved)"
                                        strokeWidth={2}
                                        name="Processing Efficiency"
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}