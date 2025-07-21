import React, { useState } from 'react';
import { ChevronDown, Database } from 'lucide-react';

interface SampleDataDropdownProps {
  onLoadSample: (filename: string) => void;
  isProcessing?: boolean;
}

const sampleFiles = [
  { 
    filename: 'sales-analysis.csv', 
    name: 'Sales Analysis', 
    description: 'Sales data with formulas and commission calculations' 
  },
  { 
    filename: 'financial-model.csv', 
    name: 'Financial Model', 
    description: 'Financial projections and calculations' 
  },
  { 
    filename: 'inventory-tracking.csv', 
    name: 'Inventory Tracking', 
    description: 'Inventory management with stock calculations' 
  },
];

export default function SampleDataDropdown({ onLoadSample, isProcessing = false }: SampleDataDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSampleSelect = (filename: string) => {
    setIsOpen(false);
    onLoadSample(filename);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className={`flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Load sample data"
      >
        <Database size={16} className="mr-1" />
        Samples
        <ChevronDown size={14} className="ml-1" />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Sample Spreadsheets
              </div>
              {sampleFiles.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => handleSampleSelect(file.filename)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">{file.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{file.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}