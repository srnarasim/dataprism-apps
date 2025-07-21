import React, { useState } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Calculator,
  BarChart3,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useSpreadsheet } from '@contexts/SpreadsheetContext';
import SampleDataDropdown from '@components/SampleDataDropdown';

interface MainToolbarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onImportCSV: () => void;
  onExportCSV: () => void;
  onLoadSample?: (filename: string) => void;
  onShowFunctionLibrary: () => void;
  onShowPerformanceMonitor: () => void;
  onShowSettings: () => void;
  onShowHelp: () => void;
  isProcessing?: boolean;
}

export default function MainToolbar({
  onNewFile,
  onOpenFile,
  onSaveFile,
  onImportCSV,
  onExportCSV,
  onLoadSample,
  onShowFunctionLibrary,
  onShowPerformanceMonitor,
  onShowSettings,
  onShowHelp,
  isProcessing = false,
}: MainToolbarProps) {
  const { undo, redo, canUndo, canRedo } = useSpreadsheet();
  const [activeFormat, setActiveFormat] = useState<string[]>([]);

  // Handle format toggle
  const toggleFormat = (format: string) => {
    setActiveFormat(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="bg-white border-b border-gray-300 px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* File Operations */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={onNewFile}
            className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
            title="New Spreadsheet (Ctrl+N)"
          >
            <FileText size={16} className="mr-1" />
            New
          </button>
          
          <button
            onClick={onOpenFile}
            className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
            title="Open File (Ctrl+O)"
          >
            <FolderOpen size={16} className="mr-1" />
            Open
          </button>
          
          <button
            onClick={onSaveFile}
            className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
            title="Save (Ctrl+S)"
          >
            <Save size={16} className="mr-1" />
            Save
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-4" />

        {/* Import/Export */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={onImportCSV}
            disabled={isProcessing}
            className={`flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Import CSV"
          >
            <Upload size={16} className="mr-1" />
            Import
          </button>
          
          <button
            onClick={onExportCSV}
            disabled={isProcessing}
            className={`flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Export CSV"
          >
            <Download size={16} className="mr-1" />
            Export
          </button>
          
          {onLoadSample && (
            <SampleDataDropdown 
              onLoadSample={onLoadSample}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-4" />

        {/* Undo/Redo */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              canUndo 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              canRedo 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-4" />

        {/* Text Formatting */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={() => toggleFormat('bold')}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              activeFormat.includes('bold')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          
          <button
            onClick={() => toggleFormat('italic')}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              activeFormat.includes('italic')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={() => setActiveFormat(['align-left'])}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              activeFormat.includes('align-left')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          
          <button
            onClick={() => setActiveFormat(['align-center'])}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              activeFormat.includes('align-center')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          
          <button
            onClick={() => setActiveFormat(['align-right'])}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              activeFormat.includes('align-right')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-4" />

        {/* Tools */}
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={onShowFunctionLibrary}
            className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
            title="Function Library"
          >
            <Calculator size={16} className="mr-1" />
            Functions
          </button>
          
          <button
            onClick={onShowPerformanceMonitor}
            className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
            title="Performance Monitor"
          >
            <BarChart3 size={16} className="mr-1" />
            Performance
          </button>
        </div>

        {/* Spacer to push right-aligned items */}
        <div className="flex-1" />

        {/* Right-aligned actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onShowSettings}
            className="flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          
          <button
            onClick={onShowHelp}
            className="flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded"
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}