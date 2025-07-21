import Papa from 'papaparse';
import type { Cell } from '../types/spreadsheet';
import { cellToA1 } from './spreadsheet-utils';

export interface ImportOptions {
  hasHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  startRow?: number;
  startCol?: number;
}

export interface ImportResult {
  success: boolean;
  data: Array<Array<string>>;
  headers?: string[];
  rowsImported: number;
  errors: string[];
  metadata: {
    fileSize: number;
    processingTime: number;
    detectedDelimiter?: string;
  };
}

export interface ExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  range?: string;
  includeFormulas?: boolean;
}

export interface ExportResult {
  success: boolean;
  csvContent: string;
  filename: string;
  metadata: {
    rowsExported: number;
    processingTime: number;
  };
}

/**
 * Import CSV file and convert to spreadsheet data
 */
export async function importCSV(
  file: File, 
  options: ImportOptions = {}
): Promise<ImportResult> {
  const startTime = performance.now();
  const {
    hasHeaders = true,
    delimiter = '',
    encoding = 'UTF-8',
    startRow = 0,
    startCol = 0
  } = options;

  return new Promise((resolve) => {
    const errors: string[] = [];
    
    Papa.parse(file, {
      header: false, // We'll handle headers manually
      delimiter: delimiter || undefined, // Let Papa detect if not specified
      encoding: encoding as any,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        const processingTime = performance.now() - startTime;
        
        try {
          let data = results.data as string[][];
          let headers: string[] | undefined;
          
          // Remove empty rows
          data = data.filter(row => row.some(cell => cell && cell.trim() !== ''));
          
          if (data.length === 0) {
            resolve({
              success: false,
              data: [],
              rowsImported: 0,
              errors: ['No data found in file'],
              metadata: {
                fileSize: file.size,
                processingTime,
                detectedDelimiter: results.meta.delimiter
              }
            });
            return;
          }
          
          // Extract headers if specified
          if (hasHeaders && data.length > 0) {
            headers = data[0];
            data = data.slice(1);
          }
          
          // Add any parsing errors
          if (results.errors && results.errors.length > 0) {
            errors.push(...results.errors.map(err => err.message));
          }
          
          resolve({
            success: true,
            data,
            headers,
            rowsImported: data.length,
            errors,
            metadata: {
              fileSize: file.size,
              processingTime,
              detectedDelimiter: results.meta.delimiter
            }
          });
        } catch (error) {
          resolve({
            success: false,
            data: [],
            rowsImported: 0,
            errors: [error instanceof Error ? error.message : 'Unknown import error'],
            metadata: {
              fileSize: file.size,
              processingTime,
              detectedDelimiter: results.meta.delimiter
            }
          });
        }
      },
      error: (error) => {
        const processingTime = performance.now() - startTime;
        resolve({
          success: false,
          data: [],
          rowsImported: 0,
          errors: [error.message],
          metadata: {
            fileSize: file.size,
            processingTime
          }
        });
      }
    });
  });
}

/**
 * Export spreadsheet data to CSV format
 */
export function exportToCSV(
  cells: Map<string, Cell>,
  options: ExportOptions = {}
): ExportResult {
  const startTime = performance.now();
  const {
    includeHeaders = true,
    delimiter = ',',
    range,
    includeFormulas = false
  } = options;

  try {
    // Determine the range to export
    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
    let hasData = false;

    // Find the actual data range
    for (const [address, cell] of cells.entries()) {
      const match = address.match(/^([A-Z]+)(\d+)$/);
      if (!match) continue;
      
      const col = match[1].charCodeAt(0) - 65; // Convert A->0, B->1, etc.
      const row = parseInt(match[2]) - 1; // Convert 1-based to 0-based
      
      if (!hasData) {
        minRow = maxRow = row;
        minCol = maxCol = col;
        hasData = true;
      } else {
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
      }
    }

    if (!hasData) {
      return {
        success: false,
        csvContent: '',
        filename: 'empty.csv',
        metadata: {
          rowsExported: 0,
          processingTime: performance.now() - startTime
        }
      };
    }

    // Build the CSV data
    const csvData: string[][] = [];
    
    for (let row = minRow; row <= maxRow; row++) {
      const csvRow: string[] = [];
      
      for (let col = minCol; col <= maxCol; col++) {
        const address = cellToA1(row, col);
        const cell = cells.get(address);
        
        let value = '';
        if (cell) {
          if (includeFormulas && cell.formula) {
            value = cell.formula;
          } else {
            value = String(cell.value || '');
          }
        }
        
        csvRow.push(value);
      }
      
      csvData.push(csvRow);
    }

    // Convert to CSV string
    const csvContent = Papa.unparse(csvData, {
      delimiter,
      header: false,
      skipEmptyLines: true,
      quotes: true // Always quote fields to handle commas and special characters
    });

    const processingTime = performance.now() - startTime;
    const filename = `spreadsheet_${new Date().toISOString().split('T')[0]}.csv`;

    return {
      success: true,
      csvContent,
      filename,
      metadata: {
        rowsExported: csvData.length,
        processingTime
      }
    };

  } catch (error) {
    const processingTime = performance.now() - startTime;
    return {
      success: false,
      csvContent: '',
      filename: 'export_error.csv',
      metadata: {
        rowsExported: 0,
        processingTime
      }
    };
  }
}

/**
 * Download CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback for older browsers
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = filename;
        link.click();
      };
      reader.readAsDataURL(blob);
    }
  } catch (error) {
    console.error('Failed to download CSV:', error);
    throw new Error('Failed to download file');
  }
}

/**
 * Load sample data file
 */
export async function loadSampleData(filename: string): Promise<ImportResult> {
  try {
    const response = await fetch(`/sample-data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load sample data: ${response.statusText}`);
    }
    
    const text = await response.text();
    const blob = new Blob([text], { type: 'text/csv' });
    const file = new File([blob], filename, { type: 'text/csv' });
    
    return importCSV(file, { hasHeaders: true });
  } catch (error) {
    return {
      success: false,
      data: [],
      rowsImported: 0,
      errors: [error instanceof Error ? error.message : 'Failed to load sample data'],
      metadata: {
        fileSize: 0,
        processingTime: 0
      }
    };
  }
}

/**
 * Detect file format based on extension
 */
export function detectFileFormat(filename: string): 'csv' | 'xlsx' | 'unknown' {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'csv':
      return 'csv';
    case 'xlsx':
    case 'xls':
      return 'xlsx';
    default:
      return 'unknown';
  }
}

/**
 * Validate import data
 */
export function validateImportData(data: string[][]): string[] {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('No data to import');
    return errors;
  }
  
  const maxCols = Math.max(...data.map(row => row.length));
  if (maxCols > 1000) {
    errors.push(`Too many columns (${maxCols}). Maximum supported: 1000`);
  }
  
  if (data.length > 10000) {
    errors.push(`Too many rows (${data.length}). Maximum supported: 10000`);
  }
  
  // Check for very large cells
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j] && data[i][j].length > 32767) {
        errors.push(`Cell value too long at row ${i + 1}, column ${j + 1}. Maximum length: 32767 characters`);
      }
    }
  }
  
  return errors;
}