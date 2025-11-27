"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Shield, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  api,
  getErrorMessage,
  type User,
  type Request,
} from "@/lib/api-config";
import { toast } from "sonner";

interface UserDetailsProps {
  user: User;
  onUpdate?: () => void;
}

export default function UserDetailsNew({ user, onUpdate }: UserDetailsProps) {
  const { user: currentUser } = useAuth();
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    address: user.address || "",
    organizationName: user.organizationName || "",
    organizationEmail: user.organizationEmail || "",
    permissions: { ...user.permissions },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user requests
  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        setIsLoadingRequests(true);
        const result = await api.getRequests({ page: 1, limit: 1000 });
        const filtered = result.requests.filter(
          (req) => req.userId === user.id,
        );
        setUserRequests(filtered);
      } catch (error) {
        console.error("Error fetching user requests:", error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchUserRequests();
  }, [user.id]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "internal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "external":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "internal":
        return "Internal Staff";
      case "external":
        return "External User";
      default:
        return role;
    }
  };

  const handlePermissionChange = (
    permission: keyof typeof formData.permissions,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user basic info
      const updateData: any = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.phone !== user.phone) updateData.phone = formData.phone;
      if (formData.address !== user.address)
        updateData.address = formData.address;
      if (formData.organizationName !== user.organizationName)
        updateData.organizationName = formData.organizationName;
      if (formData.organizationEmail !== user.organizationEmail)
        updateData.organizationEmail = formData.organizationEmail;

      if (Object.keys(updateData).length > 0) {
        await api.updateUser(user.id, updateData);
      }

      // Update permissions
      const permissionsChanged = Object.keys(formData.permissions).some(
        (key) =>
          formData.permissions[key as keyof typeof formData.permissions] !==
          user.permissions[key as keyof typeof user.permissions],
      );

      if (permissionsChanged) {
        await api.updateUserPermissions(user.id, formData.permissions);
      }

      toast.success("User updated successfully");
      setIsEditing(false);

      // Refresh user data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
      console.error("Error updating user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone,
      address: user.address || "",
      organizationName: user.organizationName || "",
      organizationEmail: user.organizationEmail || "",
      permissions: { ...user.permissions },
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "resubmitted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOrganization =
    user.userType !== "individual" && user.userType !== "employee";

  return (
    <div className="max-w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="px-0">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>

        {/* Title and Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg p-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {user.name}
            </h1>
            <p className="text-gray-600 truncate">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getRoleColor(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                Edit User
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                User account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={user.email} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isOrganization && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          organizationName: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizationEmail">
                      Organization Email
                    </Label>
                    <Input
                      id="organizationEmail"
                      value={formData.organizationEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          organizationEmail: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    ROLE
                  </Label>
                  <p className="mt-1 text-gray-900">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    USER TYPE
                  </Label>
                  <p className="mt-1 text-gray-900 capitalize">
                    {user.userType.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Configure what this user can do in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canViewAllRequests"
                    checked={formData.permissions.canViewAllRequests}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canViewAllRequests",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canViewAllRequests"
                      className="text-sm font-medium cursor-pointer"
                    >
                      View All Requests
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can see requests from all users
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canApproveRequests"
                    checked={formData.permissions.canApproveRequests}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canApproveRequests",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canApproveRequests"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Approve Requests
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can approve or reject data requests
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canManageUsers"
                    checked={formData.permissions.canManageUsers}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canManageUsers",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canManageUsers"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage Users
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can create, edit, and manage users
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canExportData"
                    checked={formData.permissions.canExportData}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canExportData",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canExportData"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Export Data
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can download and export datasets
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canViewAuditTrail"
                    checked={formData.permissions.canViewAuditTrail}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canViewAuditTrail",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canViewAuditTrail"
                      className="text-sm font-medium cursor-pointer"
                    >
                      View Audit Trail
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can access system audit logs
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canConfigureDatasets"
                    checked={formData.permissions.canConfigureDatasets}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canConfigureDatasets",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canConfigureDatasets"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Configure Datasets
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can configure dataset settings
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canViewAnalytics"
                    checked={formData.permissions.canViewAnalytics}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "canViewAnalytics",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="canViewAnalytics"
                      className="text-sm font-medium cursor-pointer"
                    >
                      View Analytics
                    </Label>
                    <p className="text-xs text-gray-500">
                      Can access analytics dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="requiresApproval"
                    checked={formData.permissions.requiresApproval}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(
                        "requiresApproval",
                        checked as boolean,
                      )
                    }
                    disabled={!isEditing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="requiresApproval"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Requires Approval
                    </Label>
                    <p className="text-xs text-gray-500">
                      Requests need admin approval
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Data requests submitted by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : userRequests.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No requests found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {request.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {request.requestNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/requests/${request.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {userRequests.length > 5 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/requests?search=${user.email}`}>
                        View all {userRequests.length} requests
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  MEMBER SINCE
                </Label>
                <p className="mt-1 text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(user.dateJoined).toLocaleDateString()}
                </p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  VERIFICATION STATUS
                </Label>
                <p className="mt-1 flex items-center">
                  {user.isVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Not Verified
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  ACCOUNT STATUS
                </Label>
                <p className="mt-1 flex items-center">
                  {user.isActive ? (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </p>
              </div>
              <Separator />
              {isLoadingRequests ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      TOTAL REQUESTS
                    </Label>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {userRequests.length}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      APPROVED REQUESTS
                    </Label>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {
                        userRequests.filter((r) => r.status === "approved")
                          .length
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      PENDING REQUESTS
                    </Label>
                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                      {
                        userRequests.filter((r) => r.status === "pending")
                          .length
                      }
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/requests?search=${user.email}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Requests
                </Link>
              </Button>

              {!user.isVerified && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await api.verifyUser(user.id);
                      toast.success("User verified successfully");
                      if (onUpdate) onUpdate();
                    } catch (error: any) {
                      toast.error(getErrorMessage(error));
                    }
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify User
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
