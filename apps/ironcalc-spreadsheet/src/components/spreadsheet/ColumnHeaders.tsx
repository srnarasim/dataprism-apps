import React from 'react';
import { colToLetter } from '@utils/spreadsheet-utils';

interface ColumnHeadersProps {
  startCol: number;
  endCol: number;
  cellWidth: number;
  height: number;
  onColumnClick?: (col: number) => void;
  onColumnResize?: (col: number, width: number) => void;
}

export default function ColumnHeaders({
  startCol,
  endCol,
  cellWidth,
  height,
  onColumnClick,
  onColumnResize,
}: ColumnHeadersProps) {
  const columns = [];
  
  for (let col = startCol; col <= endCol; col++) {
    columns.push(
      <div
        key={col}
        className="bg-gray-100 border-r border-gray-300 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer select-none"
        style={{ 
          width: cellWidth, 
          height, 
          minWidth: cellWidth,
          borderBottom: '1px solid #d1d5db'
        }}
        onClick={() => onColumnClick?.(col)}
      >
        {colToLetter(col)}
      </div>
    );
  }
  
  return (
    <div className="flex">
      {columns}
    </div>
  );
}