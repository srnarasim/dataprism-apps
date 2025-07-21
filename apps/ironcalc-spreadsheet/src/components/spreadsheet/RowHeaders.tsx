import React from 'react';

interface RowHeadersProps {
  startRow: number;
  endRow: number;
  width: number;
  cellHeight: number;
  onRowClick?: (row: number) => void;
  onRowResize?: (row: number, height: number) => void;
}

export default function RowHeaders({
  startRow,
  endRow,
  width,
  cellHeight,
  onRowClick,
  onRowResize,
}: RowHeadersProps) {
  const rows = [];
  
  for (let row = startRow; row <= endRow; row++) {
    rows.push(
      <div
        key={row}
        className="bg-gray-100 border-b border-gray-300 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer select-none"
        style={{ 
          width, 
          height: cellHeight, 
          minHeight: cellHeight,
          borderRight: '1px solid #d1d5db'
        }}
        onClick={() => onRowClick?.(row)}
      >
        {row + 1}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      {rows}
    </div>
  );
}