import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSpreadsheet } from '@contexts/SpreadsheetContext';
import { colToLetter, cellToA1 } from '@utils/spreadsheet-utils';
import CellRenderer from './CellRenderer';
import ColumnHeaders from './ColumnHeaders';
import RowHeaders from './RowHeaders';

const CELL_WIDTH = 80;
const CELL_HEIGHT = 24;
const HEADER_WIDTH = 40;
const HEADER_HEIGHT = 24;

interface SpreadsheetGridProps {
  className?: string;
}

export default function SpreadsheetGrid({ className = '' }: SpreadsheetGridProps) {
  const { state, getCellValue, setCellValue, selectCell } = useSpreadsheet();
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const gridRef = useRef<any>(null);
  const columnHeadersRef = useRef<any>(null);
  const rowHeadersRef = useRef<any>(null);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    selectCell(row, col);
    setEditingCell(null);
  }, [selectCell]);

  // Handle cell double-click to start editing
  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
  }, []);

  // Handle key down events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { row, col } = selectedCell;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (row > 0) {
          const newRow = row - 1;
          setSelectedCell({ row: newRow, col });
          selectCell(newRow, col);
        }
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        const newRowDown = row + 1;
        setSelectedCell({ row: newRowDown, col });
        selectCell(newRowDown, col);
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        if (col > 0) {
          const newCol = col - 1;
          setSelectedCell({ row, col: newCol });
          selectCell(row, newCol);
        }
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        const newColRight = col + 1;
        setSelectedCell({ row, col: newColRight });
        selectCell(row, newColRight);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (editingCell) {
          setEditingCell(null);
        } else {
          setEditingCell({ row, col });
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        setEditingCell(null);
        break;
        
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        const address = cellToA1(row, col);
        setCellValue(address, '');
        break;
        
      default:
        // Start editing on alphanumeric input
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          setEditingCell({ row, col });
        }
        break;
    }
  }, [selectedCell, editingCell, selectCell, setCellValue]);

  // Handle scroll synchronization
  const handleScroll = useCallback(({ scrollLeft, scrollTop }: any) => {
    setScrollLeft(scrollLeft);
    setScrollTop(scrollTop);
    
    // Sync column headers
    if (columnHeadersRef.current) {
      columnHeadersRef.current.scrollTo({ scrollLeft, scrollTop: 0 });
    }
    
    // Sync row headers
    if (rowHeadersRef.current) {
      rowHeadersRef.current.scrollTo({ scrollLeft: 0, scrollTop });
    }
  }, []);

  // Cell renderer wrapper
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const address = cellToA1(rowIndex, columnIndex);
    const value = getCellValue(address);
    const isSelected = selectedCell.row === rowIndex && selectedCell.col === columnIndex;
    const isEditing = editingCell?.row === rowIndex && editingCell?.col === columnIndex;
    
    return (
      <CellRenderer
        style={style}
        row={rowIndex}
        col={columnIndex}
        value={value}
        isSelected={isSelected}
        isEditing={isEditing}
        onClick={() => handleCellClick(rowIndex, columnIndex)}
        onDoubleClick={() => handleCellDoubleClick(rowIndex, columnIndex)}
        onValueChange={(newValue) => {
          const cellAddress = cellToA1(rowIndex, columnIndex);
          setCellValue(cellAddress, newValue);
          setEditingCell(null);
        }}
      />
    );
  }, [
    getCellValue, 
    selectedCell, 
    editingCell, 
    handleCellClick, 
    handleCellDoubleClick, 
    setCellValue
  ]);

  // Column header renderer
  const ColumnHeader = useCallback(({ columnIndex, style }: any) => {
    return (
      <div
        style={style}
        className="flex items-center justify-center bg-gray-100 border-b border-r border-gray-300 text-sm font-medium text-gray-700 select-none"
      >
        {colToLetter(columnIndex)}
      </div>
    );
  }, []);

  // Row header renderer
  const RowHeader = useCallback(({ rowIndex, style }: any) => {
    return (
      <div
        style={style}
        className="flex items-center justify-center bg-gray-100 border-b border-r border-gray-300 text-sm font-medium text-gray-700 select-none"
      >
        {rowIndex + 1}
      </div>
    );
  }, []);

  return (
    <div 
      className={`relative flex flex-col ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      {/* Column Headers */}
      <div className="flex">
        {/* Corner cell */}
        <div 
          className="bg-gray-200 border-b border-r border-gray-300 flex items-center justify-center"
          style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}
        />
        
        {/* Column headers container */}
        <div style={{ width: `calc(100% - ${HEADER_WIDTH}px)`, height: HEADER_HEIGHT }}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <Grid
                ref={columnHeadersRef}
                width={width}
                height={HEADER_HEIGHT}
                columnCount={1000}
                rowCount={1}
                columnWidth={CELL_WIDTH}
                rowHeight={HEADER_HEIGHT}
                scrollLeft={scrollLeft}
                style={{ overflow: 'hidden' }}
              >
                {({ columnIndex, style }) => (
                  <ColumnHeader columnIndex={columnIndex} style={style} />
                )}
              </Grid>
            )}
          </AutoSizer>
        </div>
      </div>

      {/* Main grid area */}
      <div className="flex flex-1">
        {/* Row Headers */}
        <div style={{ width: HEADER_WIDTH, height: `calc(100% - ${HEADER_HEIGHT}px)` }}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <Grid
                ref={rowHeadersRef}
                width={HEADER_WIDTH}
                height={height}
                columnCount={1}
                rowCount={10000}
                columnWidth={HEADER_WIDTH}
                rowHeight={CELL_HEIGHT}
                scrollTop={scrollTop}
                style={{ overflow: 'hidden' }}
              >
                {({ rowIndex, style }) => (
                  <RowHeader rowIndex={rowIndex} style={style} />
                )}
              </Grid>
            )}
          </AutoSizer>
        </div>

        {/* Main cell grid */}
        <div style={{ width: `calc(100% - ${HEADER_WIDTH}px)`, height: `calc(100% - ${HEADER_HEIGHT}px)` }}>
          <AutoSizer>
            {({ width, height }) => (
              <Grid
                ref={gridRef}
                width={width}
                height={height}
                columnCount={1000}
                rowCount={10000}
                columnWidth={CELL_WIDTH}
                rowHeight={CELL_HEIGHT}
                onScroll={handleScroll}
                className="focus:outline-none"
              >
                {Cell}
              </Grid>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}