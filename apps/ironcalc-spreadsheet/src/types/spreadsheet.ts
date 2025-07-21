export enum CellType {
  EMPTY = 'empty',
  NUMBER = 'number', 
  STRING = 'string',
  BOOLEAN = 'boolean',
  DATE = 'date',
  FORMULA = 'formula',
  ERROR = 'error'
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

export interface ValidationRule {
  type: 'list' | 'range' | 'custom';
  criteria: any;
  message?: string;
  allowBlank?: boolean;
}

export interface Cell {
  address: string;                        // A1 notation
  value: any;                            // Computed value
  formula?: string;                      // Raw formula text
  type: CellType;
  format: CellFormat;
  validation?: ValidationRule;
  comment?: string;
  dependencies: string[];                // Cells this cell depends on
  dependents: string[];                  // Cells that depend on this cell
}

export interface CellAddress {
  row: number;
  col: number;
  sheet?: string;
}

export interface CellRange {
  start: CellAddress;
  end: CellAddress;
}

export interface SelectionState {
  primary: CellAddress | null;           // Primary selected cell
  ranges: CellRange[];                   // Selected ranges
  isSelecting: boolean;                  // Whether user is actively selecting
}

export interface SheetSettings {
  name: string;
  isVisible: boolean;
  isProtected: boolean;
  gridlines: boolean;
  headers: boolean;
  frozenRows?: number;
  frozenCols?: number;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Map<string, Cell>;
  dimensions: {
    maxRow: number;
    maxCol: number;
  };
  settings: SheetSettings;
}

export interface SpreadsheetMetadata {
  created: Date;
  modified: Date;
  author?: string;
  version: string;
  application: string;
}

export interface SpreadsheetSettings {
  calculation: 'automatic' | 'manual';
  precision: number;
  theme: 'light' | 'dark';
  locale: string;
}

export interface Spreadsheet {
  id: string;
  name: string;
  sheets: Sheet[];
  metadata: SpreadsheetMetadata;
  settings: SpreadsheetSettings;
}

export interface SpreadsheetState {
  // Core data
  cells: Map<string, Cell>;              // A1 -> Cell
  sheets: Map<string, Sheet>;            // Sheet name -> data
  activeSheet: string;
  
  // UI state
  selection: SelectionState;
  editingCell: string | null;
  formulaBarValue: string;
  
  // Plugin state
  pluginStatus: PluginStatus;
  performanceMetrics: PerformanceMetrics;
  
  // History
  undoStack: SpreadsheetAction[];
  redoStack: SpreadsheetAction[];
}

export type SpreadsheetAction = 
  | { type: 'SET_CELL_VALUE'; payload: { address: string; value: any; formula?: string } }
  | { type: 'SET_CELL_FORMAT'; payload: { address: string; format: Partial<CellFormat> } }
  | { type: 'DELETE_CELLS'; payload: { addresses: string[] } }
  | { type: 'INSERT_ROWS'; payload: { startRow: number; count: number } }
  | { type: 'INSERT_COLS'; payload: { startCol: number; count: number } }
  | { type: 'DELETE_ROWS'; payload: { startRow: number; count: number } }
  | { type: 'DELETE_COLS'; payload: { startCol: number; count: number } };

export interface PluginStatus {
  isLoaded: boolean;
  version?: string;
  error?: string;
  functionCount?: number;
}

export interface PerformanceMetrics {
  formulaEvaluations: {
    total: number;
    averageTime: number;
    p95Time: number;
    errorsCount: number;
  };
  memoryUsage: {
    totalMB: number;
    pluginMB: number;
    applicationMB: number;
  };
  interactions: {
    cellEdits: number;
    formulaCreations: number;
    fileOperations: number;
  };
  pluginMetrics: {
    initializationTime: number;
    apiLatency: number;
    errorRate: number;
  };
}