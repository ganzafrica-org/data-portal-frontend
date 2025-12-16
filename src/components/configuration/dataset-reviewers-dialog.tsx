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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import {
  api,
  getErrorMessage,
  DatasetReviewerAssignment,
  ReviewerUser,
  ProvinceLevel,
  DistrictLevel,
  SectorLevel,
  CellLevel,
  VillageLevel,
} from "@/lib/api-config";

interface DatasetReviewersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  datasetName: string;
  onSuccess?: () => void;
}

interface ReviewerAssignmentForm {
  id?: string;
  reviewerUserId: string;
  reviewLevel: number;
  reviewOrder: number;
  provinceId: string | null;
  districtId: string | null;
  sectorId: string | null;
  cellId: string | null;
  villageId: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export default function DatasetReviewersDialog({
  open,
  onOpenChange,
  datasetId,
  datasetName,
  onSuccess,
}: DatasetReviewersDialogProps) {
  const [assignments, setAssignments] = useState<ReviewerAssignmentForm[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<
    DatasetReviewerAssignment[]
  >([]);
  const [reviewers, setReviewers] = useState<ReviewerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewerSearchQuery, setReviewerSearchQuery] = useState<{
    [key: number]: string;
  }>({});

  // Administrative levels data
  const [provinces, setProvinces] = useState<ProvinceLevel[]>([]);
  const [districts, setDistricts] = useState<{
    [provinceCode: string]: DistrictLevel[];
  }>({});
  const [sectors, setSectors] = useState<{
    [districtCode: string]: SectorLevel[];
  }>({});
  const [cells, setCells] = useState<{
    [sectorCode: string]: CellLevel[];
  }>({});
  const [villages, setVillages] = useState<{
    [cellCode: string]: VillageLevel[];
  }>({});

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, datasetId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reviewersData, assignmentsData] = await Promise.all([
        api.getAllReviewers(),
        api.getDatasetReviewers(datasetId),
      ]);

      setReviewers(reviewersData);
      setExistingAssignments(assignmentsData);

      // Convert existing assignments to form data
      const formAssignments = assignmentsData.map((a) => ({
        id: a.id,
        reviewerUserId: a.reviewerUserId,
        reviewLevel: a.reviewLevel,
        reviewOrder: a.reviewOrder,
        provinceId: a.provinceId,
        districtId: a.districtId,
        sectorId: a.sectorId,
        cellId: a.cellId,
        villageId: a.villageId,
        isPrimary: a.isPrimary,
        isActive: a.isActive,
      }));

      setAssignments(formAssignments);
    } catch (error) {
      console.error("Failed to load reviewers:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await api.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  // Helper to fetch districts for a province
  const fetchDistrictsForProvince = async (provinceCode: string) => {
    if (districts[provinceCode]) return; // Already loaded
    try {
      const districtsData = await api.getDistricts(provinceCode);
      setDistricts((prev) => ({ ...prev, [provinceCode]: districtsData }));
    } catch (error) {
      console.error(`Failed to load districts for ${provinceCode}:`, error);
    }
  };

  // Helper to fetch sectors for a district
  const fetchSectorsForDistrict = async (districtCode: string) => {
    if (sectors[districtCode]) return; // Already loaded
    try {
      const sectorsData = await api.getSectors(districtCode);
      setSectors((prev) => ({ ...prev, [districtCode]: sectorsData }));
    } catch (error) {
      console.error(`Failed to load sectors for ${districtCode}:`, error);
    }
  };

  // Helper to fetch cells for a sector
  const fetchCellsForSector = async (sectorCode: string) => {
    if (cells[sectorCode]) return; // Already loaded
    try {
      const cellsData = await api.getCells(sectorCode);
      setCells((prev) => ({ ...prev, [sectorCode]: cellsData }));
    } catch (error) {
      console.error(`Failed to load cells for ${sectorCode}:`, error);
    }
  };

  // Helper to fetch villages for a cell
  const fetchVillagesForCell = async (cellCode: string) => {
    if (villages[cellCode]) return; // Already loaded
    try {
      const villagesData = await api.getVillages(cellCode);
      setVillages((prev) => ({ ...prev, [cellCode]: villagesData }));
    } catch (error) {
      console.error(`Failed to load villages for ${cellCode}:`, error);
    }
  };

  const getFilteredReviewers = (index: number) => {
    const query = reviewerSearchQuery[index]?.toLowerCase() || "";
    if (!query) return reviewers;

    return reviewers.filter(
      (reviewer) =>
        reviewer.name.toLowerCase().includes(query) ||
        reviewer.email.toLowerCase().includes(query),
    );
  };

  const addAssignment = () => {
    const maxLevel =
      assignments.length > 0
        ? Math.max(...assignments.map((a) => a.reviewLevel))
        : 0;

    setAssignments([
      ...assignments,
      {
        reviewerUserId: "",
        reviewLevel: maxLevel + 1,
        reviewOrder: 1,
        provinceId: null,
        districtId: null,
        sectorId: null,
        cellId: null,
        villageId: null,
        isPrimary: false,
        isActive: true,
      },
    ]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const updateAssignment = (
    index: number,
    field: keyof ReviewerAssignmentForm,
    value: any,
  ) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: value };
    setAssignments(updated);
  };

  // Handle administrative level changes with cascading reset
  const handleAdminLevelChange = async (
    index: number,
    level: "province" | "district" | "sector" | "cell" | "village",
    value: string,
  ) => {
    const updated = [...assignments];

    if (level === "province") {
      if (value === "all") {
        updated[index] = {
          ...updated[index],
          provinceId: null,
          districtId: null,
          sectorId: null,
          cellId: null,
          villageId: null,
        };
      } else {
        updated[index] = {
          ...updated[index],
          provinceId: value,
          districtId: null,
          sectorId: null,
          cellId: null,
          villageId: null,
        };
        // Fetch districts for this province
        const province = provinces.find((p) => p.id === value);
        if (province) await fetchDistrictsForProvince(province.provinceCode);
      }
    } else if (level === "district") {
      if (value === "all") {
        updated[index] = {
          ...updated[index],
          districtId: null,
          sectorId: null,
          cellId: null,
          villageId: null,
        };
      } else {
        updated[index] = {
          ...updated[index],
          districtId: value,
          sectorId: null,
          cellId: null,
          villageId: null,
        };
        // Fetch sectors for this district
        const allDistricts = Object.values(districts).flat();
        const district = allDistricts.find((d) => d.id === value);
        if (district) await fetchSectorsForDistrict(district.districtCode);
      }
    } else if (level === "sector") {
      if (value === "all") {
        updated[index] = {
          ...updated[index],
          sectorId: null,
          cellId: null,
          villageId: null,
        };
      } else {
        updated[index] = {
          ...updated[index],
          sectorId: value,
          cellId: null,
          villageId: null,
        };
        // Fetch cells for this sector
        const allSectors = Object.values(sectors).flat();
        const sector = allSectors.find((s) => s.id === value);
        if (sector) await fetchCellsForSector(sector.sectorCode);
      }
    } else if (level === "cell") {
      if (value === "all") {
        updated[index] = {
          ...updated[index],
          cellId: null,
          villageId: null,
        };
      } else {
        updated[index] = {
          ...updated[index],
          cellId: value,
          villageId: null,
        };
        // Fetch villages for this cell
        const allCells = Object.values(cells).flat();
        const cell = allCells.find((c) => c.id === value);
        if (cell) await fetchVillagesForCell(cell.cellCode);
      }
    } else if (level === "village") {
      if (value === "all") {
        updated[index] = {
          ...updated[index],
          villageId: null,
        };
      } else {
        updated[index] = {
          ...updated[index],
          villageId: value,
        };
      }
    }

    setAssignments(updated);
  };

  // Get available administrative levels for dropdowns
  const getAvailableDistricts = (assignment: ReviewerAssignmentForm) => {
    if (!assignment.provinceId) return [];
    const province = provinces.find((p) => p.id === assignment.provinceId);
    return province ? districts[province.provinceCode] || [] : [];
  };

  const getAvailableSectors = (assignment: ReviewerAssignmentForm) => {
    if (!assignment.districtId) return [];
    const allDistricts = Object.values(districts).flat();
    const district = allDistricts.find((d) => d.id === assignment.districtId);
    return district ? sectors[district.districtCode] || [] : [];
  };

  const getAvailableCells = (assignment: ReviewerAssignmentForm) => {
    if (!assignment.sectorId) return [];
    const allSectors = Object.values(sectors).flat();
    const sector = allSectors.find((s) => s.id === assignment.sectorId);
    return sector ? cells[sector.sectorCode] || [] : [];
  };

  const getAvailableVillages = (assignment: ReviewerAssignmentForm) => {
    if (!assignment.cellId) return [];
    const allCells = Object.values(cells).flat();
    const cell = allCells.find((c) => c.id === assignment.cellId);
    return cell ? villages[cell.cellCode] || [] : [];
  };

  const getReviewerName = (userId: string) => {
    const reviewer = reviewers.find((r) => r.id === userId);
    return reviewer ? reviewer.name : "Select reviewer";
  };

  const handleSave = async () => {
    // Validation
    for (const assignment of assignments) {
      if (!assignment.reviewerUserId) {
        toast.error("Please select a reviewer for all assignments");
        return;
      }
    }

    // Check for duplicate reviewers
    const reviewerIds = assignments.map((a) => a.reviewerUserId);
    const uniqueIds = new Set(reviewerIds);
    if (reviewerIds.length !== uniqueIds.size) {
      toast.error("Cannot assign the same reviewer multiple times");
      return;
    }

    try {
      setIsSaving(true);

      // Delete removed assignments
      const removedIds = existingAssignments
        .filter((existing) => !assignments.find((a) => a.id === existing.id))
        .map((a) => a.id);

      for (const id of removedIds) {
        await api.deleteReviewerAssignment(id);
      }

      // Update or create assignments
      for (const assignment of assignments) {
        if (assignment.id) {
          // Update existing
          await api.updateReviewerAssignment(assignment.id, {
            reviewLevel: assignment.reviewLevel,
            reviewOrder: assignment.reviewOrder,
            provinceId: assignment.provinceId,
            districtId: assignment.districtId,
            sectorId: assignment.sectorId,
            cellId: assignment.cellId,
            villageId: assignment.villageId,
            isPrimary: assignment.isPrimary,
            isActive: assignment.isActive,
          });
        } else {
          // Create new
          await api.createReviewerAssignment({
            datasetId,
            reviewerUserId: assignment.reviewerUserId,
            reviewLevel: assignment.reviewLevel,
            reviewOrder: assignment.reviewOrder,
            provinceId: assignment.provinceId,
            districtId: assignment.districtId,
            sectorId: assignment.sectorId,
            cellId: assignment.cellId,
            villageId: assignment.villageId,
            isPrimary: assignment.isPrimary,
          });
        }
      }

      toast.success("Reviewer assignments saved successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Reviewers - {datasetName}
          </DialogTitle>
          <DialogDescription>
            Configure reviewers for this dataset. Reviewers will be assigned in
            sequential order based on level and order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto pr-2">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reviewers...
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No reviewers assigned yet
                </p>
                <Button
                  onClick={addAssignment}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Reviewer
                </Button>
              </div>
            ) : (
              <>
                {assignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-4 relative bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">Reviewer {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssignment(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Reviewer Selection - Simple Select */}
                      <div className="space-y-2 md:col-span-2">
                        <Label>
                          Reviewer <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Search reviewers..."
                            value={reviewerSearchQuery[index] || ""}
                            onChange={(e) =>
                              setReviewerSearchQuery((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }))
                            }
                            className="mb-2"
                          />
                          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select
                          value={assignment.reviewerUserId || ""}
                          onValueChange={(value) =>
                            updateAssignment(index, "reviewerUserId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select reviewer..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {getFilteredReviewers(index).length === 0 ? (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                No reviewers found
                              </div>
                            ) : (
                              getFilteredReviewers(index).map((reviewer) => (
                                <SelectItem
                                  key={reviewer.id}
                                  value={reviewer.id}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {reviewer.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {reviewer.email}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Administrative Level Selection */}
                      <div className="md:col-span-2 space-y-3 p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <Label className="text-sm font-medium">
                            Administrative Area Assignment (Optional)
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Assign this reviewer to specific administrative areas.
                          Leave blank to assign for all areas.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* Province */}
                          <div className="space-y-2">
                            <Label className="text-xs">Province</Label>
                            <Select
                              value={assignment.provinceId || "all"}
                              onValueChange={(value) =>
                                handleAdminLevelChange(index, "province", value)
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="All provinces" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All provinces
                                </SelectItem>
                                {provinces.map((province) => (
                                  <SelectItem
                                    key={province.id}
                                    value={province.id}
                                  >
                                    {province.provinceName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* District */}
                          {assignment.provinceId && (
                            <div className="space-y-2">
                              <Label className="text-xs">District</Label>
                              <Select
                                value={assignment.districtId || "all"}
                                onValueChange={(value) =>
                                  handleAdminLevelChange(
                                    index,
                                    "district",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="All districts" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All districts
                                  </SelectItem>
                                  {getAvailableDistricts(assignment).map(
                                    (district) => (
                                      <SelectItem
                                        key={district.id}
                                        value={district.id}
                                      >
                                        {district.districtName}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Sector */}
                          {assignment.districtId && (
                            <div className="space-y-2">
                              <Label className="text-xs">Sector</Label>
                              <Select
                                value={assignment.sectorId || "all"}
                                onValueChange={(value) =>
                                  handleAdminLevelChange(index, "sector", value)
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="All sectors" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All sectors
                                  </SelectItem>
                                  {getAvailableSectors(assignment).map(
                                    (sector) => (
                                      <SelectItem
                                        key={sector.id}
                                        value={sector.id}
                                      >
                                        {sector.sectorName}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Cell */}
                          {assignment.sectorId && (
                            <div className="space-y-2">
                              <Label className="text-xs">Cell</Label>
                              <Select
                                value={assignment.cellId || "all"}
                                onValueChange={(value) =>
                                  handleAdminLevelChange(index, "cell", value)
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="All cells" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All cells</SelectItem>
                                  {getAvailableCells(assignment).map((cell) => (
                                    <SelectItem key={cell.id} value={cell.id}>
                                      {cell.cellName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Village */}
                          {assignment.cellId && (
                            <div className="space-y-2">
                              <Label className="text-xs">Village</Label>
                              <Select
                                value={assignment.villageId || "all"}
                                onValueChange={(value) =>
                                  handleAdminLevelChange(
                                    index,
                                    "village",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="All villages" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All villages
                                  </SelectItem>
                                  {getAvailableVillages(assignment).map(
                                    (village) => (
                                      <SelectItem
                                        key={village.id}
                                        value={village.id}
                                      >
                                        {village.villageName}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Level */}
                      <div className="space-y-2">
                        <Label>Review Level</Label>
                        <Select
                          value={assignment.reviewLevel.toString()}
                          onValueChange={(value) =>
                            updateAssignment(
                              index,
                              "reviewLevel",
                              parseInt(value),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <SelectItem key={level} value={level.toString()}>
                                Level {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Sequential approval stage
                        </p>
                      </div>

                      {/* Review Order */}
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Select
                          value={assignment.reviewOrder.toString()}
                          onValueChange={(value) =>
                            updateAssignment(
                              index,
                              "reviewOrder",
                              parseInt(value),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((order) => (
                              <SelectItem key={order} value={order.toString()}>
                                Order {order}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Order within level
                        </p>
                      </div>

                      {/* Primary Reviewer */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`primary-${index}`}
                          checked={assignment.isPrimary}
                          onCheckedChange={(checked) =>
                            updateAssignment(
                              index,
                              "isPrimary",
                              checked === true,
                            )
                          }
                        />
                        <Label
                          htmlFor={`primary-${index}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          Primary reviewer for this level
                        </Label>
                      </div>

                      {/* Active Status */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`active-${index}`}
                          checked={assignment.isActive}
                          onCheckedChange={(checked) =>
                            updateAssignment(
                              index,
                              "isActive",
                              checked === true,
                            )
                          }
                        />
                        <Label
                          htmlFor={`active-${index}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          Active
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={addAssignment}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Reviewer
                </Button>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Reviewers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
