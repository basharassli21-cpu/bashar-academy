import "server-only";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { ValidationError } from "@/lib/errors";
import type { ImportRow, LeadStatus } from "@/lib/api/leads";

const NAME_ALIASES = [
  "name", "customername", "fullname", "clientname",
  "اسم", "الاسم", "اسمالعميل", "اسمالزبون",
];
const PHONE_ALIASES = [
  "phone", "phonenumber", "mobile", "mobilenumber", "tel", "telephone",
  "رقم", "الهاتف", "رقمالهاتف", "موبايل", "الموبايل", "جوال", "الجوال",
];
const STATUS_COLUMN_ALIASES = ["status", "الحالة", "حالة"];
const NOTE_COLUMN_ALIASES = ["note", "notes", "ملاحظة", "الملاحظة", "ملاحظات"];
const LAST_CALL_DATE_ALIASES = [
  "lastcalldate", "lastcall", "lastcontactdate",
  "تاريخآخرمكالمة", "آخرمكالمة", "تاريخالمكالمةالاخيرة", "تاريخآخرتواصل",
];
const NEXT_FOLLOWUP_DATE_ALIASES = [
  "nextfollowupdate", "nextfollowup", "followupdate",
  "تاريخالمتابعةالقادمة", "موعدالمتابعةالقادم", "موعدالمتابعة", "تاريخالمتابعة",
];

const STATUS_VALUE_MAP: Record<string, LeadStatus> = {
  new: "NEW",
  جديد: "NEW",
  contacted: "CONTACTED",
  تمالتواصل: "CONTACTED",
  interested: "INTERESTED",
  مهتم: "INTERESTED",
  notinterested: "NOT_INTERESTED",
  غيرمهتم: "NOT_INTERESTED",
  closedsale: "CLOSED_SALE",
  closed: "CLOSED_SALE",
  تمالبيع: "CLOSED_SALE",
  مباع: "CLOSED_SALE",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
  ملغى: "CANCELLED",
  ملغي: "CANCELLED",
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s_-]/g, "");
}

function parseImportStatus(value: unknown): LeadStatus | undefined {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str ? STATUS_VALUE_MAP[normalizeKey(str)] : undefined;
}

// Excel date cells arrive as JS Date objects (exceljs parses them
// automatically), CSV/typed values arrive as text — most commonly
// DD/MM/YYYY for this region, so that pattern is tried before falling
// back to the generic Date parser.
function parseImportDate(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value.toISOString();
  const str = String(value).trim();
  if (!str) return null;
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const [, d, m, yRaw] = dmy;
    const y = yRaw.length === 2 ? Number(`20${yRaw}`) : Number(yRaw);
    const date = new Date(y, Number(m) - 1, Number(d));
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function mapRows(rows: Record<string, unknown>[]): ImportRow[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const nameKey = keys.find((k) => NAME_ALIASES.includes(normalizeKey(k)));
  const phoneKey = keys.find((k) => PHONE_ALIASES.includes(normalizeKey(k)));
  if (!nameKey || !phoneKey) throw new ValidationError("missing required columns");
  const statusKey = keys.find((k) => STATUS_COLUMN_ALIASES.includes(normalizeKey(k)));
  const noteKey = keys.find((k) => NOTE_COLUMN_ALIASES.includes(normalizeKey(k)));
  const lastCallKey = keys.find((k) => LAST_CALL_DATE_ALIASES.includes(normalizeKey(k)));
  const nextFollowupKey = keys.find((k) => NEXT_FOLLOWUP_DATE_ALIASES.includes(normalizeKey(k)));

  return rows.map((row) => ({
    customerName: String(row[nameKey] ?? "").trim(),
    phone: String(row[phoneKey] ?? "").trim(),
    status: statusKey ? parseImportStatus(row[statusKey]) : undefined,
    note: noteKey ? String(row[noteKey] ?? "").trim() || undefined : undefined,
    lastCallDate: lastCallKey ? parseImportDate(row[lastCallKey]) : undefined,
    nextFollowupDate: nextFollowupKey ? parseImportDate(row[nextFollowupKey]) : undefined,
  }));
}

function cellValueToPrimitive(value: ExcelJS.CellValue): unknown {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    if ("richText" in value) return value.richText.map((t) => t.text).join("");
    if ("result" in value) return value.result ?? "";
    if ("text" in value) return value.text;
    return "";
  }
  return value;
}

async function parseXlsx(buffer: ArrayBuffer): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cellValueToPrimitive(cell.value) ?? "").trim();
  });

  const rows: Record<string, unknown>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, unknown> = {};
    let hasValue = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (!header) return;
      const value = cellValueToPrimitive(cell.value);
      if (value !== "") hasValue = true;
      obj[header] = value;
    });
    if (hasValue) rows.push(obj);
  });
  return rows;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const result = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
  return result.data;
}

export async function parseImportFile(file: File): Promise<ImportRow[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  let rawRows: Record<string, unknown>[];
  try {
    rawRows = isCsv ? parseCsv(await file.text()) : await parseXlsx(await file.arrayBuffer());
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Could not read this file");
  }
  return mapRows(rawRows);
}
