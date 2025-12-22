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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Wand2,
} from "lucide-react";
import VisualQueryBuilder from "./visual-query-builder";
import { QueryConfig } from "@/lib/data";

const datasetFormSchema = z.object({
  name: z.string().min(1, "Dataset name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),

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
  const [activeTab, setActiveTab] = useState("basic");
  const [queryConfig, setQueryConfig] = useState<QueryConfig | null>(
    dataset?.queryConfig || null,
  );

  const form = useForm<DatasetFormData>({
    resolver: zodResolver(datasetFormSchema),
    defaultValues: {
      name: dataset?.name || "",
      description: dataset?.description || "",
      categoryId: dataset?.categoryId || "",
      requiresApproval:
        dataset?.requiresApproval !== undefined
          ? dataset.requiresApproval
          : true,
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
      const data = await api.getDatasetCategories();
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

      const payload = {
        ...data,
        queryConfig: queryConfig || undefined,
      };

      if (dataset?.id) {
        // Update existing dataset
        await api.updateDataset(dataset.id, payload);
      } else {
        // Create new dataset
        await api.createDataset(payload);
      }

      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleQueryConfigSave = async (config: QueryConfig) => {
    setQueryConfig(config);
    setActiveTab("basic");
    toast.success("Query configuration updated. Remember to save the dataset.");
  };

  const userRoles = [
    { value: "external", label: "External Users" },
    { value: "internal", label: "Internal Staff" },
    { value: "admin", label: "Administrators" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Basic Configuration
        </TabsTrigger>
        <TabsTrigger value="query-builder" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Visual Query Builder
          {queryConfig && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Configured
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
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

            {/* Approval & Access Control */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">
                  Approval & Access Control
                </h3>
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
                            Requests for this dataset will require review and
                            approval by authorized staff before data is
                            released.
                          </span>
                        ) : (
                          <span className="text-gray-700">
                            Requests for this dataset will be automatically
                            approved without manual review. Use this for public
                            or non-sensitive datasets.
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
                          Requests for this dataset will be instantly approved
                          without requiring manual review. Ensure this dataset
                          doesn't contain sensitive or restricted information.
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
                    <FormLabel>
                      Auto-Approve for Specific Roles (Optional)
                    </FormLabel>
                    <FormDescription className="mb-3">
                      Even if manual approval is required, these user roles will
                      get instant approval
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
                        Users can set up automated recurring requests for this
                        dataset (e.g., weekly, monthly reports)
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
      </TabsContent>

      <TabsContent value="query-builder">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Visual Query Builder
            </CardTitle>
            <p className="text-sm text-gray-600">
              Build dynamic SQL queries without writing code. Configure which
              LAIS database tables, columns, and filters users can access for
              this dataset.
            </p>
          </CardHeader>
          <CardContent>
            {queryConfig && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">
                    Query configuration is active
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Base table: {queryConfig.baseTable.schema}.
                  {queryConfig.baseTable.table} ({queryConfig.columns.length}{" "}
                  columns selected)
                </p>
              </div>
            )}

            <VisualQueryBuilder
              initialConfig={queryConfig}
              onSave={handleQueryConfigSave}
              onCancel={() => setActiveTab("basic")}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
