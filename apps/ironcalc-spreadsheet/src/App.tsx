import React, { useState } from 'react';
import { IronCalcProvider, useIronCalc } from '@contexts/IronCalcContext';
import { SpreadsheetProvider } from '@contexts/SpreadsheetContext';
import SpreadsheetGrid from '@components/spreadsheet/SpreadsheetGrid';
import FormulaBar from '@components/spreadsheet/FormulaBar';
import MainToolbar from '@components/toolbar/MainToolbar';
import FunctionLibrary from '@components/panels/FunctionLibrary';
import PerformanceMonitor from '@components/panels/PerformanceMonitor';
import FileOperations from '@components/FileOperations';

// Inner component that uses the SpreadsheetProvider context
function SpreadsheetApp() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [showFunctionLibrary, setShowFunctionLibrary] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  
  // Get IronCalc context for status display
  const { isPluginLoaded, pluginError, getFunctions } = useIronCalc();
  const availableFunctions = getFunctions();
  
  // Use FileOperations hook
  const fileOps = FileOperations({
    onFileOperation: (operation, result) => {
      if (result.success) {
        setStatusMessage(`${operation} successful: ${result.fileName || 'file'} (${result.rowsImported || result.rowsExported || 0} rows)`);
        setTimeout(() => setStatusMessage('Ready'), 3000);
      } else {
        setStatusMessage(`${operation} failed: ${result.errors?.[0] || 'Unknown error'}`);
        setTimeout(() => setStatusMessage('Ready'), 5000);
      }
    }
  });

  // Handle cell value changes from formula bar
  const handleCellValueChange = async (address: string, value: string, formula?: string) => {
    // This will be implemented with proper context integration
    console.log('[App] Cell value change:', { address, value, formula });
  };

  // Handle function insertion from function library
  const handleInsertFunction = (functionName: string) => {
    // This will be implemented to insert function into formula bar
    console.log('[App] Insert function:', functionName);
  };

  // File operations
  const handleNewFile = () => {
    console.log('[App] New file');
    setStatusMessage('New file created');
    setTimeout(() => setStatusMessage('Ready'), 2000);
  };

  const handleSaveFile = () => {
    console.log('[App] Save file');
    setStatusMessage('File saved');
    setTimeout(() => setStatusMessage('Ready'), 2000);
  };

  const handleShowPerformanceMonitor = () => {
    setShowPerformanceMonitor(true);
  };

  const handleShowSettings = () => {
    console.log('[App] Show settings');
  };

  const handleShowHelp = () => {
    console.log('[App] Show help');
  };

  // Sample data loader
  const handleLoadSample = (filename: string) => {
    fileOps.loadSample(filename);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* File input element */}
      {fileOps.fileInputElement}
      
      {/* Main Toolbar */}
      <MainToolbar
        onNewFile={handleNewFile}
        onOpenFile={fileOps.openFile}
        onSaveFile={handleSaveFile}
        onImportCSV={fileOps.openFile} // Use the same file picker for import
        onExportCSV={fileOps.exportCSV}
        onLoadSample={handleLoadSample}
        isProcessing={fileOps.isProcessing}
        onShowFunctionLibrary={() => setShowFunctionLibrary(true)}
        onShowPerformanceMonitor={handleShowPerformanceMonitor}
        onShowSettings={handleShowSettings}
        onShowHelp={handleShowHelp}
      />

      {/* Formula Bar */}
      <FormulaBar
        selectedCell={selectedCell}
        onCellValueChange={handleCellValueChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Spreadsheet Grid */}
        <div className="flex-1">
          <SpreadsheetGrid className="h-full" />
        </div>
      </div>

      {/* Function Library Modal */}
      <FunctionLibrary
        isOpen={showFunctionLibrary}
        onClose={() => setShowFunctionLibrary(false)}
        onInsertFunction={handleInsertFunction}
      />

      {/* Performance Monitor Modal */}
      <PerformanceMonitor
        isOpen={showPerformanceMonitor}
        onClose={() => setShowPerformanceMonitor(false)}
      />

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={fileOps.isProcessing ? 'text-blue-600' : ''}>
              {fileOps.isProcessing ? 'Processing...' : statusMessage}
            </span>
            <span>•</span>
            <span>Sheet: Sheet1</span>
            <span>•</span>
            <span>Cell: {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : 'A1'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>IronCalc Plugin: {
              pluginError ? 'Error' : 
              !isPluginLoaded ? 'Loading...' : 
              'Ready'
            }</span>
            <span>•</span>
            <span>{availableFunctions.length} Functions Available</span>
            {pluginError && (
              <>
                <span>•</span>
                <span className="text-red-600 text-xs">{pluginError.message}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <IronCalcProvider>
      <SpreadsheetProvider>
        <SpreadsheetApp />
      </SpreadsheetProvider>
    </IronCalcProvider>
  );
}

export default App;