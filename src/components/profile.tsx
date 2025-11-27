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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Mail, Save, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api, getErrorMessage, type Request } from "@/lib/api-config";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    organizationName: user?.organizationName || "",
    organizationEmail: user?.organizationEmail || "",
  });

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const result = await api.getRequests({ page: 1, limit: 1000 });
        setUserRequests(result.requests);
      } catch (error) {
        console.error("Error fetching user requests:", error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  if (!user) return null;

  const isOrganization =
    user.userType !== "individual" && user.userType !== "employee";

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {};

      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.phone !== user.phone) updateData.phone = formData.phone;
      if (formData.address !== user.address)
        updateData.address = formData.address;

      if (isOrganization) {
        if (formData.organizationName !== user.organizationName) {
          updateData.organizationName = formData.organizationName;
        }
        if (formData.organizationEmail !== user.organizationEmail) {
          updateData.organizationEmail = formData.organizationEmail;
        }
      }

      // Only call API if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        setIsEditing(false);
        return;
      }

      await api.updateCurrentUser(updateData);

      // Refresh user data in context by reloading
      window.location.reload();

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
      console.error("Error updating profile:", error);
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
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and information
          </p>
        </div>
        <Badge className={getRoleColor(user.role)}>
          {getRoleLabel(user.role)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2 space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your account details and contact information
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
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
                      type="email"
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

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  ROLE
                </Label>
                <p className="mt-1 text-gray-900">{getRoleLabel(user.role)}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  USER TYPE
                </Label>
                <p className="mt-1 text-gray-900 capitalize">
                  {user.userType.replace(/_/g, " ")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Your current system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.permissions.canViewAllRequests && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">View All Requests</span>
                  </div>
                )}
                {user.permissions.canApproveRequests && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Approve Requests</span>
                  </div>
                )}
                {user.permissions.canManageUsers && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Manage Users</span>
                  </div>
                )}
                {user.permissions.canExportData && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Export Data</span>
                  </div>
                )}
                {user.permissions.canViewAuditTrail && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">View Audit Trail</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
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
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
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
                  EMAIL
                </Label>
                <p className="mt-1 text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingRequests ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      TOTAL REQUESTS
                    </Label>
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      APPROVED
                    </Label>
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      PENDING
                    </Label>
                    <Skeleton className="h-8 w-16" />
                  </div>
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
                      APPROVED
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
                      PENDING
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
        </div>
      </div>
    </div>
  );
}
