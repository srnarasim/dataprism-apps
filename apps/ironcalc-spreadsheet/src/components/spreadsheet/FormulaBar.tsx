import React, { useState, useRef, useEffect } from 'react';
import { Calculator, Check, X } from 'lucide-react';
import { useSpreadsheet } from '@contexts/SpreadsheetContext';
import { useIronCalc } from '@contexts/IronCalcContext';
import { cellToA1 } from '@utils/spreadsheet-utils';

interface FormulaBarProps {
  selectedCell: { row: number; col: number } | null;
  onCellValueChange: (address: string, value: string, formula?: string) => void;
}

export default function FormulaBar({ selectedCell, onCellValueChange }: FormulaBarProps) {
  const { getCellValue } = useSpreadsheet();
  const { evaluateFormula, getFunctionHelp } = useIronCalc();
  
  const [formulaValue, setFormulaValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get current cell address
  const currentAddress = selectedCell ? cellToA1(selectedCell.row, selectedCell.col) : '';

  // Update formula value when selected cell changes
  useEffect(() => {
    if (selectedCell && !isEditing) {
      const address = cellToA1(selectedCell.row, selectedCell.col);
      const cellValue = getCellValue(address);
      
      // Show the raw formula if it exists, otherwise show the value
      if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
        setFormulaValue(cellValue);
      } else {
        setFormulaValue(String(cellValue || ''));
      }
    }
  }, [selectedCell, getCellValue, isEditing]);

  // Excel function names for autocomplete
  const excelFunctions = [
    'SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX', 'IF', 'VLOOKUP', 'HLOOKUP',
    'INDEX', 'MATCH', 'CONCATENATE', 'LEFT', 'RIGHT', 'MID', 'LEN',
    'UPPER', 'LOWER', 'TRIM', 'SUBSTITUTE', 'FIND', 'SEARCH',
    'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'ABS', 'SQRT', 'POWER',
    'TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'WEEKDAY',
    'AND', 'OR', 'NOT', 'IFERROR', 'ISERROR', 'ISNA', 'ISNUMBER'
  ];

  // Handle input change with function autocomplete
  const handleInputChange = (value: string) => {
    setFormulaValue(value);
    
    // Check if we should show function suggestions
    if (value.startsWith('=')) {
      const lastFunction = value.match(/([A-Z]+)$/);
      if (lastFunction) {
        const prefix = lastFunction[1];
        const matchingFunctions = excelFunctions.filter(fn => 
          fn.startsWith(prefix) && fn !== prefix
        );
        
        if (matchingFunctions.length > 0) {
          setSuggestions(matchingFunctions.slice(0, 10));
          setShowSuggestions(true);
          setSelectedSuggestion(0);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key down events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          setSelectedSuggestion(prev => prev > 0 ? prev - 1 : prev);
          break;
          
        case 'Tab':
        case 'Enter':
          event.preventDefault();
          applySuggestion(suggestions[selectedSuggestion]);
          break;
          
        case 'Escape':
          event.preventDefault();
          setShowSuggestions(false);
          break;
      }
      return;
    }

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        handleConfirm();
        break;
        
      case 'Escape':
        event.preventDefault();
        handleCancel();
        break;
        
      case 'Tab':
        event.preventDefault();
        handleConfirm();
        break;
    }
  };

  // Apply selected suggestion
  const applySuggestion = (functionName: string) => {
    const currentValue = formulaValue;
    const lastFunctionMatch = currentValue.match(/([A-Z]+)$/);
    
    if (lastFunctionMatch) {
      const newValue = currentValue.replace(/[A-Z]+$/, functionName + '(');
      setFormulaValue(newValue);
      setShowSuggestions(false);
      
      // Focus back to input and position cursor
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newValue.length, newValue.length);
      }
    }
  };

  // Handle confirm (Enter or button click)
  const handleConfirm = async () => {
    if (!selectedCell) return;
    
    const address = cellToA1(selectedCell.row, selectedCell.col);
    
    try {
      if (formulaValue.startsWith('=')) {
        // It's a formula - evaluate it
        await onCellValueChange(address, formulaValue, formulaValue);
      } else {
        // It's a value
        await onCellValueChange(address, formulaValue);
      }
      
      setIsEditing(false);
      setShowSuggestions(false);
    } catch (error) {
      console.error('[FormulaBar] Error setting cell value:', error);
      // Don't exit editing mode on error
    }
  };

  // Handle cancel (Escape or button click)
  const handleCancel = () => {
    // Restore original value
    if (selectedCell) {
      const address = cellToA1(selectedCell.row, selectedCell.col);
      const originalValue = getCellValue(address);
      setFormulaValue(String(originalValue || ''));
    }
    
    setIsEditing(false);
    setShowSuggestions(false);
  };

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Handle function button click
  const handleFunctionClick = () => {
    if (!formulaValue.startsWith('=')) {
      setFormulaValue('=');
      setIsEditing(true);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Show all available functions
    setSuggestions(excelFunctions.slice(0, 10));
    setShowSuggestions(true);
    setSelectedSuggestion(0);
  };

  return (
    <div className="relative bg-white border-b border-gray-300">
      <div className="flex items-center h-10 px-2">
        {/* Function button */}
        <button
          onClick={handleFunctionClick}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded mr-2"
          title="Insert Function"
        >
          <Calculator size={16} />
        </button>

        {/* Cell address */}
        <div className="flex items-center min-w-16 h-8 px-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono mr-2">
          {currentAddress}
        </div>

        {/* Formula input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={formulaValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              // Delay blur to allow suggestion clicks
              setTimeout(() => {
                if (!showSuggestions) {
                  setIsEditing(false);
                }
              }, 150);
            }}
            className="w-full h-8 px-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={selectedCell ? "Enter value or formula..." : "Select a cell"}
            disabled={!selectedCell}
          />

          {/* Function suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg z-50 max-h-48 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    index === selectedSuggestion 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="font-medium">{suggestion}</div>
                  <div className="text-xs text-gray-500">
                    {getFunctionHelp(suggestion)?.description || 'Excel function'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm/Cancel buttons */}
        {isEditing && (
          <div className="flex ml-2">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded mr-1"
              title="Cancel (Escape)"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center justify-center w-8 h-8 text-green-600 hover:bg-green-50 rounded"
              title="Confirm (Enter)"
            >
              <Check size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}