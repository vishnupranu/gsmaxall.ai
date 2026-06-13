import * as XLSX from "xlsx";

export interface ParsedTable {
  rows: string[];
  sheetCount: number;
}

/** Parse a CSV/XLSX File into one "col: value | …" text line per data row. */
export async function parseTabularFile(file: File): Promise<ParsedTable> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const rows: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
    if (matrix.length === 0) continue;
    const headers = (matrix[0] as unknown[]).map((h) => String(h ?? "").trim());
    for (let i = 1; i < matrix.length; i++) {
      const values = matrix[i] as unknown[];
      const parts: string[] = [];
      values.forEach((val, idx) => {
        if (val === null || val === undefined || val === "") return;
        const header = headers[idx] || `col${idx + 1}`;
        parts.push(`${header}: ${val}`);
      });
      if (parts.length > 0) {
        const line = parts.join(" | ");
        rows.push(wb.SheetNames.length > 1 ? `[${sheetName}] ${line}` : line);
      }
    }
  }
  return { rows, sheetCount: wb.SheetNames.length };
}
