import React, { useRef, useState } from 'react';
import { useSpreadsheet } from '@contexts/SpreadsheetContext';
import { importCSV, exportToCSV, downloadCSV, loadSampleData } from '@utils/import-export';
import { cellToA1 } from '@utils/spreadsheet-utils';

interface FileOperationsProps {
  onFileOperation?: (operation: string, result: any) => void;
}

export function FileOperations({ onFileOperation }: FileOperationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { state, setCellValue } = useSpreadsheet();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);

    try {
      const result = await importCSV(file, { hasHeaders: true });
      
      if (result.success) {
        // Clear existing data
        console.log('[FileOps] Import successful:', result);
        
        // Import headers if they exist
        if (result.headers) {
          result.headers.forEach((header, colIndex) => {
            const address = cellToA1(0, colIndex);
            setCellValue(address, header);
          });
        }

        // Import data
        result.data.forEach((row, rowIndex) => {
          row.forEach((cellValue, colIndex) => {
            const address = cellToA1(result.headers ? rowIndex + 1 : rowIndex, colIndex);
            setCellValue(address, cellValue);
          });
        });

        onFileOperation?.('import', {
          success: true,
          fileName: file.name,
          rowsImported: result.rowsImported,
          metadata: result.metadata
        });
      } else {
        console.error('[FileOps] Import failed:', result.errors);
        onFileOperation?.('import', {
          success: false,
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('[FileOps] Import error:', error);
      onFileOperation?.('import', {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown import error']
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenFile = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleExportCSV = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = exportToCSV(state.cells, { 
        includeHeaders: true,
        includeFormulas: false 
      });
      
      if (result.success) {
        downloadCSV(result.csvContent, result.filename);
        onFileOperation?.('export', {
          success: true,
          fileName: result.filename,
          rowsExported: result.metadata.rowsExported,
          metadata: result.metadata
        });
      } else {
        console.error('[FileOps] Export failed');
        onFileOperation?.('export', {
          success: false,
          errors: ['Export failed']
        });
      }
    } catch (error) {
      console.error('[FileOps] Export error:', error);
      onFileOperation?.('export', {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown export error']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = async (filename: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = await loadSampleData(filename);
      
      if (result.success) {
        // Clear existing data first
        // Import headers if they exist
        if (result.headers) {
          result.headers.forEach((header, colIndex) => {
            const address = cellToA1(0, colIndex);
            setCellValue(address, header);
          });
        }

        // Import data
        result.data.forEach((row, rowIndex) => {
          row.forEach((cellValue, colIndex) => {
            const address = cellToA1(result.headers ? rowIndex + 1 : rowIndex, colIndex);
            setCellValue(address, cellValue);
          });
        });

        onFileOperation?.('loadSample', {
          success: true,
          fileName: filename,
          rowsImported: result.rowsImported,
          metadata: result.metadata
        });
      } else {
        console.error('[FileOps] Sample load failed:', result.errors);
        onFileOperation?.('loadSample', {
          success: false,
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('[FileOps] Sample load error:', error);
      onFileOperation?.('loadSample', {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown sample load error']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // File input element
    fileInputElement: (
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    ),
    
    // Operations
    openFile: handleOpenFile,
    exportCSV: handleExportCSV,
    loadSample: handleLoadSample,
    isProcessing,
  };
}

export default FileOperations;