import React, { useState, useRef, useEffect } from 'react';
import { cellToA1 } from '@utils/spreadsheet-utils';

interface CellRendererProps {
  style: React.CSSProperties;
  row: number;
  col: number;
  value: any;
  isSelected: boolean;
  isEditing: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onValueChange: (value: string) => void;
}

export default function CellRenderer({
  style,
  row,
  col,
  value,
  isSelected,
  isEditing,
  onClick,
  onDoubleClick,
  onValueChange,
}: CellRendererProps) {
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize edit value when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditValue(String(value || ''));
      // Focus the input after it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isEditing, value]);

  // Handle input key events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        onValueChange(editValue);
        break;
        
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        setEditValue(String(value || ''));
        onValueChange(String(value || ''));
        break;
        
      case 'Tab':
        event.preventDefault();
        event.stopPropagation();
        onValueChange(editValue);
        break;
    }
  };

  // Handle input blur (when clicking outside)
  const handleBlur = () => {
    onValueChange(editValue);
  };

  // Format display value
  const formatDisplayValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') {
      // Format numbers with appropriate precision
      if (Number.isInteger(val)) {
        return val.toString();
      } else {
        return val.toFixed(2);
      }
    }
    return String(val);
  };

  // Determine cell styling
  const getCellClasses = () => {
    let classes = 'border-r border-b border-gray-200 text-sm px-1 flex items-center';
    
    if (isSelected) {
      classes += ' ring-2 ring-blue-500 bg-blue-50';
    } else {
      classes += ' hover:bg-gray-50';
    }
    
    // Error styling for formula errors
    if (typeof value === 'string' && value.startsWith('#')) {
      classes += ' text-red-600 bg-red-50';
    }
    
    // Number alignment
    if (typeof value === 'number') {
      classes += ' justify-end';
    } else {
      classes += ' justify-start';
    }
    
    return classes;
  };

  // Get cell tooltip
  const getCellTooltip = (): string => {
    const address = cellToA1(row, col);
    if (typeof value === 'string' && value.startsWith('#')) {
      return `${address}: ${value} (Formula Error)`;
    }
    if (typeof value === 'string' && value.startsWith('=')) {
      return `${address}: Formula ${value}`;
    }
    return `${address}: ${formatDisplayValue(value)}`;
  };

  return (
    <div
      style={style}
      className={getCellClasses()}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title={getCellTooltip()}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full h-full bg-transparent border-none outline-none text-sm px-0"
          style={{ margin: 0, padding: 0 }}
        />
      ) : (
        <span className="truncate w-full">
          {formatDisplayValue(value)}
        </span>
      )}
    </div>
  );
}