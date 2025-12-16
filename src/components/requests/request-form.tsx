"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Database,
  Filter,
  ChevronDown,
  ChevronRight,
  Info,
  Eye,
  Building,
  User,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { api, getErrorMessage, type Request } from "@/lib/api-config";
import {
  DATASET_CATEGORIES,
  TRANSACTION_TYPES,
  LAND_USE_TYPES,
} from "@/lib/dataset-config";
import DateRangePicker from "@/components/date-range-picker";
import AdministrativeLevelSelector from "@/components/administrative-level-selector";
import MultiSelectDropdown from "@/components/multi-select-dropdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DatasetSelection {
  id: string;
  category: string;
  type: string;
  criteria: Record<string, any>;
  isOpen: boolean;
  datasetId?: string; // Backend dataset ID
}

interface RequestFormProps {
  mode: "create" | "edit";
  requestId?: string;
  initialData?: Request;
}

interface FileWithCategory {
  file: File;
  category: "verification" | "research" | "authorization" | "other";
}

interface UploadingFile {
  name: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

const UpiBadge = ({ upi, onRemove }: { upi: string; onRemove: () => void }) => (
  <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
    {upi}
    <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
  </Badge>
);

const UpiInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string[];
  onChange: (upis: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addUpi = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeUpi = (upiToRemove: string) => {
    onChange(value.filter((upi) => upi !== upiToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addUpi();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const upis = pastedText
      .split(/[,\n\r]+/)
      .map((upi) => upi.trim())
      .filter((upi) => upi);
    const newUpis = upis.filter((upi) => !value.includes(upi));
    onChange([...value, ...newUpis]);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split("\n");
        const upis = lines
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("UPI"))
          .filter((upi) => !value.includes(upi));

        onChange([...value, ...upis]);
        toast.success(`Added ${upis.length} UPIs from CSV file`);
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={addUpi}
          size="sm"
          disabled={!inputValue.trim() || disabled}
        >
          Add
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="hidden"
          id="csv-upload"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("csv-upload")?.click()}
          disabled={disabled}
        >
          <Upload className="h-3 w-3 mr-1" />
          Upload CSV
        </Button>
        <span className="text-xs text-muted-foreground">
          or paste/type manually
        </span>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md min-h-[2.5rem]">
          {value.map((upi, index) => (
            <UpiBadge key={index} upi={upi} onRemove={() => removeUpi(upi)} />
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Enter UPIs manually, paste multiple UPIs, or upload a CSV file
      </p>
    </div>
  );
};

const DatasetPreview = ({ dataset }: { dataset: any }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!dataset?.fields) return null;

  const sampleData = [
    dataset.fields.reduce((acc: any, field: string, index: number) => {
      acc[field] = `Sample ${index + 1}`;
      return acc;
    }, {}),
    dataset.fields.reduce((acc: any, field: string, index: number) => {
      acc[field] = `Example ${index + 1}`;
      return acc;
    }, {}),
    dataset.fields.reduce((acc: any, field: string, index: number) => {
      acc[field] = `Data ${index + 1}`;
      return acc;
    }, {}),
  ];

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        {showPreview ? "Hide" : "Show"} Data Preview
      </Button>

      {showPreview && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <h5 className="font-medium text-sm mb-2">Sample Data Structure:</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {dataset.fields
                    .slice(0, 5)
                    .map((field: string, index: number) => (
                      <th
                        key={index}
                        className="border p-1 text-left font-medium"
                      >
                        {field}
                      </th>
                    ))}
                  {dataset.fields.length > 5 && (
                    <th className="border p-1 text-left">...</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {dataset.fields
                      .slice(0, 5)
                      .map((field: string, colIndex: number) => (
                        <td key={colIndex} className="border p-1 text-gray-600">
                          {row[field]}
                        </td>
                      ))}
                    {dataset.fields.length > 5 && (
                      <td className="border p-1 text-gray-400">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataset.fields.length > 5 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing first 5 of {dataset.fields.length} columns
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default function RequestForm({
  mode,
  requestId: initialRequestId,
  initialData,
}: RequestFormProps) {
  const { user, getUserDisplayInfo, getRequiredDocuments } = useAuth();
  const router = useRouter();

  const [requestId, setRequestId] = useState<string | undefined>(
    initialRequestId,
  );
  const [status, setStatus] = useState<Request["status"]>(
    initialData?.status || "draft",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: (initialData?.priority || "normal") as
      | "low"
      | "normal"
      | "high"
      | "urgent",
  });

  const [datasetSelections, setDatasetSelections] = useState<
    DatasetSelection[]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithCategory[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<RequestDocument[]>(
    [],
  );
  const [adminNotes, setAdminNotes] = useState<string | null>(
    initialData?.adminNotes || null,
  );
  const [datasetCategories, setDatasetCategories] = useState<any[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);

  // Conditional rendering logic
  const isDraftCreated = !!requestId || !!initialData?.id;
  const canEdit =
    status === "draft" ||
    status === "changes_requested" ||
    (mode === "create" && !status);

  if (!user) return null;

  const userInfo = getUserDisplayInfo();
  const requiredDocuments = getRequiredDocuments();

  const getAvailableDatasets = () => {
    // Use API data if available, otherwise fall back to hardcoded data
    const sourceData =
      datasetCategories.length > 0
        ? datasetCategories
        : Object.entries(DATASET_CATEGORIES).map(([key, category]) => ({
            id: key,
            ...category,
          }));

    // Filter datasets based on user role
    const filteredCategories = sourceData
      .map((category: any) => {
        const filteredDatasets = category.datasets.filter((dataset: any) => {
          // For external users, filter out internal/admin-only datasets
          if (user.role === "external") {
            return (
              !dataset.id.includes("internal-") &&
              !dataset.id.includes("admin-")
            );
          }
          return true;
        });

        return {
          ...category,
          datasets: filteredDatasets,
        };
      })
      .filter((category: any) => category.datasets.length > 0);

    // Convert to object keyed by category id for backward compatibility
    return filteredCategories.reduce((acc: any, category: any) => {
      acc[category.id] = category;
      return acc;
    }, {});
  };

  const availableDatasets = getAvailableDatasets();

  // Load dataset categories from API
  useEffect(() => {
    const loadDatasetCategories = async () => {
      try {
        setIsLoadingDatasets(true);
        const categories = await api.getDatasetCategories({
          includeInactive: false,
        });

        // Filter out deactivated categories and datasets
        const activeCategories = categories
          .filter((cat: any) => !cat.deactivatedAt)
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder,
            datasets: cat.datasets
              .filter((ds: any) => !ds.deactivatedAt)
              .map((ds: any) => ({
                id: ds.id,
                name: ds.name,
                description: ds.description || "",
                requiresPeriod: ds.requiresPeriod,
                requiresUpiList: ds.requiresUpiList,
                requiresIdList: ds.requiresIdList,
                requiresUpi: ds.requiresUpi,
                hasAdminLevel: ds.hasAdminLevel,
                hasUserLevel: ds.hasUserLevel,
                hasTransactionType: ds.hasTransactionType,
                hasLandUse: ds.hasLandUse,
                hasSizeRange: ds.hasSizeRange,
                fields: ds.fields,
                criteria: ds.criteria,
              })),
          }))
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

        setDatasetCategories(activeCategories);
      } catch (error) {
        console.error("Failed to load dataset categories:", error);
        toast.error("Failed to load datasets. Using offline data.");
        // Fallback to hardcoded data if API fails
        setDatasetCategories(
          Object.entries(DATASET_CATEGORIES).map(([key, category]) => ({
            id: key,
            name: category.name,
            icon: category.icon,
            description: category.description,
            datasets: category.datasets,
          })),
        );
      } finally {
        setIsLoadingDatasets(false);
      }
    };
    loadDatasetCategories();
  }, []);

  // Load existing documents when editing
  useEffect(() => {
    if (requestId && mode === "edit") {
      const loadDocuments = async () => {
        try {
          const docs = await api.getRequestDocuments(requestId);
          setUploadedDocuments(docs);
        } catch (error) {
          console.error("Failed to load documents:", error);
        }
      };
      loadDocuments();
    }
  }, [requestId, mode]);

  // Auto-save draft on changes (debounced)
  const saveDraftTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSaveDraft = useCallback(async () => {
    if (requestId && status === "draft" && canEdit && isDraftCreated) {
      try {
        setIsSaving(true);
        await api.updateDraftRequest(requestId, formData);
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [requestId, status, canEdit, isDraftCreated, formData]);

  useEffect(() => {
    if (requestId && status === "draft" && canEdit) {
      // Clear existing timeout
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveDraftTimeoutRef.current = setTimeout(() => {
        debouncedSaveDraft();
      }, 2000);

      // Cleanup on unmount or dependency change
      return () => {
        if (saveDraftTimeoutRef.current) {
          clearTimeout(saveDraftTimeoutRef.current);
        }
      };
    }
  }, [formData, requestId, status, canEdit, debouncedSaveDraft]);

  // Step 1: Create Draft (only basic info)
  const handleCreateDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your request");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description for your request");
      return;
    }

    try {
      setIsSubmitting(true);
      const draft = await api.createDraftRequest({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      });

      setRequestId(draft.id);
      setStatus("draft");
      router.replace(`/requests/new?id=${draft.id}`);

      toast.success("Draft saved! Now configure your datasets.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDatasetSelection = () => {
    const newSelection: DatasetSelection = {
      id: Date.now().toString(),
      category: "",
      type: "",
      criteria: {},
      isOpen: true,
    };

    const updatedSelections = datasetSelections.map((selection) => ({
      ...selection,
      isOpen: false,
    }));

    setDatasetSelections([...updatedSelections, newSelection]);
  };

  const removeDatasetSelection = async (id: string, datasetId?: string) => {
    // If dataset already saved to backend, delete it
    if (datasetId && requestId) {
      try {
        await api.removeDatasetFromRequest(requestId, datasetId);
        toast.success("Dataset removed");
      } catch (error) {
        toast.error(getErrorMessage(error));
        return;
      }
    }
    setDatasetSelections(
      datasetSelections.filter((selection) => selection.id !== id),
    );
  };

  const updateDatasetSelection = (id: string, field: string, value: any) => {
    setDatasetSelections((selections) =>
      selections.map((selection) =>
        selection.id === id
          ? {
              ...selection,
              [field]: value,
              ...(field === "category" ? { type: "", criteria: {} } : {}),
            }
          : selection,
      ),
    );
  };

  const toggleDatasetOpen = (id: string) => {
    setDatasetSelections((selections) =>
      selections.map((selection) => ({
        ...selection,
        isOpen: selection.id === id ? !selection.isOpen : false,
      })),
    );
  };

  const updateDatasetCriteria = (
    selectionId: string,
    criterion: string,
    value: any,
  ) => {
    setDatasetSelections((selections) =>
      selections.map((selection) =>
        selection.id === selectionId
          ? {
              ...selection,
              criteria: { ...selection.criteria, [criterion]: value },
            }
          : selection,
      ),
    );
  };

  // Save dataset to backend when configuration is complete
  const saveDatasetToBackend = async (selection: DatasetSelection) => {
    if (!requestId || !selection.type) return;

    const category =
      availableDatasets[selection.category as keyof typeof availableDatasets];
    const dataset = category?.datasets.find((d) => d.id === selection.type);

    if (!dataset) return;

    try {
      const criteria: any = {
        datasetId: selection.type,
      };

      if (selection.criteria.dateRange?.from) {
        criteria.dateRangeFrom =
          selection.criteria.dateRange.from.toISOString();
        if (selection.criteria.dateRange.to) {
          criteria.dateRangeTo = selection.criteria.dateRange.to.toISOString();
        }
      }

      if (selection.criteria.upiList?.length > 0) {
        criteria.upiList = selection.criteria.upiList;
      }

      if (selection.criteria.idList?.length > 0) {
        criteria.idList = selection.criteria.idList;
      }

      if (selection.criteria.transactionTypes?.length > 0) {
        criteria.transactionTypes = selection.criteria.transactionTypes;
      }

      if (selection.criteria.landUseTypes?.length > 0) {
        criteria.landUseTypes = selection.criteria.landUseTypes;
      }

      if (selection.criteria.minSize) {
        criteria.sizeRangeMin = parseFloat(selection.criteria.minSize);
      }

      if (selection.criteria.maxSize) {
        criteria.sizeRangeMax = parseFloat(selection.criteria.maxSize);
      }

      if (selection.criteria.administrativeSelection) {
        criteria.administrativeLevel =
          selection.criteria.administrativeSelection;
      }

      const savedDataset = await api.addDatasetToRequest(requestId, criteria);

      // Update local state with backend ID
      setDatasetSelections((selections) =>
        selections.map((s) =>
          s.id === selection.id ? { ...s, datasetId: savedDataset.id } : s,
        ),
      );

      toast.success("Dataset configuration saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const renderDatasetCategoryCard = (
    selection: DatasetSelection,
    index: number,
  ) => {
    const category =
      availableDatasets[selection.category as keyof typeof availableDatasets];
    const dataset = category?.datasets.find((d) => d.id === selection.type);

    return (
      <Card
        key={selection.id}
        className="relative border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors"
      >
        <Collapsible
          open={selection.isOpen}
          onOpenChange={() => toggleDatasetOpen(selection.id)}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Database className="h-5 w-5 mr-2 text-primary" />
                  Dataset {index + 1}
                  {selection.isOpen ? (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDatasetSelection(selection.id, selection.datasetId);
                  }}
                  disabled={!canEdit}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {category && (
                <CardDescription className="flex items-center">
                  <span className="text-lg mr-2">{category.icon}</span>
                  {category.description}
                </CardDescription>
              )}
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Category *</Label>
                  <Select
                    value={selection.category}
                    onValueChange={(value) =>
                      updateDatasetSelection(selection.id, "category", value)
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a data category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableDatasets).map(
                        ([key, category]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              <span className="mr-2">{category.icon}</span>
                              {category.name}
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Specific Dataset *</Label>
                    {dataset && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-medium">{dataset.name}</p>
                              <p className="text-sm">{dataset.description}</p>
                              {dataset.fields && (
                                <div>
                                  <p className="text-sm font-medium">
                                    Available Fields:
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {dataset.fields.slice(0, 5).join(", ")}
                                    {dataset.fields.length > 5 &&
                                      ` and ${dataset.fields.length - 5} more...`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Select
                    value={selection.type}
                    onValueChange={(value) => {
                      updateDatasetSelection(selection.id, "type", value);
                    }}
                    disabled={!selection.category || !canEdit}
                  >
                    <SelectTrigger className="max-w-64 overflow-x-clip">
                      <SelectValue placeholder="Select specific dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {selection.category &&
                        availableDatasets[
                          selection.category as keyof typeof availableDatasets
                        ]?.datasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            <div>
                              <div className="font-medium">{dataset.name}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {dataset.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {dataset && <DatasetPreview dataset={dataset} />}

              {dataset && (
                <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-primary" />
                    <h4 className="font-medium text-gray-900">
                      Dataset Configuration
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dataset.hasAdminLevel && (
                      <div className="md:col-span-2">
                        <AdministrativeLevelSelector
                          value={
                            selection.criteria.administrativeSelection || {
                              provinces: [],
                              districts: [],
                              sectors: [],
                              cells: [],
                              villages: [],
                            }
                          }
                          onChange={(adminSelection) =>
                            updateDatasetCriteria(
                              selection.id,
                              "administrativeSelection",
                              adminSelection,
                            )
                          }
                          disabled={!canEdit}
                        />
                      </div>
                    )}

                    {dataset.hasTransactionType && (
                      <div className="space-y-2">
                        <Label>Transaction Types</Label>
                        <MultiSelectDropdown
                          options={TRANSACTION_TYPES}
                          selectedValues={
                            selection.criteria.transactionTypes || []
                          }
                          onSelectionChange={(selected) =>
                            updateDatasetCriteria(
                              selection.id,
                              "transactionTypes",
                              selected,
                            )
                          }
                          placeholder="Select transaction types"
                          disabled={!canEdit}
                        />
                      </div>
                    )}

                    {dataset.hasLandUse && (
                      <div className="space-y-2">
                        <Label>Land Use Types</Label>
                        <MultiSelectDropdown
                          options={LAND_USE_TYPES}
                          selectedValues={selection.criteria.landUseTypes || []}
                          onSelectionChange={(selected) =>
                            updateDatasetCriteria(
                              selection.id,
                              "landUseTypes",
                              selected,
                            )
                          }
                          placeholder="Select land use types"
                          disabled={!canEdit}
                        />
                      </div>
                    )}

                    {dataset.hasSizeRange && (
                      <div className="space-y-2">
                        <Label>Size Range (hectares)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={selection.criteria.minSize || ""}
                            onChange={(e) =>
                              updateDatasetCriteria(
                                selection.id,
                                "minSize",
                                e.target.value,
                              )
                            }
                            placeholder="Min size"
                            disabled={!canEdit}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={selection.criteria.maxSize || ""}
                            onChange={(e) =>
                              updateDatasetCriteria(
                                selection.id,
                                "maxSize",
                                e.target.value,
                              )
                            }
                            placeholder="Max size"
                            disabled={!canEdit}
                          />
                        </div>
                      </div>
                    )}

                    {dataset.hasUserLevel && (
                      <div className="space-y-2">
                        <Label>User ID *</Label>
                        <Input
                          value={selection.criteria.userId || ""}
                          onChange={(e) =>
                            updateDatasetCriteria(
                              selection.id,
                              "userId",
                              e.target.value,
                            )
                          }
                          placeholder="Enter user ID"
                          disabled={!canEdit}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {dataset.requiresPeriod && (
                      <div className="space-y-2">
                        <Label>
                          Date Period <span className="text-red-500">*</span>
                        </Label>
                        <DateRangePicker
                          dateRange={selection.criteria.dateRange}
                          onDateRangeChange={(range) =>
                            updateDatasetCriteria(
                              selection.id,
                              "dateRange",
                              range,
                            )
                          }
                          disabled={!canEdit}
                        />
                      </div>
                    )}

                    {(dataset.requiresUpi || dataset.requiresUpiList) && (
                      <div className="space-y-2">
                        <Label>
                          UPI List <span className="text-red-500">*</span>
                        </Label>
                        <UpiInput
                          value={selection.criteria.upiList || []}
                          onChange={(upis) =>
                            updateDatasetCriteria(selection.id, "upiList", upis)
                          }
                          placeholder="Enter UPI (e.g., 3/01/11/01/88)"
                          disabled={!canEdit}
                        />
                        {dataset.requiresUpi && (
                          <p className="text-sm text-muted-foreground">
                            At least one UPI is required
                          </p>
                        )}
                      </div>
                    )}

                    {dataset.requiresIdList && (
                      <div className="space-y-2">
                        <Label>
                          National ID List{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <UpiInput
                          value={selection.criteria.idList || []}
                          onChange={(ids) =>
                            updateDatasetCriteria(selection.id, "idList", ids)
                          }
                          placeholder="Enter National ID"
                          disabled={!canEdit}
                        />
                        <p className="text-sm text-muted-foreground">
                          Upload a CSV file with IDs or enter them manually
                        </p>
                      </div>
                    )}
                  </div>

                  {canEdit &&
                    isDraftCreated &&
                    selection.type &&
                    !selection.datasetId && (
                      <Button
                        type="button"
                        onClick={() => saveDatasetToBackend(selection)}
                        variant="outline"
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Dataset Configuration
                      </Button>
                    )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const handleFileUpload = async (
    file: File,
    category: "verification" | "research" | "authorization" | "other",
  ) => {
    if (!requestId) {
      toast.error("Please save the basic information first");
      return;
    }

    // Add to uploading files
    const uploadingFile: UploadingFile = {
      name: file.name,
      progress: 0,
      status: "uploading",
    };

    setUploadingFiles((prev) => [...prev, uploadingFile]);

    try {
      // Simulate progress (in real implementation, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.name === file.name && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f,
          ),
        );
      }, 200);

      const uploadedDoc = await api.uploadDocumentToRequest(
        requestId,
        file,
        category,
      );

      clearInterval(progressInterval);

      // Mark as success
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.name === file.name ? { ...f, progress: 100, status: "success" } : f,
        ),
      );

      // Add to uploaded documents
      setUploadedDocuments((prev) => [...prev, uploadedDoc]);

      // Remove from uploading after a short delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
      }, 1000);

      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: "error", error: getErrorMessage(error) }
            : f,
        ),
      );
      toast.error(`Failed to upload ${file.name}: ${getErrorMessage(error)}`);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await api.deleteDocument(documentId);
      setUploadedDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentId),
      );
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
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

    if (datasetSelections.length === 0) {
      toast.error("Please add at least one dataset");
      return false;
    }

    for (const selection of datasetSelections) {
      if (!selection.category || !selection.type) {
        toast.error("Please complete all dataset selections");
        return false;
      }

      if (!selection.datasetId) {
        toast.error("Please save all dataset configurations before submitting");
        return false;
      }

      const category =
        availableDatasets[selection.category as keyof typeof availableDatasets];
      const dataset = category?.datasets.find((d) => d.id === selection.type);

      if (
        dataset?.hasAdminLevel &&
        !selection.criteria.administrativeSelection?.provinces?.length
      ) {
        toast.error("Please select administrative level for all datasets");
        return false;
      }

      if (dataset?.requiresPeriod && !selection.criteria.dateRange) {
        toast.error(
          "Please select date range for all datasets that require it",
        );
        return false;
      }

      if (
        (dataset?.requiresUpi || dataset?.requiresUpiList) &&
        (!selection.criteria.upiList || selection.criteria.upiList.length === 0)
      ) {
        toast.error(
          "Please provide at least one UPI for datasets that require it",
        );
        return false;
      }

      if (
        dataset?.requiresIdList &&
        (!selection.criteria.idList || selection.criteria.idList.length === 0)
      ) {
        toast.error(
          "Please provide at least one National ID for datasets that require it",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !requestId) return;

    try {
      setIsSubmitting(true);
      await api.submitRequest(requestId);

      toast.success("Request submitted for review!");
      router.push(`/requests/${requestId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!validateForm() || !requestId) return;

    try {
      setIsSubmitting(true);
      await api.resubmitRequest(requestId);

      toast.success("Request resubmitted for review!");
      router.push(`/requests/${requestId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {mode === "create"
              ? "Create New Data Request"
              : "Edit Data Request"}
          </h1>
          <p className="text-gray-600">
            {mode === "create"
              ? "Submit a request to access land administration data with specific criteria"
              : "Update your data request details and configuration"}
          </p>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="h-4 w-4 animate-pulse" />
            Saving...
          </div>
        )}
      </div>

      {/* Status Badge */}
      {isDraftCreated && (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              status === "draft"
                ? "secondary"
                : status === "changes_requested"
                  ? "destructive"
                  : "default"
            }
          >
            {status === "draft" && "Draft"}
            {status === "pending" && "Pending Review"}
            {status === "in_review" && "In Review"}
            {status === "changes_requested" && "Changes Requested"}
            {status === "approved" && "Approved"}
            {status === "rejected" && "Rejected"}
          </Badge>
        </div>
      )}

      {/* Changes Requested Alert */}
      {status === "changes_requested" && adminNotes && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Changes Requested</AlertTitle>
          <AlertDescription>{adminNotes}</AlertDescription>
        </Alert>
      )}

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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide basic details about your data request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Request Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Land Use Analysis for Kigali District"
              required
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
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
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, priority: value }))
              }
              disabled={!canEdit}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Standard processing</SelectItem>
                <SelectItem value="normal">
                  Normal - Regular timeline
                </SelectItem>
                <SelectItem value="high">High - Expedited review</SelectItem>
                <SelectItem value="urgent">
                  Urgent - Immediate attention needed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isDraftCreated && (
            <Button
              onClick={handleCreateDraft}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Draft...
                </>
              ) : (
                "Save & Continue to Datasets"
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dataset Selection */}
      {isDraftCreated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Dataset Selection
            </CardTitle>
            <CardDescription>
              Choose the specific datasets you need and configure their
              parameters. Available datasets are filtered based on your user
              type and access permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {datasetSelections.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No datasets selected
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first dataset to the request.
                </p>
                <Button
                  type="button"
                  onClick={addDatasetSelection}
                  className="inline-flex items-center"
                  disabled={!canEdit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Dataset
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {datasetSelections.map((selection, index) =>
                  renderDatasetCategoryCard(selection, index),
                )}

                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDatasetSelection}
                    className="w-full border-dashed border-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Dataset
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supporting Documents */}
      {isDraftCreated && (
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>
              Upload required documents to support your request based on your
              user type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Required Documents for {userInfo.typeLabel}
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {requiredDocuments.map((doc, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-blue-800 flex items-center"
                      >
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="flex-1">{doc.text}</span>
                        {doc.required && (
                          <Badge className="bg-red-100 text-red-800 text-xs ml-2">
                            Required
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="space-y-4">
                <Label>Upload Documents</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      value: "verification" as const,
                      label: "Verification Documents",
                      description: "ID, Passport, Organization License",
                    },
                    {
                      value: "research" as const,
                      label: "Research Documents",
                      description: "Research Proposal, Methodology",
                    },
                    {
                      value: "authorization" as const,
                      label: "Authorization Documents",
                      description: "Authorization Letters, Approvals",
                    },
                    {
                      value: "other" as const,
                      label: "Other Documents",
                      description: "Additional Supporting Documents",
                    },
                  ].map((category) => (
                    <div
                      key={category.value}
                      className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">
                        {category.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, category.value);
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                        id={`file-upload-${category.value}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`file-upload-${category.value}`)
                            ?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploading Files Progress */}
            {uploadingFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploading...</Label>
                {uploadingFiles.map((file) => (
                  <div
                    key={file.name}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {file.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          file.status === "success"
                            ? "bg-green-600"
                            : file.status === "error"
                              ? "bg-red-600"
                              : "bg-blue-600"
                        }`}
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                    {file.status === "error" && file.error && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.originalFilename}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {doc.category}
                            </Badge>
                            {doc.isVerified && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {doc.fileSize && (
                              <span className="text-xs text-muted-foreground">
                                {(doc.fileSize / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Actions */}
      {isDraftCreated && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "draft" && canEdit && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Review your request before submitting. Once submitted, you
                    won't be able to edit until reviewed by our team.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/requests")}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Save & Exit
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || datasetSelections.length === 0}
                    className="w-full sm:w-auto bg-green hover:bg-green/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {status === "changes_requested" && canEdit && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Make the requested changes and resubmit your request for
                    review.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/requests")}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Save & Exit
                  </Button>
                  <Button
                    onClick={handleResubmit}
                    disabled={isSubmitting || datasetSelections.length === 0}
                    className="w-full sm:w-auto bg-green hover:bg-green/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Resubmitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Resubmit for Review
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {!canEdit && status !== "draft" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This request is currently being reviewed and cannot be edited.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
