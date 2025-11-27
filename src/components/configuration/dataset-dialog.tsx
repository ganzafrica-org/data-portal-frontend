"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";

interface DatasetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: any | null;
  categories: any[];
  onSuccess: () => void;
  isEditing: boolean;
}

export default function DatasetDialog({
  open,
  onOpenChange,
  dataset,
  categories,
  onSuccess,
  isEditing,
}: DatasetDialogProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    categoryId: "",
    hasAdminLevel: false,
    hasTransactionType: false,
    hasLandUse: false,
    hasSizeRange: false,
    hasUserLevel: false,
    requiresPeriod: false,
    requiresUpi: false,
    requiresUpiList: false,
    requiresIdList: false,
    fields: null,
    criteria: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dataset && open) {
      setFormData({
        name: dataset.name || "",
        description: dataset.description || "",
        categoryId: dataset.categoryId || "",
        hasAdminLevel: dataset.hasAdminLevel || false,
        hasTransactionType: dataset.hasTransactionType || false,
        hasLandUse: dataset.hasLandUse || false,
        hasSizeRange: dataset.hasSizeRange || false,
        hasUserLevel: dataset.hasUserLevel || false,
        requiresPeriod: dataset.requiresPeriod || false,
        requiresUpi: dataset.requiresUpi || false,
        requiresUpiList: dataset.requiresUpiList || false,
        requiresIdList: dataset.requiresIdList || false,
        fields: dataset.fields || null,
        criteria: dataset.criteria || null,
      });
    } else if (!dataset && open) {
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        hasAdminLevel: false,
        hasTransactionType: false,
        hasLandUse: false,
        hasSizeRange: false,
        hasUserLevel: false,
        requiresPeriod: false,
        requiresUpi: false,
        requiresUpiList: false,
        requiresIdList: false,
        fields: null,
        criteria: null,
      });
    }
  }, [dataset, open]);

  const handleSave = async () => {
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter a dataset name");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
      };

      if (isEditing && dataset) {
        await api.updateDataset(dataset.id, dataToSend);
        toast.success("Dataset updated successfully");
      } else {
        await api.createDataset(dataToSend);
        toast.success("Dataset created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Error saving dataset:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const requirementFields = [
    {
      key: "hasAdminLevel",
      label: "Administrative Level",
      description: "Requires selection of provinces, districts, sectors, etc.",
      color: "blue",
    },
    {
      key: "hasTransactionType",
      label: "Transaction Type",
      description: "Filter by transaction categories",
      color: "green",
    },
    {
      key: "hasLandUse",
      label: "Land Use Type",
      description: "Filter by land use classification",
      color: "teal",
    },
    {
      key: "hasSizeRange",
      label: "Size Range",
      description: "Filter by parcel size in hectares",
      color: "yellow",
    },
    {
      key: "hasUserLevel",
      label: "User Level",
      description: "Requires user ID for filtering",
      color: "indigo",
    },
    {
      key: "requiresPeriod",
      label: "Time Period",
      description: "Requires start and end date selection",
      color: "purple",
    },
    {
      key: "requiresUpi",
      label: "Single UPI",
      description: "Requires one UPI for shapefile generation",
      color: "orange",
    },
    {
      key: "requiresUpiList",
      label: "UPI List",
      description: "Multiple UPIs can be provided",
      color: "orange",
    },
    {
      key: "requiresIdList",
      label: "National ID List",
      description: "Multiple national IDs can be provided",
      color: "pink",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? "Edit Dataset" : "Create New Dataset"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update dataset configuration and requirements"
              : "Add a new dataset with filtering requirements and criteria"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Dataset Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Parcel Boundaries Shapefile"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this dataset contains and its purpose..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* Requirements Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Dataset Requirements
              </h3>
              <p className="text-sm text-gray-600">
                Select which filtering criteria are available for this dataset
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {requirementFields.map((field) => (
                <div
                  key={field.key}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                    formData[field.key]
                      ? `bg-${field.color}-50 border-${field.color}-200`
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <Switch
                    id={field.key}
                    checked={formData[field.key]}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, [field.key]: checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={field.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {field.label}
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {field.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {(formData.name ||
            Object.values(formData).some((v) => v === true)) && (
            <>
              <Separator />
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Summary</h4>
                {formData.name && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {formData.name}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Requirements enabled:</span>{" "}
                  {
                    Object.entries(formData).filter(
                      ([key, value]) =>
                        value === true &&
                        key.startsWith("has" || key.startsWith("requires")),
                    ).length
                  }{" "}
                  out of {requirementFields.length}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green hover:bg-green/90"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update" : "Create"} Dataset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
