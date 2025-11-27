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
import { Save } from "lucide-react";
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
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dataset) {
      setFormData(dataset);
    } else {
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
      });
    }
  }, [dataset, open]);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a dataset name");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && dataset) {
        await api.updateDataset(dataset.id, formData);
        toast.success("Dataset updated successfully");
      } else {
        await api.createDataset(formData);
        toast.success("Dataset created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Dataset" : "Add New Dataset"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update dataset configuration"
              : "Create a new dataset with requirements"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dataset Name *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter dataset name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.categoryId || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the dataset"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Dataset Requirements</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "hasAdminLevel", label: "Administrative Level" },
                { key: "hasTransactionType", label: "Transaction Type" },
                { key: "hasLandUse", label: "Land Use Type" },
                { key: "hasSizeRange", label: "Size Range" },
                { key: "hasUserLevel", label: "User Level" },
                { key: "requiresPeriod", label: "Time Period" },
                { key: "requiresUpi", label: "Single UPI" },
                { key: "requiresUpiList", label: "UPI List" },
                { key: "requiresIdList", label: "ID List" },
              ].map((requirement) => (
                <div key={requirement.key} className="flex items-center space-x-2">
                  <Switch
                    checked={formData[requirement.key] || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, [requirement.key]: checked })
                    }
                  />
                  <span className="text-sm">{requirement.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
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
