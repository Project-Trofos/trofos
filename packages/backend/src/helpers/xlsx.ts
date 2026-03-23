import fs from 'fs';
import ExcelJS from 'exceljs';

/**
 * Extracts a string value from an ExcelJS cell value, handling all cell types:
 * - Formula cells: extracts the cached result
 * - Hyperlink cells: extracts the display text (Excel auto-converts emails to hyperlinks)
 * - Rich text cells: joins all text fragments
 * - Error cells: returns empty string
 */
export function getCellValue(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if ('formula' in v) return v.result != null ? String(v.result) : '';
    if ('text' in v) return String(v.text);
    if ('richText' in v) return v.richText.map((r: any) => r.text).join('');
    if ('error' in v) return '';
    return '';
  }
  return String(v);
}

/**
 * Converts an XLSX file to CSV, handling the dynamic import template format:
 * - Skips the example row (row 2)
 * - Only includes data columns (excludes hidden columns prefixed with _)
 * - Skips empty data rows (checks first column as primary input)
 * - Properly reads formula results, hyperlinks, and rich text
 */
export async function convertXlsxToCsv(xlsxPath: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);
  const sheet = workbook.worksheets[0];
  const csvPath = xlsxPath.replace(/\.[^.]+$/, '.csv');
  const rows: string[] = [];

  // Only include columns whose header doesn't start with _ (hidden lookup columns)
  const headerRow = sheet.getRow(1);
  const dataCols: number[] = [];
  for (let col = 1; col <= sheet.columnCount; col++) {
    const header = getCellValue(headerRow.getCell(col).value);
    if (header && !header.startsWith('_')) {
      dataCols.push(col);
    }
  }

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 2) return; // Skip example row

    const csvValues = dataCols.map((colNum) => {
      const str = getCellValue(row.getCell(colNum).value);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    });

    // Skip rows where the first column (primary input) is empty
    if (rowNumber > 1 && !csvValues[0]) return;

    rows.push(csvValues.join(','));
  });

  fs.writeFileSync(csvPath, rows.join('\n'));
  return csvPath;
}
