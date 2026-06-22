"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  importLeads,
  parseImportFile,
  type ImportAssignmentMode,
  type ImportRow,
  type LeadImportResult,
} from "@/lib/api/leads";
import { fetchEmployees } from "@/lib/api/employees";

export function LeadImportPageClient() {
  const t = useTranslations();
  const [fileName, setFileName] = React.useState("");
  const [rows, setRows] = React.useState<ImportRow[] | null>(null);
  const [parseError, setParseError] = React.useState(false);
  const [parsing, setParsing] = React.useState(false);
  const [mode, setMode] = React.useState<ImportAssignmentMode>("OPENC");
  const [singleEmployeeId, setSingleEmployeeId] = React.useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<LeadImportResult | null>(null);

  const employeesQuery = useQuery({
    queryKey: ["employees", "SALES_EMPLOYEE", "active"],
    queryFn: () => fetchEmployees({ role: "SALES_EMPLOYEE", isActive: true }),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setRows(null);
    setParseError(false);
    setParsing(true);
    try {
      const { rows: parsedRows } = await parseImportFile(file);
      setRows(parsedRows);
    } catch {
      setParseError(true);
    } finally {
      setParsing(false);
    }
  }

  const importMutation = useMutation({
    mutationFn: () =>
      importLeads({
        filename: fileName,
        rows: rows!,
        assignmentMode: mode,
        assignedEmployeeId: mode === "SINGLE_EMPLOYEE" ? singleEmployeeId : null,
        employeeIds: mode === "ROUND_ROBIN" ? selectedEmployeeIds : null,
      }),
    onSuccess: (data) => {
      setResult(data);
      setRows(null);
      setFileName("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canSubmit =
    !parsing &&
    !!rows?.length &&
    (mode === "OPENC" ||
      (mode === "SINGLE_EMPLOYEE" && !!singleEmployeeId) ||
      (mode === "ROUND_ROBIN" && selectedEmployeeIds.length > 0));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.leadImport.title}</h1>

      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="importFile">{t.leadImport.chooseFile}</Label>
          <input
            id="importFile"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="text-sm"
          />
          <p className="text-sm text-muted-foreground">{t.leadImport.supportedColumnsHint}</p>
          {parsing && <p className="text-sm text-muted-foreground">{t.common.loading}</p>}
          {parseError && <p className="text-sm text-destructive">{t.leadImport.parseError}</p>}
          {rows && (
            <p className="text-sm text-muted-foreground">
              {rows.length} {t.leadImport.rowsParsed}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t.leadImport.assignmentMode}</Label>
          <Select
            items={[
              { value: "OPENC", label: t.leadImport.modeOpenC },
              { value: "SINGLE_EMPLOYEE", label: t.leadImport.modeSingleEmployee },
              { value: "ROUND_ROBIN", label: t.leadImport.modeRoundRobin },
            ]}
            value={mode}
            onValueChange={(v) => setMode((v as ImportAssignmentMode) ?? mode)}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPENC">{t.leadImport.modeOpenC}</SelectItem>
              <SelectItem value="SINGLE_EMPLOYEE">{t.leadImport.modeSingleEmployee}</SelectItem>
              <SelectItem value="ROUND_ROBIN">{t.leadImport.modeRoundRobin}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "SINGLE_EMPLOYEE" && (
          <div className="flex flex-col gap-2">
            <Label>{t.leads.owner}</Label>
            <Select
              items={(employeesQuery.data?.items ?? []).map((e) => ({ value: e.id, label: e.fullName }))}
              value={singleEmployeeId}
              onValueChange={(v) => setSingleEmployeeId(v ?? "")}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t.teamLeaders.selectEmployee} />
              </SelectTrigger>
              <SelectContent>
                {employeesQuery.data?.items.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === "ROUND_ROBIN" && (
          <div className="flex flex-col gap-2">
            <Label>{t.leadImport.selectEmployees}</Label>
            <div className="flex flex-col gap-2">
              {employeesQuery.data?.items.map((employee) => (
                <label key={employee.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedEmployeeIds.includes(employee.id)}
                    onCheckedChange={(checked) =>
                      setSelectedEmployeeIds((prev) =>
                        checked ? [...prev, employee.id] : prev.filter((id) => id !== employee.id)
                      )
                    }
                  />
                  {employee.fullName}
                </label>
              ))}
            </div>
          </div>
        )}

        <Button
          disabled={!canSubmit || importMutation.isPending}
          onClick={() => importMutation.mutate()}
          className="self-start"
        >
          {t.leadImport.uploadButton}
        </Button>
      </div>

      {result && (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="font-semibold">{t.leadImport.resultTitle}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Stat label={t.leadImport.totalRows} value={result.totalRows} />
            <Stat label={t.leadImport.imported} value={result.importedCount} />
            <Stat label={t.leadImport.updated} value={result.updatedCount} />
            <Stat label={t.leadImport.skipped} value={result.skippedCount} />
            <Stat label={t.leadImport.invalid} value={result.invalidCount} />
          </div>
          {result.errorReport && result.errorReport.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">{t.leadImport.errorReportTitle}</h3>
              <div className="max-h-64 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <tbody>
                    {result.errorReport.map((err) => (
                      <tr key={err.row} className="border-b last:border-0">
                        <td className="p-2 whitespace-nowrap text-muted-foreground">
                          {t.leadImport.rowLabel} {err.row}
                        </td>
                        <td className="p-2">{err.raw.customerName || "—"}</td>
                        <td className="p-2" dir="ltr">
                          {err.raw.phone || "—"}
                        </td>
                        <td className="p-2 text-destructive">{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
