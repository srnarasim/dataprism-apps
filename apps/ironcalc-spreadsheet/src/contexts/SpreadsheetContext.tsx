import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import type { 
  SpreadsheetState, 
  SpreadsheetAction, 
  Cell, 
  SelectionState,
} from '../types/spreadsheet';
import type { CellFormat } from '../types/cell';
import { cellToA1, a1ToCell } from '@utils/spreadsheet-utils';
import { useIronCalc } from './IronCalcContext';

interface SpreadsheetContextValue {
  // State
  state: SpreadsheetState;
  
  // Cell operations
  getCellValue: (address: string) => any;
  setCellValue: (address: string, value: any, formula?: string) => void;
  setCellFormat: (address: string, format: Partial<CellFormat>) => void;
  clearCell: (address: string) => void;
  
  // Selection
  setSelection: (selection: SelectionState) => void;
  selectCell: (row: number, col: number) => void;
  selectRange: (startRow: number, startCol: number, endRow: number, endCol: number) => void;
  
  // Editing
  startEditing: (address: string) => void;
  stopEditing: (save?: boolean) => void;
  setFormulaBarValue: (value: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Sheets
  activeSheet: string;
  setActiveSheet: (sheetName: string) => void;
  
  // Bulk operations
  insertRows: (startRow: number, count: number) => void;
  deleteRows: (startRow: number, count: number) => void;
  insertCols: (startCol: number, count: number) => void;
  deleteCols: (startCol: number, count: number) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextValue | null>(null);

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error("useSpreadsheet must be used within a SpreadsheetProvider");
  }
  return context;
}

// Initial state
const initialState: SpreadsheetState = {
  cells: new Map(),
  sheets: new Map([
    ['Sheet1', {
      id: 'sheet1',
      name: 'Sheet1',
      cells: new Map(),
      dimensions: { maxRow: 1000, maxCol: 26 },
      settings: {
        name: 'Sheet1',
        isVisible: true,
        isProtected: false,
        gridlines: true,
        headers: true,
      }
    }]
  ]),
  activeSheet: 'Sheet1',
  selection: {
    primary: { row: 0, col: 0 },
    ranges: [],
    isSelecting: false,
  },
  editingCell: null,
  formulaBarValue: '',
  pluginStatus: {
    isLoaded: false,
  },
  performanceMetrics: {
    formulaEvaluations: { total: 0, averageTime: 0, p95Time: 0, errorsCount: 0 },
    memoryUsage: { totalMB: 0, pluginMB: 0, applicationMB: 0 },
    interactions: { cellEdits: 0, formulaCreations: 0, fileOperations: 0 },
    pluginMetrics: { initializationTime: 0, apiLatency: 0, errorRate: 0 },
  },
  undoStack: [],
  redoStack: [],
};

// Reducer function
function spreadsheetReducer(state: SpreadsheetState, action: SpreadsheetAction): SpreadsheetState {
  switch (action.type) {
    case 'SET_CELL_VALUE': {
      const { address, value, formula } = action.payload;
      const newCells = new Map(state.cells);
      
      const existingCell = newCells.get(address);
      const newCell: Cell = {
        address,
        value,
        formula,
        type: formula ? 'formula' : typeof value === 'number' ? 'number' : 'string' as any,
        format: existingCell?.format || { textAlign: 'left' },
        dependencies: [],
        dependents: [],
      };
      
      newCells.set(address, newCell);
      
      return {
        ...state,
        cells: newCells,
        performanceMetrics: {
          ...state.performanceMetrics,
          interactions: {
            ...state.performanceMetrics.interactions,
            cellEdits: state.performanceMetrics.interactions.cellEdits + 1,
            formulaCreations: formula ? 
              state.performanceMetrics.interactions.formulaCreations + 1 :
              state.performanceMetrics.interactions.formulaCreations,
          }
        }
      };
    }
    
    case 'SET_CELL_FORMAT': {
      const { address, format } = action.payload;
      const newCells = new Map(state.cells);
      
      const existingCell = newCells.get(address);
      if (existingCell) {
        newCells.set(address, {
          ...existingCell,
          format: { ...existingCell.format, ...format }
        });
      }
      
      return { ...state, cells: newCells };
    }
    
    case 'DELETE_CELLS': {
      const { addresses } = action.payload;
      const newCells = new Map(state.cells);
      
      addresses.forEach(address => {
        newCells.delete(address);
      });
      
      return { ...state, cells: newCells };
    }
    
    default:
      return state;
  }
}

interface SpreadsheetProviderProps {
  children: React.ReactNode;
}

export function SpreadsheetProvider({ children }: SpreadsheetProviderProps) {
  const [state, dispatch] = useReducer(spreadsheetReducer, initialState);
  const { evaluateFormula } = useIronCalc();

  // Auto-save to localStorage
  useEffect(() => {
    const saveState = () => {
      try {
        const serializedState = {
          cells: Array.from(state.cells.entries()),
          activeSheet: state.activeSheet,
          // Don't save selection, editing state, or performance metrics
        };
        localStorage.setItem('spreadsheet-state', JSON.stringify(serializedState));
      } catch (error) {
        console.warn('[Spreadsheet] Failed to save state:', error);
      }
    };

    const timeoutId = setTimeout(saveState, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [state.cells, state.activeSheet]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('spreadsheet-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Restore cells
        if (parsed.cells) {
          const restoredCells = new Map(parsed.cells);
          // Update state with restored cells
          // Note: This would need a proper action, but for simplicity we'll skip the full restoration
        }
      }
    } catch (error) {
      console.warn('[Spreadsheet] Failed to load saved state:', error);
    }
  }, []);

  // Cell operations
  const getCellValue = useCallback((address: string): any => {
    const cell = state.cells.get(address);
    return cell?.value ?? '';
  }, [state.cells]);

  const setCellValue = useCallback(async (address: string, value: any, formula?: string) => {
    // If it's a formula, evaluate it first
    if (formula && formula.startsWith('=')) {
      try {
        const result = await evaluateFormula(formula, address);
        value = result.value;
      } catch (error) {
        console.error('[Spreadsheet] Formula evaluation failed:', error);
        value = '#ERROR!';
      }
    }
    
    dispatch({
      type: 'SET_CELL_VALUE',
      payload: { address, value, formula }
    });
  }, [evaluateFormula]);

  const setCellFormat = useCallback((address: string, format: Partial<CellFormat>) => {
    dispatch({
      type: 'SET_CELL_FORMAT',
      payload: { address, format }
    });
  }, []);

  const clearCell = useCallback((address: string) => {
    dispatch({
      type: 'DELETE_CELLS',
      payload: { addresses: [address] }
    });
  }, []);

  // Selection operations
  const setSelection = useCallback((selection: SelectionState) => {
    // This would need a SET_SELECTION action
    // For now, we'll handle selection in component state
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    const address = cellToA1(row, col);
    // Update selection state
    // For now, just log
    console.log('[Spreadsheet] Select cell:', address);
  }, []);

  const selectRange = useCallback((startRow: number, startCol: number, endRow: number, endCol: number) => {
    const startAddress = cellToA1(startRow, startCol);
    const endAddress = cellToA1(endRow, endCol);
    console.log('[Spreadsheet] Select range:', `${startAddress}:${endAddress}`);
  }, []);

  // Editing operations
  const startEditing = useCallback((address: string) => {
    // This would need a START_EDITING action
    console.log('[Spreadsheet] Start editing:', address);
  }, []);

  const stopEditing = useCallback((save: boolean = true) => {
    // This would need a STOP_EDITING action
    console.log('[Spreadsheet] Stop editing, save:', save);
  }, []);

  const setFormulaBarValue = useCallback((value: string) => {
    // This would need a SET_FORMULA_BAR_VALUE action
    console.log('[Spreadsheet] Formula bar value:', value);
  }, []);

  // History operations
  const undo = useCallback(() => {
    // Implement undo logic
    console.log('[Spreadsheet] Undo');
  }, []);

  const redo = useCallback(() => {
    // Implement redo logic
    console.log('[Spreadsheet] Redo');
  }, []);

  // Sheet operations
  const setActiveSheet = useCallback((sheetName: string) => {
    // This would need a SET_ACTIVE_SHEET action
    console.log('[Spreadsheet] Set active sheet:', sheetName);
  }, []);

  // Bulk operations
  const insertRows = useCallback((startRow: number, count: number) => {
    dispatch({
      type: 'INSERT_ROWS',
      payload: { startRow, count }
    });
  }, []);

  const deleteRows = useCallback((startRow: number, count: number) => {
    dispatch({
      type: 'DELETE_ROWS',
      payload: { startRow, count }
    });
  }, []);

  const insertCols = useCallback((startCol: number, count: number) => {
    dispatch({
      type: 'INSERT_COLS',
      payload: { startCol, count }
    });
  }, []);

  const deleteCols = useCallback((startCol: number, count: number) => {
    dispatch({
      type: 'DELETE_COLS',
      payload: { startCol, count }
    });
  }, []);

  const value: SpreadsheetContextValue = {
    // State
    state,
    
    // Cell operations
    getCellValue,
    setCellValue,
    setCellFormat,
    clearCell,
    
    // Selection
    setSelection,
    selectCell,
    selectRange,
    
    // Editing
    startEditing,
    stopEditing,
    setFormulaBarValue,
    
    // History
    undo,
    redo,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    
    // Sheets
    activeSheet: state.activeSheet,
    setActiveSheet,
    
    // Bulk operations
    insertRows,
    deleteRows,
    insertCols,
    deleteCols,
  };

  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
}