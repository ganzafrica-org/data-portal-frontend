"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";
import {
  Database,
  Shield,
  Settings,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Users,
  FileText,
  Loader2,
} from "lucide-react";

const datasetFormSchema = z.object({
  name: z.string().min(1, "Dataset name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),

  // Data Criteria Flags
  requiresPeriod: z.boolean().default(false),
  requiresUpiList: z.boolean().default(false),
  requiresIdList: z.boolean().default(false),
  requiresUpi: z.boolean().default(false),
  hasAdminLevel: z.boolean().default(false),
  hasUserLevel: z.boolean().default(false),
  hasTransactionType: z.boolean().default(false),
  hasLandUse: z.boolean().default(false),
  hasSizeRange: z.boolean().default(false),

  // Approval Settings
  requiresApproval: z.boolean().default(true),
  autoApproveForRoles: z.array(z.string()).default([]),
  allowsRecurring: z.boolean().default(false),
});

type DatasetFormData = z.infer<typeof datasetFormSchema>;

interface DatasetFormProps {
  dataset?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DatasetForm({
  dataset,
  onSuccess,
  onCancel,
}: DatasetFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<DatasetFormData>({
    resolver: zodResolver(datasetFormSchema),
    defaultValues: {
      name: dataset?.name || "",
      description: dataset?.description || "",
      categoryId: dataset?.categoryId || "",
      requiresPeriod: dataset?.requiresPeriod || false,
      requiresUpiList: dataset?.requiresUpiList || false,
      requiresIdList: dataset?.requiresIdList || false,
      requiresUpi: dataset?.requiresUpi || false,
      hasAdminLevel: dataset?.hasAdminLevel || false,
      hasUserLevel: dataset?.hasUserLevel || false,
      hasTransactionType: dataset?.hasTransactionType || false,
      hasLandUse: dataset?.hasLandUse || false,
      hasSizeRange: dataset?.hasSizeRange || false,
      requiresApproval: dataset?.requiresApproval !== undefined ? dataset.requiresApproval : true,
      autoApproveForRoles: dataset?.autoApproveForRoles || [],
      allowsRecurring: dataset?.allowsRecurring || false,
    },
  });

  const requiresApproval = form.watch("requiresApproval");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDatasetCategories({ includeInactive: false });
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DatasetFormData) => {
    try {
      setIsSaving(true);

      if (dataset?.id) {
        // Update existing dataset
        await api.updateDataset(dataset.id, data);
      } else {
        // Create new dataset
        await api.createDataset(data);
      }

      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const userRoles = [
    { value: "external", label: "External Users" },
    { value: "internal", label: "Internal Staff" },
    { value: "admin", label: "Administrators" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Dataset Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Land Transaction Records"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A clear, descriptive name for this dataset
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what data this dataset contains and what it's used for..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Help users understand what this dataset contains
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Group this dataset under a category
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Data Criteria Configuration */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Data Criteria</h3>
          </div>
          <p className="text-sm text-gray-600">
            Select which filtering criteria are available for this dataset
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="requiresPeriod"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Range / Period
                    </FormLabel>
                    <FormDescription>
                      Requires users to select a date range when requesting
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasAdminLevel"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Administrative Level
                    </FormLabel>
                    <FormDescription>
                      Filter by province, district, sector, cell, village
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasUserLevel"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Level Filter
                    </FormLabel>
                    <FormDescription>
                      Filter by user categories or groups
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasTransactionType"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Transaction Type
                    </FormLabel>
                    <FormDescription>
                      Filter by transaction categories
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasLandUse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Land Use Type</FormLabel>
                    <FormDescription>
                      Filter by land use categories
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasSizeRange"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Size Range</FormLabel>
                    <FormDescription>
                      Filter by parcel size (min/max)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresUpi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Single UPI</FormLabel>
                    <FormDescription>
                      Requires a single UPI identifier
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresUpiList"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>UPI List</FormLabel>
                    <FormDescription>
                      Accepts multiple UPI identifiers
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresIdList"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>ID List</FormLabel>
                    <FormDescription>
                      Accepts multiple ID identifiers
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Approval & Access Control */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Approval & Access Control</h3>
          </div>

          <FormField
            control={form.control}
            name="requiresApproval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50 border-blue-200">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none flex-1">
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    {field.value ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    Requires Manual Approval
                  </FormLabel>
                  <FormDescription className="text-sm">
                    {field.value ? (
                      <span className="text-blue-900">
                        Requests for this dataset will require review and approval by
                        authorized staff before data is released.
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        Requests for this dataset will be automatically approved
                        without manual review. Use this for public or non-sensitive
                        datasets.
                      </span>
                    )}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {!requiresApproval && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Auto-Approval Enabled
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Requests for this dataset will be instantly approved without
                      requiring manual review. Ensure this dataset doesn't contain
                      sensitive or restricted information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <FormField
            control={form.control}
            name="autoApproveForRoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auto-Approve for Specific Roles (Optional)</FormLabel>
                <FormDescription className="mb-3">
                  Even if manual approval is required, these user roles will get
                  instant approval
                </FormDescription>
                <div className="space-y-2">
                  {userRoles.map((role) => (
                    <div
                      key={role.value}
                      className="flex items-center space-x-3 rounded-md border p-3"
                    >
                      <Checkbox
                        checked={field.value?.includes(role.value)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          if (checked) {
                            field.onChange([...current, role.value]);
                          } else {
                            field.onChange(
                              current.filter((v) => v !== role.value),
                            );
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{role.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowsRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-base">
                    Allow Recurring Requests
                  </FormLabel>
                  <FormDescription>
                    Users can set up automated recurring requests for this dataset
                    (e.g., weekly, monthly reports)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green hover:bg-green/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {dataset ? "Update Dataset" : "Create Dataset"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
