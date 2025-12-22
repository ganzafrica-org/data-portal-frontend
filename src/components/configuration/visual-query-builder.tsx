"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Search,
  Database,
  Table as TableIcon,
  Columns,
  Link,
  Filter,
  Code,
  CheckCircle2,
  AlertCircle,
  Info,
  MapPin,
  Loader2,
  Eye,
  Clock,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api-config";
import {
  LAISSchema,
  LAISTable,
  LAISColumn,
  LAISRelationship,
  QueryConfig,
  QueryConfigJoin,
  QueryConfigColumn,
} from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  { id: 1, name: "Base Table", icon: Database },
  { id: 2, name: "Output Columns", icon: Columns },
  { id: 3, name: "JOINs", icon: Link },
  { id: 4, name: "User Criteria", icon: Filter },
  { id: 5, name: "Spatial Data", icon: MapPin },
  { id: 6, name: "Test & Save", icon: Code },
];

const JOIN_TYPES = [
  "LEFT JOIN",
  "INNER JOIN",
  "RIGHT JOIN",
  "FULL OUTER JOIN",
] as const;
const OPERATORS = [
  "=",
  ">",
  "<",
  ">=",
  "<=",
  "!=",
  "IN",
  "LIKE",
  "BETWEEN",
] as const;
const CRITERIA_TYPES = ["dateRange", "multiSelect", "range", "text"] as const;

interface VisualQueryBuilderProps {
  initialConfig?: QueryConfig | null;
  onSave: (config: QueryConfig) => Promise<void>;
  onCancel: () => void;
}

export default function VisualQueryBuilder({
  initialConfig,
  onSave,
  onCancel,
}: VisualQueryBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Base Table
  const [schemas, setSchemas] = useState<LAISSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [tables, setTables] = useState<LAISTable[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableAlias, setTableAlias] = useState("");
  const [filteredTables, setFilteredTables] = useState<LAISTable[]>([]);
  const [tableSearch, setTableSearch] = useState("");

  // Step 2: Output Columns
  const [availableColumns, setAvailableColumns] = useState<LAISColumn[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<QueryConfigColumn[]>(
    [],
  );
  const [columnSearch, setColumnSearch] = useState("");
  const [filteredColumns, setFilteredColumns] = useState<LAISColumn[]>([]);

  // Step 3: JOINs
  const [joins, setJoins] = useState<QueryConfigJoin[]>([]);
  const [relationships, setRelationships] = useState<LAISRelationship[]>([]);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [currentJoin, setCurrentJoin] = useState<Partial<QueryConfigJoin>>({
    type: "LEFT JOIN",
    alwaysInclude: false,
  });
  const [joinTableSearch, setJoinTableSearch] = useState("");
  const [joinTables, setJoinTables] = useState<LAISTable[]>([]);
  const [joinColumns, setJoinColumns] = useState<LAISColumn[]>([]);

  // Step 4: Criteria
  const [criteriaMapping, setCriteriaMapping] = useState<Record<string, any>>(
    {},
  );
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<{
    key: string;
    type: string;
    label: string;
    required: boolean;
    column?: string;
    fromColumn?: string;
    toColumn?: string;
    operator?: string;
    description?: string;
  }>({
    key: "",
    type: "dateRange",
    label: "",
    required: false,
    operator: "=",
  });
  const [allAvailableColumns, setAllAvailableColumns] = useState<
    Array<{ table: string; alias: string; column: LAISColumn }>
  >([]);

  // Step 5: Spatial Data
  const [hasGeometry, setHasGeometry] = useState(false);
  const [geometryColumn, setGeometryColumn] = useState("");
  const [epsgCode, setEpsgCode] = useState("");

  // Step 6: Preview & Validation
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSchemas();
    if (initialConfig) {
      loadInitialConfig(initialConfig);
    }
  }, []);

  // Filter tables based on search
  useEffect(() => {
    if (tableSearch) {
      setFilteredTables(
        tables.filter((t) =>
          t.name.toLowerCase().includes(tableSearch.toLowerCase()),
        ),
      );
    } else {
      setFilteredTables(tables);
    }
  }, [tableSearch, tables]);

  // Filter columns based on search
  useEffect(() => {
    const columns = Array.isArray(availableColumns) ? availableColumns : [];
    if (columnSearch) {
      setFilteredColumns(
        columns.filter((c) =>
          c.name.toLowerCase().includes(columnSearch.toLowerCase()),
        ),
      );
    } else {
      setFilteredColumns(columns);
    }
  }, [columnSearch, availableColumns]);

  // Update available columns for criteria (includes base table + JOINs)
  useEffect(() => {
    const allCols: Array<{ table: string; alias: string; column: LAISColumn }> =
      [];

    // Add base table columns
    if (selectedTable && availableColumns.length > 0) {
      availableColumns.forEach((col) => {
        allCols.push({
          table: selectedTable,
          alias: tableAlias,
          column: col,
        });
      });
    }

    // Add JOIN table columns
    joins.forEach((join) => {
      // We would need to fetch columns for each join table
      // For now, we'll just mark them as available
    });

    setAllAvailableColumns(allCols);
  }, [availableColumns, joins, selectedTable, tableAlias]);

  const loadSchemas = async () => {
    try {
      setIsLoading(true);
      const data = await api.getLAISSchemas();
      setSchemas(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialConfig = (config: QueryConfig) => {
    setSelectedSchema(config.baseTable.schema);
    setSelectedTable(config.baseTable.table);
    setTableAlias(config.baseTable.alias);
    setSelectedColumns(config.columns || []);
    setJoins(config.joins || []);
    setCriteriaMapping(config.criteriaMapping || {});
  };

  const loadTables = async (schema: string) => {
    try {
      setIsLoading(true);
      const data = await api.getLAISTables(schema);
      setTables(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadColumns = async (schema: string, table: string) => {
    try {
      setIsLoading(true);
      const data = await api.getLAISColumns(schema, table);
      setAvailableColumns(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setAvailableColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelationships = async (schema: string, table: string) => {
    try {
      const data = await api.getLAISRelationships(schema, table);
      setRelationships(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadJoinTables = async (schema: string) => {
    try {
      const data = await api.getLAISTables(schema);
      setJoinTables(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadJoinColumns = async (schema: string, table: string) => {
    try {
      const data = await api.getLAISColumns(schema, table);
      setJoinColumns(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setJoinColumns([]);
    }
  };

  const handleSchemaChange = (schema: string) => {
    setSelectedSchema(schema);
    setSelectedTable("");
    setTableAlias("");
    setTables([]);
    loadTables(schema);
  };

  const handleTableChange = (table: string) => {
    setSelectedTable(table);
    const suggestedAlias = table.charAt(0).toLowerCase();
    setTableAlias(suggestedAlias);
    loadColumns(selectedSchema, table);
    loadRelationships(selectedSchema, table);
  };

  const handleColumnToggle = (column: LAISColumn, checked: boolean) => {
    if (checked) {
      const newColumn: QueryConfigColumn = {
        name: column.name,
        label: column.name
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        expression: `${tableAlias}.${column.name}`,
        description: column.description,
      };
      setSelectedColumns([...selectedColumns, newColumn]);
    } else {
      setSelectedColumns(selectedColumns.filter((c) => c.name !== column.name));
    }
  };

  const handleColumnLabelChange = (columnName: string, label: string) => {
    setSelectedColumns(
      selectedColumns.map((c) => (c.name === columnName ? { ...c, label } : c)),
    );
  };

  const handleJoinSchemaChange = (schema: string) => {
    setCurrentJoin({ ...currentJoin, schema });
    loadJoinTables(schema);
  };

  const handleJoinTableChange = (table: string) => {
    const suggestedAlias = table.charAt(0).toLowerCase();
    setCurrentJoin({ ...currentJoin, table, alias: suggestedAlias });
    if (currentJoin.schema) {
      loadJoinColumns(currentJoin.schema, table);
    }
  };

  const handleAddJoin = () => {
    if (
      !currentJoin.schema ||
      !currentJoin.table ||
      !currentJoin.alias ||
      !currentJoin.on
    ) {
      toast.error("Please fill in all required JOIN fields");
      return;
    }

    const newJoin: QueryConfigJoin = {
      type: currentJoin.type as any,
      schema: currentJoin.schema,
      table: currentJoin.table,
      alias: currentJoin.alias,
      on: currentJoin.on,
      alwaysInclude: currentJoin.alwaysInclude || false,
      requiredForCriteria: currentJoin.requiredForCriteria || [],
    };

    setJoins([...joins, newJoin]);
    setShowJoinForm(false);
    setCurrentJoin({ type: "LEFT JOIN", alwaysInclude: false });
    setJoinColumns([]);
  };

  const handleRemoveJoin = (index: number) => {
    setJoins(joins.filter((_, i) => i !== index));
  };

  const handleAddCriteria = () => {
    if (!currentCriteria.key || !currentCriteria.label) {
      toast.error("Please provide criteria key and label");
      return;
    }

    const criteriaKey = currentCriteria.key;
    let criteria: any = {
      enabled: true,
      label: currentCriteria.label,
      required: currentCriteria.required,
      description: currentCriteria.description,
    };

    if (currentCriteria.type === "dateRange") {
      criteria = {
        ...criteria,
        fromColumn: currentCriteria.fromColumn || "",
        toColumn: currentCriteria.toColumn || "",
      };
    } else {
      criteria = {
        ...criteria,
        column: currentCriteria.column || "",
        operator: currentCriteria.operator || "=",
      };
    }

    setCriteriaMapping({
      ...criteriaMapping,
      [criteriaKey]: criteria,
    });

    setShowCriteriaForm(false);
    setCurrentCriteria({
      key: "",
      type: "dateRange",
      label: "",
      required: false,
      operator: "=",
    });
  };

  const handleRemoveCriteria = (key: string) => {
    const { [key]: removed, ...rest } = criteriaMapping;
    setCriteriaMapping(rest);
  };

  const validateConfig = async () => {
    const config = buildQueryConfig();

    try {
      setIsValidating(true);
      const result = await api.validateQueryConfig(config);
      setValidationResult(result);

      if (result.structureValid && result.queryTest?.success) {
        toast.success(
          "Configuration is valid and query executed successfully!",
        );
      } else if (result.structureValid && !result.queryTest?.success) {
        toast.error(
          "Query structure is valid but execution failed. Check the error details.",
        );
      } else {
        toast.error("Configuration has structural errors. Please review.");
      }

      return result.structureValid && result.queryTest?.success;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const buildQueryConfig = (): QueryConfig => {
    return {
      baseTable: {
        schema: selectedSchema,
        table: selectedTable,
        alias: tableAlias,
      },
      joins: joins,
      columns: selectedColumns,
      criteriaMapping: criteriaMapping,
      staticConditions: [],
      orderBy: [],
    };
  };

  const handleSave = async () => {
    const isValid = await validateConfig();

    if (!isValid) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      setIsSaving(true);
      const config = buildQueryConfig();

      // Add spatial data to config if enabled
      const configWithSpatial = {
        ...config,
        hasGeometry,
        geometryColumn: hasGeometry ? geometryColumn : undefined,
        epsgCode: hasGeometry ? epsgCode : undefined,
      };

      await onSave(configWithSpatial as any);
      toast.success("Query configuration saved successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedSchema && selectedTable && tableAlias;
      case 2:
        return selectedColumns.length > 0;
      case 3:
        return true; // JOINs are optional
      case 4:
        return true; // Criteria is optional
      case 5:
        return !hasGeometry || (geometryColumn && geometryColumn.trim() !== "");
      case 6:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBaseTableStep();
      case 2:
        return renderOutputColumnsStep();
      case 3:
        return renderJoinsStep();
      case 4:
        return renderCriteriaStep();
      case 5:
        return renderSpatialDataStep();
      case 6:
        return renderTestAndSaveStep();
      default:
        return null;
    }
  };

  const renderBaseTableStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="schema">Database Schema *</Label>
        <Select value={selectedSchema} onValueChange={handleSchemaChange}>
          <SelectTrigger id="schema">
            <SelectValue placeholder="Select a schema" />
          </SelectTrigger>
          <SelectContent>
            {schemas.map((schema) => (
              <SelectItem key={schema.name} value={schema.name}>
                {schema.name}
                {schema.description && (
                  <span className="text-xs text-gray-500 ml-2">
                    {schema.description}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSchema && (
        <div>
          <Label htmlFor="table">Base Table *</Label>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tables..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64 border rounded-md">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="p-2">
                  {filteredTables.map((table) => (
                    <div
                      key={table.fullName}
                      className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTable === table.name
                          ? "bg-blue-50 border border-blue-200"
                          : ""
                      }`}
                      onClick={() => handleTableChange(table.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TableIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{table.name}</span>
                        </div>
                        {selectedTable === table.name && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      {table.description && (
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                          {table.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      {selectedTable && (
        <div>
          <Label htmlFor="alias">Table Alias *</Label>
          <Input
            id="alias"
            value={tableAlias}
            onChange={(e) => setTableAlias(e.target.value)}
            placeholder="e.g., t, trans, tbl"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            Short alias for use in queries (e.g., "t" for transaction table)
          </p>
        </div>
      )}
    </div>
  );

  const renderOutputColumnsStep = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select columns to include in the exported data. You can customize the
          labels that users will see in the CSV header.
        </AlertDescription>
      </Alert>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search columns..."
          value={columnSearch}
          onChange={(e) => setColumnSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-2 pr-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !Array.isArray(filteredColumns) ||
            filteredColumns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No columns found. Please select a table first.</p>
            </div>
          ) : (
            filteredColumns.map((column) => {
              const isSelected = selectedColumns.some(
                (c) => c.name === column.name,
              );
              const selectedColumn = selectedColumns.find(
                (c) => c.name === column.name,
              );

              return (
                <Card
                  key={column.name}
                  className={isSelected ? "border-blue-200 bg-blue-50" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleColumnToggle(column, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{column.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {column.dataType}
                          </Badge>
                          {!column.isNullable && (
                            <Badge variant="secondary" className="text-xs">
                              NOT NULL
                            </Badge>
                          )}
                        </div>
                        {column.description && (
                          <p className="text-xs text-gray-500">
                            {column.description}
                          </p>
                        )}
                        {isSelected && (
                          <div>
                            <Label
                              htmlFor={`label-${column.name}`}
                              className="text-xs"
                            >
                              Export Column Label
                            </Label>
                            <Input
                              id={`label-${column.name}`}
                              value={selectedColumn?.label || ""}
                              onChange={(e) =>
                                handleColumnLabelChange(
                                  column.name,
                                  e.target.value,
                                )
                              }
                              placeholder="Label for CSV header"
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="bg-gray-50 rounded-md p-3">
        <p className="text-sm text-gray-600">
          Selected:{" "}
          <span className="font-semibold">{selectedColumns.length}</span> column
          {selectedColumns.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );

  const renderJoinsStep = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          JOINs are optional but allow you to combine data from multiple tables.
          Suggested JOINs based on foreign keys are shown below.
        </AlertDescription>
      </Alert>

      {relationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Suggested JOINs</CardTitle>
            <CardDescription className="text-xs">
              Based on foreign key relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relationships.map((rel, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-gray-50 p-2 rounded font-mono"
                >
                  LEFT JOIN {rel.referencedSchema}.{rel.referencedTable} ON{" "}
                  {tableAlias}.{rel.columnName} ={" "}
                  {rel.referencedTable.charAt(0)}.{rel.referencedColumn}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {joins.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Configured JOINs</h4>
          {joins.map((join, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{join.type}</Badge>
                      <span className="font-mono text-sm">
                        {join.schema}.{join.table} AS {join.alias}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 font-mono">
                      ON {join.on}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {join.alwaysInclude && (
                        <Badge variant="secondary" className="text-xs">
                          Always Include
                        </Badge>
                      )}
                      {join.requiredForCriteria &&
                        join.requiredForCriteria.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Required for: {join.requiredForCriteria.join(", ")}
                          </Badge>
                        )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveJoin(idx)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!showJoinForm && (
        <Button
          onClick={() => setShowJoinForm(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add JOIN
        </Button>
      )}

      {showJoinForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">Add JOIN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>JOIN Type *</Label>
              <Select
                value={currentJoin.type}
                onValueChange={(value) =>
                  setCurrentJoin({ ...currentJoin, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOIN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Schema *</Label>
              <Select
                value={currentJoin.schema}
                onValueChange={handleJoinSchemaChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schema" />
                </SelectTrigger>
                <SelectContent>
                  {schemas.map((schema) => (
                    <SelectItem key={schema.name} value={schema.name}>
                      {schema.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Table *</Label>
              <Select
                value={currentJoin.table}
                onValueChange={handleJoinTableChange}
                disabled={!currentJoin.schema}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search tables..."
                      value={joinTableSearch}
                      onChange={(e) => setJoinTableSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  <ScrollArea className="h-48">
                    {joinTables
                      .filter((t) =>
                        t.name
                          .toLowerCase()
                          .includes(joinTableSearch.toLowerCase()),
                      )
                      .map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alias *</Label>
              <Input
                value={currentJoin.alias || ""}
                onChange={(e) =>
                  setCurrentJoin({ ...currentJoin, alias: e.target.value })
                }
                placeholder="e.g., jt, rel"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-suggested: first letter of table name
              </p>
            </div>

            <div>
              <Label>ON Condition *</Label>
              <Input
                value={currentJoin.on || ""}
                onChange={(e) =>
                  setCurrentJoin({ ...currentJoin, on: e.target.value })
                }
                placeholder="e.g., t.id = jt.transaction_id"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use table aliases: {tableAlias} (base),{" "}
                {currentJoin.alias || "jt"} (join)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alwaysInclude"
                checked={currentJoin.alwaysInclude}
                onCheckedChange={(checked) =>
                  setCurrentJoin({
                    ...currentJoin,
                    alwaysInclude: checked as boolean,
                  })
                }
              />
              <Label htmlFor="alwaysInclude" className="text-sm font-normal">
                Always include this JOIN (even if not needed by criteria)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddJoin} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add JOIN
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinForm(false);
                  setCurrentJoin({ type: "LEFT JOIN", alwaysInclude: false });
                  setJoinColumns([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCriteriaStep = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Define what filters users can apply when requesting this dataset. This
          determines the dynamic form fields they'll see.
        </AlertDescription>
      </Alert>

      {Object.keys(criteriaMapping).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Configured Criteria</h4>
          {Object.entries(criteriaMapping).map(([key, criteria]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{criteria.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {key}
                      </Badge>
                      {criteria.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {criteria.description && (
                      <p className="text-xs text-gray-500 mb-2">
                        {criteria.description}
                      </p>
                    )}
                    <div className="text-xs font-mono text-gray-600">
                      {criteria.fromColumn && criteria.toColumn ? (
                        <>
                          Date Range: {criteria.fromColumn} to{" "}
                          {criteria.toColumn}
                        </>
                      ) : (
                        <>
                          {criteria.column} {criteria.operator}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCriteria(key)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!showCriteriaForm && (
        <Button
          onClick={() => setShowCriteriaForm(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Criteria
        </Button>
      )}

      {showCriteriaForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">Add User Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Criteria Key *</Label>
                <Input
                  value={currentCriteria.key}
                  onChange={(e) =>
                    setCurrentCriteria({
                      ...currentCriteria,
                      key: e.target.value,
                    })
                  }
                  placeholder="e.g., dateRange, province_code"
                />
              </div>

              <div>
                <Label>Type *</Label>
                <Select
                  value={currentCriteria.type}
                  onValueChange={(value) =>
                    setCurrentCriteria({ ...currentCriteria, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRITERIA_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Display Label *</Label>
              <Input
                value={currentCriteria.label}
                onChange={(e) =>
                  setCurrentCriteria({
                    ...currentCriteria,
                    label: e.target.value,
                  })
                }
                placeholder="e.g., Date Range, Province"
              />
            </div>

            {currentCriteria.type === "dateRange" ? (
              <div className="space-y-4">
                <div>
                  <Label>From Column *</Label>
                  <Select
                    value={currentCriteria.fromColumn}
                    onValueChange={(value) =>
                      setCurrentCriteria({
                        ...currentCriteria,
                        fromColumn: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAvailableColumns.map((col, idx) => (
                        <SelectItem
                          key={idx}
                          value={`${col.alias}.${col.column.name}`}
                        >
                          {col.alias}.{col.column.name} ({col.column.dataType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Column *</Label>
                  <Select
                    value={currentCriteria.toColumn}
                    onValueChange={(value) =>
                      setCurrentCriteria({
                        ...currentCriteria,
                        toColumn: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAvailableColumns.map((col, idx) => (
                        <SelectItem
                          key={idx}
                          value={`${col.alias}.${col.column.name}`}
                        >
                          {col.alias}.{col.column.name} ({col.column.dataType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Column *</Label>
                  <Select
                    value={currentCriteria.column}
                    onValueChange={(value) =>
                      setCurrentCriteria({ ...currentCriteria, column: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAvailableColumns.map((col, idx) => (
                        <SelectItem
                          key={idx}
                          value={`${col.alias}.${col.column.name}`}
                        >
                          {col.alias}.{col.column.name} ({col.column.dataType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Operator *</Label>
                  <Select
                    value={currentCriteria.operator}
                    onValueChange={(value) =>
                      setCurrentCriteria({
                        ...currentCriteria,
                        operator: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={currentCriteria.description || ""}
                onChange={(e) =>
                  setCurrentCriteria({
                    ...currentCriteria,
                    description: e.target.value,
                  })
                }
                placeholder="Help text for users"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={currentCriteria.required}
                onCheckedChange={(checked) =>
                  setCurrentCriteria({
                    ...currentCriteria,
                    required: checked as boolean,
                  })
                }
              />
              <Label htmlFor="required" className="text-sm font-normal">
                Required field
              </Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCriteria} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCriteriaForm(false);
                  setCurrentCriteria({
                    key: "",
                    type: "dateRange",
                    label: "",
                    required: false,
                    operator: "=",
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSpatialDataStep = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure shapefile export settings if this dataset contains
          spatial/geometry data.
        </AlertDescription>
      </Alert>

      <Card className={hasGeometry ? "border-blue-200 bg-blue-50" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasGeometry"
              checked={hasGeometry}
              onCheckedChange={(checked) => setHasGeometry(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="hasGeometry"
                className="text-base font-semibold flex items-center gap-2"
              >
                <MapPin className="h-5 w-5 text-blue-600" />
                Dataset Contains Geometry Data
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Enable shapefile export for spatial/geographic data. Requires a
                geometry column in the database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasGeometry && (
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <div>
            <Label>Geometry Column Name *</Label>
            <Select value={geometryColumn} onValueChange={setGeometryColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select geometry column" />
              </SelectTrigger>
              <SelectContent>
                {allAvailableColumns
                  .filter(
                    (col) =>
                      col.column.dataType.toLowerCase().includes("geometry") ||
                      col.column.name.toLowerCase().includes("geom") ||
                      col.column.name.toLowerCase().includes("shape"),
                  )
                  .map((col, idx) => (
                    <SelectItem
                      key={idx}
                      value={`${col.alias}.${col.column.name}`}
                    >
                      {col.alias}.{col.column.name} ({col.column.dataType})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Database column containing geometry data (PostGIS geometry type)
            </p>
          </div>

          <div>
            <Label>EPSG Code (Optional)</Label>
            <Input
              value={epsgCode}
              onChange={(e) => setEpsgCode(e.target.value)}
              placeholder="e.g., 4326, 3857, 32735"
            />
            <p className="text-xs text-gray-500 mt-1">
              EPSG coordinate reference system code. Common: 4326 (WGS 84),
              32735 (UTM Zone 35S - Rwanda)
            </p>
          </div>
        </div>
      )}

      {!hasGeometry && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            If this dataset doesn't contain spatial data, you can skip this step
            and proceed to testing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderTestAndSaveStep = () => {
    const config = buildQueryConfig();
    const configJSON = JSON.stringify(config, null, 2);

    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Test your query configuration to ensure it works correctly before
            saving. The system will execute your query against the LAIS database
            and show sample results.
          </AlertDescription>
        </Alert>

        {validationResult && !validationResult.structureValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">
                Structure Validation Errors:
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationResult.errors?.map((error: string, idx: number) => (
                  <li key={idx} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validationResult &&
          validationResult.structureValid &&
          validationResult.queryTest &&
          !validationResult.queryTest.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Query Execution Error:</div>
                <p className="text-sm mb-2">
                  {validationResult.queryTest.error}
                </p>
                {validationResult.queryTest.errorHint && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                    <strong>Hint:</strong>{" "}
                    {validationResult.queryTest.errorHint}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

        {validationResult &&
          validationResult.structureValid &&
          validationResult.queryTest?.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-semibold mb-2">
                  ✓ Query Validated Successfully!
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Rows Retrieved:</span>{" "}
                    {validationResult.queryTest.rowCount}
                  </div>
                  <div>
                    <span className="font-medium">Execution Time:</span>{" "}
                    {validationResult.queryTest.executionTime}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {validationResult?.queryTest?.success &&
          validationResult.queryTest.sampleData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Sample Data Preview (5 rows)
                </CardTitle>
                <CardDescription className="text-xs">
                  Preview of what users will see when they request this dataset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {validationResult.queryTest.columnNames?.map(
                          (col: string, idx: number) => (
                            <TableHead key={idx} className="text-xs">
                              {col}
                            </TableHead>
                          ),
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.queryTest.sampleData.map(
                        (row: any, rowIdx: number) => (
                          <TableRow key={rowIdx}>
                            {Object.values(row).map(
                              (value: any, colIdx: number) => (
                                <TableCell key={colIdx} className="text-xs">
                                  {value !== null ? (
                                    String(value)
                                  ) : (
                                    <span className="text-gray-400">NULL</span>
                                  )}
                                </TableCell>
                              ),
                            )}
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Query Configuration (JSON)
            </CardTitle>
            <CardDescription className="text-xs">
              This will be stored in the dataset's queryConfig field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                {configJSON}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={validateConfig}
            variant="outline"
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Query...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Test Query
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving || isValidating || !validationResult?.queryTest?.success
            }
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isCompleted
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    isActive ? "text-blue-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Separator />

      {/* Step Content */}
      <div className="min-h-[500px]">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 1) {
              onCancel();
            } else {
              setCurrentStep(currentStep - 1);
            }
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < STEPS.length && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
