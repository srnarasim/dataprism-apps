import React, { useState } from 'react';
import { IronCalcProvider } from '@contexts/IronCalcContext';
import { SpreadsheetProvider } from '@contexts/SpreadsheetContext';
import SpreadsheetGrid from '@components/spreadsheet/SpreadsheetGrid';
import FormulaBar from '@components/spreadsheet/FormulaBar';
import MainToolbar from '@components/toolbar/MainToolbar';
import FunctionLibrary from '@components/panels/FunctionLibrary';

function App() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [showFunctionLibrary, setShowFunctionLibrary] = useState(false);

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
  };

  const handleOpenFile = () => {
    console.log('[App] Open file');
  };

  const handleSaveFile = () => {
    console.log('[App] Save file');
  };

  const handleImportCSV = () => {
    console.log('[App] Import CSV');
  };

  const handleExportCSV = () => {
    console.log('[App] Export CSV');
  };

  const handleShowPerformanceMonitor = () => {
    console.log('[App] Show performance monitor');
  };

  const handleShowSettings = () => {
    console.log('[App] Show settings');
  };

  const handleShowHelp = () => {
    console.log('[App] Show help');
  };

  return (
    <IronCalcProvider>
      <SpreadsheetProvider>
        <div className="h-screen flex flex-col bg-gray-50">
          {/* Main Toolbar */}
          <MainToolbar
            onNewFile={handleNewFile}
            onOpenFile={handleOpenFile}
            onSaveFile={handleSaveFile}
            onImportCSV={handleImportCSV}
            onExportCSV={handleExportCSV}
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

          {/* Status Bar */}
          <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Ready</span>
                <span>•</span>
                <span>Sheet: Sheet1</span>
                <span>•</span>
                <span>Cell: {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : 'A1'}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>IronCalc Plugin: Ready</span>
                <span>•</span>
                <span>180+ Functions Available</span>
              </div>
            </div>
          </div>
        </div>
      </SpreadsheetProvider>
    </IronCalcProvider>
  );
}

export default App;