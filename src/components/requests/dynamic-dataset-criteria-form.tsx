"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  Calendar,
  Filter as FilterIcon,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api-config";
import { DatasetCriteria, DatasetCriteriaResponse } from "@/lib/data";
import DateRangePicker from "@/components/date-range-picker";

interface DynamicDatasetCriteriaFormProps {
  datasetId: string;
  datasetName: string;
  onCriteriaChange: (criteriaValues: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export default function DynamicDatasetCriteriaForm({
  datasetId,
  datasetName,
  onCriteriaChange,
  initialValues = {},
}: DynamicDatasetCriteriaFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [criteriaConfig, setCriteriaConfig] =
    useState<DatasetCriteriaResponse | null>(null);
  const [criteriaValues, setCriteriaValues] =
    useState<Record<string, any>>(initialValues);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    loadDatasetCriteria();
  }, [datasetId]);

  useEffect(() => {
    onCriteriaChange(criteriaValues);
  }, [criteriaValues]);

  const loadDatasetCriteria = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDatasetCriteria(datasetId);
      setCriteriaConfig(data);
    } catch (error) {
      toast.error(`Failed to load dataset criteria: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewData = async () => {
    try {
      setIsLoadingPreview(true);
      setPreviewError(null);

      const response = await api.previewDataset(datasetId, criteriaValues);
      setPreviewData(response);
      setShowPreview(true);

      toast.success(`Preview loaded: ${response.totalRows} total rows found`);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setPreviewError(errorMsg);
      toast.error(`Preview failed: ${errorMsg}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCriteriaValueChange = (key: string, value: any) => {
    setCriteriaValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Hide preview when criteria changes
    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const renderCriteriaInput = (criteria: DatasetCriteria) => {
    const value = criteriaValues[criteria.key];

    switch (criteria.type) {
      case "dateRange":
        return (
          <div key={criteria.key} className="space-y-2">
            <Label>
              {criteria.label}
              {criteria.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            {criteria.description && (
              <p className="text-xs text-gray-500">{criteria.description}</p>
            )}
            <DateRangePicker
              dateRange={value}
              onDateRangeChange={(dateRange) =>
                handleCriteriaValueChange(criteria.key, dateRange)
              }
            />
          </div>
        );

      case "multiSelect":
        return (
          <div key={criteria.key} className="space-y-2">
            <Label>
              {criteria.label}
              {criteria.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            {criteria.description && (
              <p className="text-xs text-gray-500">{criteria.description}</p>
            )}
            <div className="space-y-2">
              {criteria.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${criteria.key}-${option.value}`}
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(
                            (v: string) => v !== option.value,
                          );
                      handleCriteriaValueChange(criteria.key, newValues);
                    }}
                  />
                  <Label
                    htmlFor={`${criteria.key}-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "range":
        return (
          <div key={criteria.key} className="space-y-2">
            <Label>
              {criteria.label}
              {criteria.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            {criteria.description && (
              <p className="text-xs text-gray-500">{criteria.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Minimum</Label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={value?.min || ""}
                  onChange={(e) =>
                    handleCriteriaValueChange(criteria.key, {
                      ...value,
                      min: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Maximum</Label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={value?.max || ""}
                  onChange={(e) =>
                    handleCriteriaValueChange(criteria.key, {
                      ...value,
                      max: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div key={criteria.key} className="space-y-2">
            <Label>
              {criteria.label}
              {criteria.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            {criteria.description && (
              <p className="text-xs text-gray-500">{criteria.description}</p>
            )}
            <Input
              type="text"
              placeholder={criteria.label}
              value={value || ""}
              onChange={(e) =>
                handleCriteriaValueChange(criteria.key, e.target.value)
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  const canPreview = () => {
    if (!criteriaConfig) return false;

    // Check if all required criteria have values
    return criteriaConfig.criteria.every((criteria) => {
      if (!criteria.required) return true;

      const value = criteriaValues[criteria.key];

      if (criteria.type === "dateRange") {
        return value?.from && value?.to;
      }

      if (criteria.type === "multiSelect") {
        return Array.isArray(value) && value.length > 0;
      }

      if (criteria.type === "range") {
        return value?.min || value?.max;
      }

      if (criteria.type === "text") {
        return value && value.trim().length > 0;
      }

      return false;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!criteriaConfig) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dataset criteria configuration.
        </AlertDescription>
      </Alert>
    );
  }

  if (criteriaConfig.criteria.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This dataset does not require any specific criteria. You can proceed
          to submit your request.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-blue-600" />
            Dataset Criteria
          </CardTitle>
          <CardDescription>
            Configure the filters for {datasetName}. Fields marked with * are
            required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteriaConfig.criteria.map((criteria) =>
            renderCriteriaInput(criteria),
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={handlePreviewData}
              disabled={!canPreview() || isLoadingPreview}
              variant="outline"
              className="w-full"
            >
              {isLoadingPreview ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Preview...
                </>
              ) : showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Data (5 sample rows)
                </>
              )}
            </Button>
            {!canPreview() && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please fill in all required criteria to enable preview
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {previewError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Preview Error:</div>
            {previewError}
          </AlertDescription>
        </Alert>
      )}

      {showPreview && previewData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Data Preview
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <strong>{previewData.totalRows}</strong> total rows match your
                criteria
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Execution: {previewData.executionTime}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {previewData.message ||
                  `Showing 5 sample rows out of ${previewData.totalRows} total rows`}
              </AlertDescription>
            </Alert>

            <ScrollArea className="h-96 w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.columnNames?.map(
                      (col: string, idx: number) => (
                        <TableHead
                          key={idx}
                          className="text-xs font-semibold whitespace-nowrap"
                        >
                          {col}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.previewRows?.length > 0 ? (
                    previewData.previewRows.map((row: any, rowIdx: number) => (
                      <TableRow key={rowIdx}>
                        {Object.values(row).map(
                          (value: any, colIdx: number) => (
                            <TableCell
                              key={colIdx}
                              className="text-xs whitespace-nowrap"
                            >
                              {value !== null && value !== undefined ? (
                                String(value)
                              ) : (
                                <span className="text-gray-400 italic">
                                  NULL
                                </span>
                              )}
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={previewData.columnNames?.length || 1}
                        className="text-center text-gray-500"
                      >
                        No data found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {previewData.totalRows > 5 && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a preview showing only 5 rows. Upon approval, you will
                  receive all <strong>{previewData.totalRows}</strong> rows in
                  your data export.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
