"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
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
  Area,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  FileText,
  Calendar as CalendarComponent,
  Activity,
  Shield,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { api, getErrorMessage } from "@/lib/api-config";
import type { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";

// Chart configurations using dashboard colors
const requestsChartConfig = {
  total: {
    label: "Total",
    color: "hsl(210, 100%, 45%)", // blue
  },
  approved: {
    label: "Approved",
    color: "hsl(142, 71%, 45%)", // green
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0, 84%, 60%)", // red
  },
  pending: {
    label: "Pending",
    color: "hsl(45, 93%, 47%)", // yellow
  },
  in_review: {
    label: "In Review",
    color: "hsl(262, 83%, 58%)", // purple
  },
} satisfies ChartConfig;

const userChartConfig = {
  external: {
    label: "External",
    color: "hsl(210, 100%, 45%)", // blue
  },
  internal: {
    label: "Internal",
    color: "hsl(142, 71%, 45%)", // green
  },
  admin: {
    label: "Admin",
    color: "hsl(0, 84%, 60%)", // red
  },
} satisfies ChartConfig;

const datasetChartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(210, 100%, 45%)", // blue
  },
  count: {
    label: "Count",
    color: "hsl(142, 71%, 45%)", // green
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [requestAnalytics, setRequestAnalytics] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [datasetAnalytics, setDatasetAnalytics] = useState<any>(null);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [exportLogs, setExportLogs] = useState<any>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const activeTab = searchParams.get("tab") || "overview";

  // Set default URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    if (!params.has("tab")) {
      params.set("tab", "overview");
      hasChanges = true;
    }

    if (hasChanges) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, []);

  // Fetch data when date range or tab changes
  useEffect(() => {
    if (user && hasPermission("canViewAnalytics")) {
      fetchAnalytics();
    }
  }, [dateRange, activeTab, user]);

  // Update URL when date range changes
  useEffect(() => {
    if (dateRange?.from || dateRange?.to) {
      const params = new URLSearchParams(searchParams.toString());
      if (dateRange.from) {
        params.set("startDate", dateRange.from.toISOString());
      } else {
        params.delete("startDate");
      }
      if (dateRange.to) {
        params.set("endDate", dateRange.to.toISOString());
      } else {
        params.delete("endDate");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      const params = {
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
      };

      // Fetch all analytics data in parallel
      const [requests, users, datasets, audit, exports] = await Promise.all([
        api.getRequestAnalytics(params).catch(() => null),
        api.getUserAnalytics(params).catch(() => null),
        api.getDatasetAnalytics(params).catch(() => null),
        api.getAuditStatistics(params).catch(() => null),
        api.getExportLogs({ page: 1, limit: 10 }).catch(() => null),
      ]);

      setRequestAnalytics(requests);
      setUserAnalytics(users);
      setDatasetAnalytics(datasets);
      setAuditStats(audit);
      setExportLogs(exports);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleExportReport = (type: string) => {
    toast.success(
      `${type} report export started. You'll receive it via email.`,
    );
  };

  if (!user || !hasPermission("canViewAnalytics")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Data insights and usage analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full sm:w-auto",
                  !dateRange?.from && "text-muted-foreground",
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
          <Button
            onClick={() => handleExportReport("Analytics")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards with Dashboard Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue p-4 text-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestAnalytics?.totalRequests || 0}
            </div>
            <p className="text-xs text-white/80">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              From selected period
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow p-4 text-green relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAnalytics?.totalUsers || 0}
            </div>
            <p className="text-xs text-green/80">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Registered users
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
            <div className="text-2xl font-bold">
              {requestAnalytics?.approvalRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-white/80">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Request approval rate
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500 p-4 text-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Processing Time
            </CardTitle>
            <CalendarComponent className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestAnalytics?.averageProcessingTime?.toFixed(1) || 0} days
            </div>
            <p className="text-xs text-white/80">
              <Clock className="h-3 w-3 inline mr-1" />
              Time to approval
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="w-full sm:w-auto flex-wrap h-auto bg-white p-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Requests Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Requests Over Time</CardTitle>
                <CardDescription>
                  Monthly request trends by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestAnalytics?.byMonth &&
                requestAnalytics.byMonth.length > 0 ? (
                  <ChartContainer
                    config={requestsChartConfig}
                    className="min-h-[300px] w-full"
                  >
                    <AreaChart
                      data={requestAnalytics.byMonth.map((item: any) => ({
                        month: format(new Date(item.month), "MMM yyyy"),
                        total: item.total,
                        approved: item.approved,
                        rejected: item.rejected,
                        pending: item.pending,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stackId="1"
                        stroke="var(--color-total)"
                        fill="var(--color-total)"
                        fillOpacity={0.4}
                      />
                      <Area
                        type="monotone"
                        dataKey="approved"
                        stackId="2"
                        stroke="var(--color-approved)"
                        fill="var(--color-approved)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="pending"
                        stackId="3"
                        stroke="var(--color-pending)"
                        fill="var(--color-pending)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No data available for selected period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent>
                {userAnalytics?.byRole && userAnalytics.byRole.length > 0 ? (
                  <ChartContainer
                    config={userChartConfig}
                    className="min-h-[300px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={userAnalytics.byRole.map((item: any) => ({
                          name: item.role,
                          value: item.count,
                          fill:
                            item.role === "external"
                              ? "hsl(210, 100%, 45%)"
                              : item.role === "internal"
                                ? "hsl(142, 71%, 45%)"
                                : "hsl(0, 84%, 60%)",
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {userAnalytics.byRole.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.role === "external"
                                  ? "hsl(210, 100%, 45%)"
                                  : entry.role === "internal"
                                    ? "hsl(142, 71%, 45%)"
                                    : "hsl(0, 84%, 60%)"
                              }
                            />
                          ),
                        )}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dataset Popularity */}
          <Card>
            <CardHeader>
              <CardTitle>Most Requested Datasets</CardTitle>
              <CardDescription>
                Top 10 datasets by request count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datasetAnalytics?.mostRequested &&
              datasetAnalytics.mostRequested.length > 0 ? (
                <ChartContainer
                  config={datasetChartConfig}
                  className="min-h-[400px] w-full"
                >
                  <BarChart data={datasetAnalytics.mostRequested.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="datasetName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="requestCount"
                      fill="var(--color-requests)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-gray-500">
                  No dataset request data available
                </div>
              )}
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
                  {requestAnalytics?.byStatus?.map((item: any) => (
                    <div
                      key={item.status}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm capitalize">{item.status}</span>
                      <Badge className="bg-green/20 text-green border-green">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue p-4 text-white">
              <CardHeader>
                <CardTitle>Request Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requestAnalytics?.byPriority?.map((item: any) => (
                    <div
                      key={item.priority}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm capitalize">
                        {item.priority}
                      </span>
                      <Badge className="bg-white/20 text-white border-white/20">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green p-4 text-white">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Avg Processing</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {requestAnalytics?.averageProcessingTime?.toFixed(1) || 0}{" "}
                      days
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Approval Rate</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {requestAnalytics?.approvalRate?.toFixed(1) || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Total Requests</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {requestAnalytics?.totalRequests || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Timeline</CardTitle>
              <CardDescription>Request trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {requestAnalytics?.byMonth &&
              requestAnalytics.byMonth.length > 0 ? (
                <ChartContainer
                  config={requestsChartConfig}
                  className="min-h-[300px] w-full"
                >
                  <LineChart data={requestAnalytics.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM yyyy")
                      }
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No timeline data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
                <CardDescription>New users by month</CardDescription>
              </CardHeader>
              <CardContent>
                {userAnalytics?.byMonth && userAnalytics.byMonth.length > 0 ? (
                  <ChartContainer
                    config={userChartConfig}
                    className="min-h-[300px] w-full"
                  >
                    <BarChart data={userAnalytics.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) =>
                          format(new Date(value), "MMM yyyy")
                        }
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="external"
                        fill="var(--color-external)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="internal"
                        fill="var(--color-internal)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="admin"
                        fill="var(--color-admin)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No user registration data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green p-4 text-white">
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription className="text-white/80">
                  User status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Total Users</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {userAnalytics?.totalUsers || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Verified</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {userAnalytics?.verificationStatus?.verified || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Unverified</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {userAnalytics?.verificationStatus?.unverified || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Active</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {userAnalytics?.activeStatus?.active || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Users by Type</CardTitle>
              <CardDescription>Organization type distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {userAnalytics?.byUserType &&
              userAnalytics.byUserType.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User Type</th>
                        <th className="text-left p-2">Count</th>
                        <th className="text-left p-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAnalytics.byUserType.map(
                        (item: any, index: number) => {
                          const percentage =
                            (item.count / userAnalytics.totalUsers) * 100;
                          return (
                            <tr
                              key={index}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-2 font-medium capitalize">
                                {item.userType.replace(/_/g, " ")}
                              </td>
                              <td className="p-2">
                                <Badge variant="outline">{item.count}</Badge>
                              </td>
                              <td className="p-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  No user type data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Categories</CardTitle>
                <CardDescription>Datasets by category</CardDescription>
              </CardHeader>
              <CardContent>
                {datasetAnalytics?.byCategory &&
                datasetAnalytics.byCategory.length > 0 ? (
                  <ChartContainer
                    config={datasetChartConfig}
                    className="min-h-[300px] w-full"
                  >
                    <BarChart data={datasetAnalytics.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="categoryName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="var(--color-count)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue p-4 text-white">
              <CardHeader>
                <CardTitle>Dataset Statistics</CardTitle>
                <CardDescription className="text-white/80">
                  Overall dataset metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Total Datasets</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {datasetAnalytics?.totalDatasets || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Categories</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {datasetAnalytics?.totalCategories || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded">
                    <span className="font-medium">Total Requests</span>
                    <Badge className="bg-white/20 text-white border-white/20">
                      {datasetAnalytics?.totalRequests || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Requested Datasets</CardTitle>
              <CardDescription>
                Top datasets with category information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datasetAnalytics?.mostRequested &&
              datasetAnalytics.mostRequested.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Dataset</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Requests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasetAnalytics.mostRequested
                        .slice(0, 10)
                        .map((dataset: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">
                              {dataset.datasetName}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">
                                {dataset.categoryIcon} {dataset.categoryName}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge className="bg-blue text-white">
                                {dataset.requestCount}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  No dataset request data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-green p-4 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Total Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditStats?.totalLogs || 0}
                </div>
                <p className="text-xs text-white/80 mt-2">
                  Audit trail entries
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow p-4 text-green">
              <CardHeader>
                <CardTitle>Actions Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditStats?.logsByAction
                    ?.slice(0, 4)
                    .map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{item.action}</span>
                        <Badge className="bg-green/20 text-green border-green">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue p-4 text-white">
              <CardHeader>
                <CardTitle>Entity Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditStats?.logsByEntityType?.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm capitalize">
                          {item.entityType}
                        </span>
                        <Badge className="bg-white/20 text-white border-white/20">
                          {item.count}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Active Users</CardTitle>
              <CardDescription>Users with most activity</CardDescription>
            </CardHeader>
            <CardContent>
              {auditStats?.topUsers && auditStats.topUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Activity Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditStats.topUsers.map((item: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">
                            {item.user?.name || "Unknown"}
                          </td>
                          <td className="p-2 text-sm text-gray-600">
                            {item.user?.email || "N/A"}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="capitalize">
                              {item.user?.role || "N/A"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge className="bg-green text-white">
                              {item.activityCount}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  No audit trail data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest audit trail entries</CardDescription>
            </CardHeader>
            <CardContent>
              {auditStats?.recentActivity &&
              auditStats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {auditStats.recentActivity
                    .slice(0, 10)
                    .map((log: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm text-gray-600">
                              on {log.entityType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            by {log.user?.name || "Unknown"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(log.createdAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-blue p-4 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Total Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {exportLogs?.pagination?.total || 0}
                </div>
                <p className="text-xs text-white/80 mt-2">
                  Data exports created
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow p-4 text-green">
              <CardHeader>
                <CardTitle>Export Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exportLogs?.exports &&
                    Array.from(
                      new Set(
                        exportLogs.exports.map((e: any) => e.exportFormat),
                      ),
                    ).map((format: any, index: number) => {
                      const count = exportLogs.exports.filter(
                        (e: any) => e.exportFormat === format,
                      ).length;
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm uppercase">{format}</span>
                          <Badge className="bg-green/20 text-green border-green">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green p-4 text-white">
              <CardHeader>
                <CardTitle>Export Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exportLogs?.exports &&
                    Array.from(
                      new Set(exportLogs.exports.map((e: any) => e.exportType)),
                    ).map((type: any, index: number) => {
                      const count = exportLogs.exports.filter(
                        (e: any) => e.exportType === type,
                      ).length;
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm capitalize">{type}</span>
                          <Badge className="bg-white/20 text-white border-white/20">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>Latest data exports</CardDescription>
            </CardHeader>
            <CardContent>
              {exportLogs?.exports && exportLogs.exports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Request</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Format</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Size</th>
                        <th className="text-left p-2">Downloads</th>
                        <th className="text-left p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportLogs.exports.map((exp: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">
                            {exp.request?.requestNumber || "N/A"}
                          </td>
                          <td className="p-2 text-sm">
                            {exp.user?.name || "Unknown"}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="uppercase">
                              {exp.exportFormat}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="capitalize">
                              {exp.exportType}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-gray-600">
                            {(parseInt(exp.fileSize) / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </td>
                          <td className="p-2">
                            <Badge className="bg-blue text-white">
                              {exp.downloadCount}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-gray-600">
                            {format(new Date(exp.createdAt), "MMM dd, yyyy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  No export data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
