"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Database,
} from "lucide-react";
import { RequestStats, UserStats, DatasetStats } from "@/lib/api-config";

interface StatsCardsProps {
  requestStats: RequestStats;
  userStats?: UserStats;
  datasetStats?: DatasetStats;
  userRole: "admin" | "internal" | "external";
  canManageUsers: boolean;
  canApproveRequests: boolean;
}

export function StatsCards({
  requestStats,
  userStats,
  datasetStats,
  userRole,
  canManageUsers,
  canApproveRequests,
}: StatsCardsProps) {
  const isAdmin = userRole === "admin";
  const showSystemStats = isAdmin || !!userStats;

  const baseCards = [
    {
      title: "Total Requests",
      value: requestStats.total || requestStats.myRequests || 0,
      icon: <FileText className="h-6 w-6 text-white" />,
      description: showSystemStats ? "All data requests" : "Your requests",
      bgColor: "bg-blue",
      iconBg: "bg-blue/80",
    },
    {
      title: showSystemStats ? "Pending Approval" : "Pending",
      value: requestStats.pending,
      icon: canApproveRequests ? (
        <AlertCircle className="h-6 w-6 text-green" />
      ) : (
        <Clock className="h-6 w-6 text-green" />
      ),
      description: showSystemStats ? "Need attention" : "Awaiting approval",
      bgColor: "bg-yellow",
      iconBg: "bg-yellow/80",
    },
    {
      title: "Approved",
      value: requestStats.approved,
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      description: showSystemStats
        ? "Processed requests"
        : "Ready for download",
      bgColor: "bg-green",
      iconBg: "bg-green/80",
    },
    {
      title: "Rejected",
      value: requestStats.rejected,
      icon: <XCircle className="h-6 w-6 text-white" />,
      description: showSystemStats ? "Declined requests" : "Need attention",
      bgColor: "bg-red-500",
      iconBg: "bg-red-600",
    },
  ];

  // For admins, replace rejected with users or datasets
  if (showSystemStats && canManageUsers && userStats) {
    baseCards[3] = {
      title: "Total Users",
      value: userStats.total,
      icon: <Users className="h-6 w-6 text-white" />,
      description: `${userStats.external} external, ${userStats.internal + userStats.admin} internal`,
      bgColor: "bg-blue",
      iconBg: "bg-blue/80",
    };
  } else if (isAdmin && datasetStats && !canManageUsers) {
    baseCards[3] = {
      title: "Datasets",
      value: datasetStats.total,
      icon: <Database className="h-6 w-6 text-white" />,
      description: `${datasetStats.categories} categories`,
      bgColor: "bg-purple-500",
      iconBg: "bg-purple-600",
    };
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {baseCards.map((card, index) => (
        <Card
          key={index}
          className={`${card.bgColor} p-4 text-white relative overflow-hidden`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${card.bgColor === "bg-yellow" ? "text-green" : "text-white"}`}
            >
              {card.value}
            </p>
            <p
              className={`text-xs ${card.bgColor === "bg-yellow" ? "text-green" : "text-white"}`}
            >
              {card.description}
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className="w-full h-full bg-white rounded-full -translate-y-10 translate-x-10"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
