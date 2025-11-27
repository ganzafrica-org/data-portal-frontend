"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { api, getErrorMessage } from "@/lib/api-config";
import { Building, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RequestFormNewProps {
  mode: "create" | "edit";
  initialData?: any;
}

export default function RequestFormNew({
  mode,
  initialData,
}: RequestFormNewProps) {
  const { user, getUserDisplayInfo } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "normal",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const canEdit =
    mode === "create" ||
    (initialData &&
      user &&
      user.id === initialData.userId &&
      ["pending", "rejected"].includes(initialData.status));

  useEffect(() => {
    // Track unsaved changes
    const hasChanges =
      formData.title.trim() !== "" || formData.description.trim() !== "";
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  useEffect(() => {
    // Warn before leaving page with unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && mode === "create") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, mode]);

  if (!user) return null;

  // Check permission for edit mode
  if (mode === "edit" && !canEdit) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to edit this request.
        </p>
        <p className="text-sm text-gray-500">
          You can only edit your own pending or rejected requests.
        </p>
      </div>
    );
  }

  const userInfo = getUserDisplayInfo();

  const handleCancel = async () => {
    if (hasUnsavedChanges) {
      setShowLeaveDialog(true);
    } else {
      router.back();
    }
  };

  const handleConfirmLeave = async () => {
    // Clean up partially created request if any
    if (createdRequestId) {
      try {
        await api.deleteRequest(createdRequestId);
      } catch (error) {
        console.error("Error cleaning up request:", error);
      }
    }
    router.back();
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a request title");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create new request
        const newRequest = await api.createRequest({
          title: formData.title,
          description: formData.description,
          priority: formData.priority as "low" | "normal" | "high" | "urgent",
        });

        toast.success("Request created successfully");
        setHasUnsavedChanges(false);

        // Navigate to the request details page
        router.push(`/requests/${newRequest.id}`);
      } else {
        // Update existing request
        if (!initialData?.id) {
          toast.error("Request ID not found");
          return;
        }

        const updatedRequest = await api.updateRequest(initialData.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority as "low" | "normal" | "high" | "urgent",
        });

        toast.success(
          initialData.status === "rejected"
            ? "Request resubmitted successfully"
            : "Request updated successfully",
        );
        setHasUnsavedChanges(false);

        // Navigate to the request details page
        router.push(`/requests/${updatedRequest.id}`);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {mode === "create"
              ? "Create New Data Request"
              : "Edit Data Request"}
          </h1>
          <p className="text-gray-600">
            {mode === "create"
              ? "Submit a request to access land administration data"
              : "Update your data request details"}
          </p>
        </div>

        {/* User Info Card */}
        <Card className="bg-blue p-4 text-white">
          <CardContent className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              {userInfo.isOrganization ? (
                <Building className="h-6 w-6" />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{userInfo.displayName}</h3>
              <p className="text-sm text-white/80">{userInfo.typeLabel}</p>
              <Badge className="bg-white/20 text-white border-white/20 mt-1">
                {userInfo.roleLabel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide basic details about your data request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Land Use Analysis for Kigali District"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the purpose of your data request and how the data will be used..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-green hover:bg-green/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === "create"
                    ? "Creating Request..."
                    : "Updating Request..."}
                </>
              ) : mode === "create" ? (
                "Create Request"
              ) : (
                "Update Request"
              )}
            </Button>
          </div>
        </form>
      </div>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, your progress will be
              lost. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Page</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
