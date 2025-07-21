# IronCalc Spreadsheet - Technical Architecture

## Overview

The IronCalc Spreadsheet application is a production-ready Excel-compatible spreadsheet built on DataPrism's plugin architecture. It demonstrates advanced WebAssembly integration, real-time formula evaluation, and efficient data management in a browser environment.

## Core Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                    App.tsx                          │
│  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ IronCalcProvider│  │     SpreadsheetProvider     │ │
│  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
┌───▼───┐         ┌──────▼──────┐        ┌────▼────┐
│Toolbar│         │ FormulaBar  │        │  Grid   │
└───────┘         └─────────────┘        └─────────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │  VirtualGrid      │
                                    │ ┌───┐ ┌───┐ ┌───┐ │
                                    │ │ A1│ │ B1│ │ C1│ │
                                    │ └───┘ └───┘ └───┘ │
                                    │ ┌───┐ ┌───┐ ┌───┐ │
                                    │ │ A2│ │ B2│ │ C2│ │
                                    │ └───┘ └───┘ └───┘ │
                                    └───────────────────┘
```

### State Management

The application uses a layered state management approach:

1. **IronCalcContext**: Plugin integration and formula evaluation
2. **SpreadsheetContext**: Core spreadsheet data and operations
3. **Component State**: UI-specific state (selection, editing, etc.)

```typescript
// State flow
IronCalcContext → Formula Evaluation → SpreadsheetContext → UI Updates
```

## Plugin Integration

### IronCalc Plugin Architecture

```typescript
interface IronCalcIntegration {
  // Core operations
  evaluateFormula(formula: string, cell: CellAddress): Promise<FormulaResult>;
  bulkEvaluate(formulas: BulkFormulaRequest[]): Promise<FormulaResult[]>;
  
  // Function library
  getFunctions(): Promise<FunctionDefinition[]>;
  getFunctionHelp(name: string): Promise<FunctionDocumentation>;
  
  // Performance monitoring
  getMetrics(): Promise<PerformanceMetrics>;
}
```

### CDN Loading Pattern

The application loads DataPrism and IronCalc from CDN using dynamic imports:

```typescript
// CDN loader with fallback
class DataPrismCDNLoader {
  async loadDependencies(): Promise<LoadedDependencies> {
    try {
      const [core, plugins] = await Promise.all([
        import(coreUrl),
        import(pluginsUrl)
      ]);
      return { core, plugins };
    } catch (error) {
      return this.createFallback();
    }
  }
}
```

## Data Model

### Cell Data Structure

```typescript
interface Cell {
  address: string;           // A1 notation
  value: any;               // Computed value
  formula?: string;         // Raw formula text
  type: CellType;          // number, string, formula, error
  format: CellFormat;      // Styling and number format
  dependencies: string[];   // Cells this depends on
  dependents: string[];    // Cells that depend on this
}
```

### State Management

```typescript
interface SpreadsheetState {
  // Core data
  cells: Map<string, Cell>;
  sheets: Map<string, Sheet>;
  activeSheet: string;
  
  // UI state
  selection: SelectionState;
  editingCell: string | null;
  formulaBarValue: string;
  
  // Performance
  performanceMetrics: PerformanceMetrics;
  
  // History
  undoStack: SpreadsheetAction[];
  redoStack: SpreadsheetAction[];
}
```

## Performance Optimizations

### Virtual Scrolling

The grid uses react-window for efficient rendering of large datasets:

```typescript
// Only visible cells are rendered
<Grid
  width={width}
  height={height}
  columnCount={1000}
  rowCount={10000}
  columnWidth={CELL_WIDTH}
  rowHeight={CELL_HEIGHT}
>
  {Cell}
</Grid>
```

### Memory Management

- **Cell Storage**: Map-based storage for sparse data
- **Viewport Rendering**: Only visible cells rendered
- **Cleanup**: Automatic cleanup of unused cell data
- **Debounced Updates**: Batched UI updates to prevent excessive re-renders

### Formula Evaluation

```typescript
// Optimized formula evaluation
const evaluateFormula = useCallback(async (formula: string, cellRef: string) => {
  const startTime = performance.now();
  
  try {
    const result = await ironCalcPlugin.execute('evaluateFormula', {
      formula,
      sheet: activeSheet,
      row: parseRowFromRef(cellRef),
      col: parseColFromRef(cellRef)
    });
    
    updatePerformanceMetrics(performance.now() - startTime);
    return result;
  } catch (error) {
    trackError(error, cellRef);
    throw error;
  }
}, [ironCalcPlugin, activeSheet]);
```

## File Operations

### CSV Import/Export

The application uses PapaParse for efficient CSV processing:

```typescript
// Streaming CSV import
Papa.parse(file, {
  header: false,
  skipEmptyLines: true,
  transform: (value) => value.trim(),
  complete: (results) => {
    // Process imported data
    processImportData(results.data);
  }
});
```

### Data Validation

```typescript
// Import validation
function validateImportData(data: string[][]): string[] {
  const errors: string[] = [];
  
  if (data.length > 10000) {
    errors.push(`Too many rows (${data.length}). Maximum: 10000`);
  }
  
  const maxCols = Math.max(...data.map(row => row.length));
  if (maxCols > 1000) {
    errors.push(`Too many columns (${maxCols}). Maximum: 1000`);
  }
  
  return errors;
}
```

## Error Handling

### Plugin Error Recovery

```typescript
const handlePluginError = useCallback((error: Error, context: string) => {
  console.error(`Plugin error in ${context}:`, error);
  
  // Track for performance monitoring
  trackError({
    type: 'plugin_error',
    context,
    message: error.message,
    timestamp: Date.now()
  });
  
  // User feedback
  showNotification({
    type: 'error',
    title: 'Formula Evaluation Error',
    message: error.message,
    actions: [
      { label: 'Retry', onClick: () => retryOperation() },
      { label: 'Help', onClick: () => openHelpDialog() }
    ]
  });
}, []);
```

### Excel-Compatible Errors

The application supports Excel error types:

- `#DIV/0!` - Division by zero
- `#N/A` - Value not available
- `#NAME?` - Unrecognized formula name
- `#NULL!` - Null intersection
- `#NUM!` - Invalid numeric value
- `#REF!` - Invalid cell reference
- `#VALUE!` - Wrong type of argument

## Security Considerations

### Input Sanitization

```typescript
// Formula input validation
function validateFormula(formula: string): boolean {
  // Check for malicious content
  const maliciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i
  ];
  
  return !maliciousPatterns.some(pattern => pattern.test(formula));
}
```

### Memory Protection

- **Bounds Checking**: All array access is bounds-checked
- **Memory Limits**: Hard limits on memory usage
- **Cleanup**: Automatic cleanup prevents memory leaks
- **Sandboxing**: Plugin execution is sandboxed

## Testing Strategy

### Unit Tests

```typescript
describe('Cell Operations', () => {
  it('should evaluate formulas correctly', async () => {
    const { setCellValue, getCellValue } = renderHook(() => useSpreadsheet());
    
    await setCellValue('A1', '10');
    await setCellValue('A2', '20');
    await setCellValue('B1', '=SUM(A1:A2)');
    
    expect(getCellValue('B1')).toBe(30);
  });
});
```

### Integration Tests

```typescript
describe('Plugin Integration', () => {
  it('should load IronCalc plugin successfully', async () => {
    const { result } = renderHook(() => useIronCalc());
    
    await waitFor(() => {
      expect(result.current.isPluginLoaded).toBe(true);
    });
    
    expect(result.current.plugin).toBeDefined();
  });
});
```

### E2E Tests

```typescript
test('should create and evaluate formulas', async ({ page }) => {
  await page.goto('/');
  
  // Enter values
  await page.click('[data-cell="A1"]');
  await page.keyboard.type('10');
  await page.keyboard.press('Enter');
  
  // Enter formula
  await page.click('[data-cell="B1"]');
  await page.keyboard.type('=A1*2');
  await page.keyboard.press('Enter');
  
  // Verify result
  const cellValue = await page.textContent('[data-cell="B1"]');
  expect(cellValue).toBe('20');
});
```

## Deployment Considerations

### Build Optimization

```typescript
// Vite configuration for optimal chunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          spreadsheet: ['react-window', 'react-virtualized-auto-sizer'],
          fileHandling: ['papaparse', 'xlsx'],
          ui: ['lucide-react', 'tailwind-merge']
        }
      }
    }
  }
});
```

### CDN Integration

- **Core Loading**: DataPrism core from GitHub Pages CDN
- **Plugin Loading**: IronCalc plugin from plugin CDN
- **Fallback**: Local mock implementations for development
- **Caching**: Aggressive caching with cache busting

### Performance Monitoring

The application includes comprehensive performance monitoring:

- **Formula Evaluation**: Track execution times and error rates
- **Memory Usage**: Monitor memory consumption and cleanup
- **User Interactions**: Track user activity and patterns
- **Plugin Performance**: Monitor plugin initialization and API latency

This architecture ensures a responsive, scalable, and maintainable spreadsheet application that can handle real-world workloads while providing an excellent user experience.