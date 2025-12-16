"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Users,
  Database,
  FileCheck,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Folder,
  ChevronRight,
} from "lucide-react";
import {
  RequestStats,
  UserStats,
  DatasetStats,
  ReviewStats,
  ExportStats,
} from "@/lib/api-config";
import { useState } from "react";

interface StatsFolderViewProps {
  requestStats: RequestStats;
  userStats?: UserStats;
  datasetStats?: DatasetStats;
  reviewStats?: ReviewStats;
  exportStats?: ExportStats;
  userRole: "admin" | "internal" | "external";
}

type FolderType = "requests" | "users" | "datasets" | "reviews" | "exports" | null;

export function StatsFolderView({
  requestStats,
  userStats,
  datasetStats,
  reviewStats,
  exportStats,
  userRole,
}: StatsFolderViewProps) {
  const [openFolder, setOpenFolder] = useState<FolderType>(null);

  const isAdmin = userRole === "admin";
  const showFullStats = isAdmin || !!userStats;

  const toggleFolder = (folder: FolderType) => {
    setOpenFolder(openFolder === folder ? null : folder);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Requests Folder */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => toggleFolder("requests")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Folder className="h-4 w-4 mr-2 text-blue-600" />
            Requests
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {requestStats.total || requestStats.myRequests || 0}
            </Badge>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${openFolder === "requests" ? "rotate-90" : ""}`}
            />
          </div>
        </CardHeader>
        {openFolder === "requests" && (
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                <span>Pending</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                {requestStats.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                <span>In Review</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {requestStats.in_review}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span>Approved</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {requestStats.approved}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                <span>Rejected</span>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {requestStats.rejected}
              </Badge>
            </div>
            {requestStats.changes_requested !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                  <span>Changes Requested</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  {requestStats.changes_requested}
                </Badge>
              </div>
            )}
            {requestStats.approvalRate !== undefined && (
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Approval Rate</span>
                <span className="font-semibold text-green-600">
                  {requestStats.approvalRate.toFixed(1)}%
                </span>
              </div>
            )}
            {requestStats.avgProcessingDays !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg. Processing</span>
                <span className="font-semibold">
                  {requestStats.avgProcessingDays.toFixed(1)} days
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Users Folder */}
      {userStats && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleFolder("users")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Folder className="h-4 w-4 mr-2 text-purple-600" />
              Users
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{userStats.total}</Badge>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${openFolder === "users" ? "rotate-90" : ""}`}
              />
            </div>
          </CardHeader>
          {openFolder === "users" && (
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-600" />
                  <span>External</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {userStats.external}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Internal</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {userStats.internal}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-red-600" />
                  <span>Admin</span>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {userStats.admin}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Verified</span>
                <Badge className="bg-green-100 text-green-800">
                  {userStats.verified}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unverified</span>
                <Badge className="bg-gray-100 text-gray-800">
                  {userStats.unverified}
                </Badge>
              </div>
              {userStats.currentMonth !== undefined && (
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-blue-600">
                    +{userStats.currentMonth}
                  </span>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Datasets Folder */}
      {datasetStats && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleFolder("datasets")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Folder className="h-4 w-4 mr-2 text-indigo-600" />
              Datasets
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{datasetStats.total}</Badge>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${openFolder === "datasets" ? "rotate-90" : ""}`}
              />
            </div>
          </CardHeader>
          {openFolder === "datasets" && (
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2 text-indigo-600" />
                  <span>Categories</span>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {datasetStats.categories}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Total Requests</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {datasetStats.totalRequests}
                </Badge>
              </div>
              {datasetStats.currentMonthRequests !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    <span>This Month</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {datasetStats.currentMonthRequests}
                  </Badge>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Reviews Folder */}
      {reviewStats && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleFolder("reviews")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Folder className="h-4 w-4 mr-2 text-amber-600" />
              Reviews
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{reviewStats.total}</Badge>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${openFolder === "reviews" ? "rotate-90" : ""}`}
              />
            </div>
          </CardHeader>
          {openFolder === "reviews" && (
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                  <span>Pending</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {reviewStats.pending}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                  <span>In Progress</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {reviewStats.in_progress}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span>Approved</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {reviewStats.approved}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  <span>Rejected</span>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {reviewStats.rejected}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                  <span>Changes Requested</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  {reviewStats.changes_requested}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Active Reviewers</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {reviewStats.activeReviewers}
                </Badge>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Exports Folder */}
      {exportStats && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleFolder("exports")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Folder className="h-4 w-4 mr-2 text-teal-600" />
              Exports
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{exportStats.total}</Badge>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${openFolder === "exports" ? "rotate-90" : ""}`}
              />
            </div>
          </CardHeader>
          {openFolder === "exports" && (
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  <span>This Month</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {exportStats.currentMonth}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Total Downloads</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {exportStats.totalDownloads}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Active</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  {exportStats.activeExports}
                </Badge>
              </div>
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs text-gray-600 font-medium">By Format:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>CSV:</span>
                    <span className="font-medium">{exportStats.byFormat.csv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>XLSX:</span>
                    <span className="font-medium">{exportStats.byFormat.xlsx}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>JSON:</span>
                    <span className="font-medium">{exportStats.byFormat.json}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shapefile:</span>
                    <span className="font-medium">{exportStats.byFormat.shapefile}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span>PDF:</span>
                    <span className="font-medium">{exportStats.byFormat.pdf}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

export function StatsFolderViewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-12" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
