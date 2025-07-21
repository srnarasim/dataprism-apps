# IronCalc Spreadsheet Application

A comprehensive Excel-compatible spreadsheet application powered by DataPrism and the IronCalc formula engine. This application demonstrates the full capabilities of DataPrism's plugin architecture with a production-ready spreadsheet interface supporting 180+ Excel functions.

## 🚀 Features

### Core Spreadsheet Functionality
- **Excel-like Interface**: Familiar grid layout with column headers (A, B, C...) and row headers (1, 2, 3...)
- **Cell Editing**: In-cell and formula bar editing with Excel-compatible shortcuts
- **Formula Support**: 180+ Excel-compatible functions via IronCalc plugin
- **Data Types**: Numbers, text, dates, booleans, and formulas with automatic type detection
- **Virtual Scrolling**: Efficient handling of large spreadsheets (1000x10000 cells)

### Advanced Features
- **Function Library**: Searchable library with categorized functions and documentation
- **CSV Import/Export**: Full CSV file handling with delimiter detection
- **Performance Monitoring**: Real-time performance analytics and optimization recommendations
- **Formula Autocomplete**: Smart function suggestions and parameter hints
- **Error Handling**: Excel-compatible error types (#DIV/0!, #VALUE!, etc.)
- **Auto-save**: Automatic local storage persistence

### Plugin Integration
- **IronCalc Formula Engine**: WebAssembly-powered formula evaluation
- **DataPrism CDN Loading**: Dynamic plugin loading from CDN
- **Performance Tracking**: Sub-100ms formula evaluation for 95% of operations
- **Memory Management**: Efficient memory usage with cleanup and optimization

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom spreadsheet theme
- **Virtualization**: react-window for efficient grid rendering
- **Build Tool**: Vite with optimized chunking
- **Testing**: Vitest for unit tests, Playwright for E2E

### Plugin Architecture
```typescript
// IronCalc plugin integration
const { evaluateFormula, getFunctions } = useIronCalc();

// Evaluate Excel-compatible formulas
const result = await evaluateFormula('=SUM(A1:A10)', 'B1');
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check
```

## 🎯 Usage

### Basic Operations
1. **Cell Selection**: Click any cell or use arrow keys to navigate
2. **Data Entry**: Type directly into cells or use the formula bar
3. **Formulas**: Start with `=` to create formulas (e.g., `=SUM(A1:A10)`)
4. **Functions**: Use the function library to browse and insert functions

### File Operations
- **Import CSV**: Use the Import button to load CSV files
- **Export CSV**: Export your spreadsheet data to CSV format
- **Sample Data**: Load pre-built examples (financial models, sales data, etc.)

### Advanced Features
- **Function Library**: Browse 180+ Excel functions by category
- **Performance Monitor**: View real-time performance metrics
- **Formula Autocomplete**: Type `=` and function names for suggestions

## 📊 Sample Data

The application includes several sample datasets:

- `financial-model.csv` - Financial projections with formulas
- `sales-analysis.csv` - Sales data with pivot-style calculations  
- `inventory-tracking.csv` - Inventory management with lookup functions

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── spreadsheet/     # Core grid components
│   ├── toolbar/         # Main toolbar and tools
│   ├── panels/          # Function library, performance monitor
│   └── dialogs/         # Import/export dialogs
├── contexts/            # React contexts for state management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

### Key Components
- `SpreadsheetGrid`: Main grid with virtual scrolling
- `FormulaBar`: Excel-like formula editing bar
- `IronCalcContext`: Plugin integration and formula evaluation
- `SpreadsheetContext`: Core spreadsheet state management

### Performance Targets
- Formula evaluation: <100ms for 95% of operations
- Grid rendering: <50ms for viewport updates
- Memory usage: <1GB for 1M populated cells
- File import: <5s for 100k row CSV files

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📈 Performance

The application is optimized for:
- **Sub-second formula evaluation** via WebAssembly IronCalc engine
- **Efficient memory usage** with virtual scrolling and cleanup
- **Fast file operations** with streaming CSV processing
- **Responsive UI** with debounced updates and optimization

## 🔌 Plugin Integration

This application showcases DataPrism's plugin architecture:

```typescript
// Plugin loading from CDN
const dependencies = await loadDataPrismDependencies();
const ironCalcPlugin = dependencies.plugins.getPlugin('ironcalc-formula');

// Function evaluation
const result = await ironCalcPlugin.execute('evaluateFormula', {
  formula: '=SUM(A1:A10)',
  sheet: 'Sheet1',
  row: 0,
  col: 1
});
```

## 🛠️ Configuration

### Environment Variables
- `NODE_ENV`: Development/production mode
- `VITE_CDN_BASE_URL`: Custom CDN URL for DataPrism dependencies

### Build Configuration
The application uses Vite with optimized chunks:
- `vendor`: React and core dependencies
- `spreadsheet`: Grid and spreadsheet components  
- `fileHandling`: CSV import/export utilities
- `ui`: UI components and utilities

## 📝 License

This project is part of the DataPrism Apps ecosystem and follows the same licensing terms.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure performance targets are met

## 🔗 Related Projects

- [DataPrism Core](../../../dataprism-core) - Core engine and WebAssembly runtime
- [DataPrism Plugins](../../../dataprism-plugins) - Plugin framework and IronCalc integration
- [Demo Analytics](../demo-analytics) - Interactive analytics demonstration

## 📞 Support

For issues and questions:
- Check the [troubleshooting guide](./docs/TROUBLESHOOTING.md)
- Review [architecture documentation](./docs/ARCHITECTURE.md)
- See [plugin integration guide](./docs/PLUGIN_INTEGRATION.md)