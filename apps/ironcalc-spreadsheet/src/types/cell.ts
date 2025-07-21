export interface CellData {
  value: any;                             // Computed value
  formula?: string;                       // Raw formula
  type: 'number' | 'string' | 'boolean' | 'error' | 'formula';
  format?: CellFormat;
  dependencies?: string[];                // Cells this depends on
  dependents?: string[];                  // Cells that depend on this
}

export interface CellFormat {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  numberFormat?: 'general' | 'number' | 'currency' | 'percentage' | 'date';
  decimalPlaces?: number;
}

export interface CellReference {
  row: number;
  col: number;
  sheet?: string;
}

export interface CellPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CellEditState {
  isEditing: boolean;
  address: string | null;
  value: string;
  formula: string;
}

// Error types that match Excel error values
export type CellError = 
  | '#DIV/0!'    // Division by zero
  | '#N/A'       // Value not available
  | '#NAME?'     // Unrecognized formula name
  | '#NULL!'     // Null intersection
  | '#NUM!'      // Invalid numeric value
  | '#REF!'      // Invalid cell reference
  | '#VALUE!'    // Wrong type of argument
  | '#CALC!'     // Calculation error
  | '#SPILL!'    // Spill error (for dynamic arrays)
  | '#CONNECT!'  // Connection error
  | '#BLOCKED!'  // Blocked reference
  | '#UNKNOWN!'; // Unknown error

export interface FormulaResult {
  value: any;
  error?: CellError;
  dependencies?: string[];
  execution_time_ms?: number;
}

export interface BulkFormulaRequest {
  address: string;
  formula: string;
  sheet?: string;
}