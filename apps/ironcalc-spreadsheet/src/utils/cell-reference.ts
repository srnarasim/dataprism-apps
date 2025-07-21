import type { CellReference } from '../types/cell';

/**
 * Utility functions for cell reference parsing and manipulation
 */

const COLUMN_REGEX = /^[A-Z]+$/;
const CELL_REGEX = /^(\$?)([A-Z]+)(\$?)(\d+)$/;
const RANGE_REGEX = /^([A-Z]+\d+):([A-Z]+\d+)$/;

/**
 * Parse a cell reference string into row and column
 */
export function parseRowFromRef(ref: string): number {
  const match = ref.match(CELL_REGEX);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }
  return parseInt(match[4]) - 1; // Convert to 0-based indexing
}

/**
 * Parse a cell reference string into column
 */
export function parseColFromRef(ref: string): number {
  const match = ref.match(CELL_REGEX);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }
  return letterToColumn(match[2]);
}

/**
 * Convert column letters to column index (0-based)
 */
export function letterToColumn(letters: string): number {
  let result = 0;
  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }
  return result - 1;
}

/**
 * Convert column index (0-based) to column letters
 */
export function columnToLetter(col: number): string {
  let result = '';
  while (col >= 0) {
    result = String.fromCharCode(65 + (col % 26)) + result;
    col = Math.floor(col / 26) - 1;
    if (col < 0) break;
  }
  return result;
}

/**
 * Create a cell reference string from row and column
 */
export function createCellRef(row: number, col: number): string {
  return `${columnToLetter(col)}${row + 1}`;
}

/**
 * Offset a cell reference by given rows and columns
 */
export function offsetCellRef(ref: string, rowOffset: number, colOffset: number): string {
  const row = parseRowFromRef(ref);
  const col = parseColFromRef(ref);
  return createCellRef(row + rowOffset, col + colOffset);
}

/**
 * Check if a reference is a range (contains colon)
 */
export function isRangeRef(ref: string): boolean {
  return ref.includes(':');
}

/**
 * Parse a range reference into start and end cells
 */
export function parseRangeRef(rangeRef: string): { start: string; end: string } {
  const parts = rangeRef.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid range reference: ${rangeRef}`);
  }
  return { start: parts[0], end: parts[1] };
}

/**
 * Get all cell references in a range
 */
export function expandRangeRef(rangeRef: string): string[] {
  const { start, end } = parseRangeRef(rangeRef);
  const startRow = parseRowFromRef(start);
  const startCol = parseColFromRef(start);
  const endRow = parseRowFromRef(end);
  const endCol = parseColFromRef(end);
  
  const cells: string[] = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cells.push(createCellRef(row, col));
    }
  }
  return cells;
}

/**
 * Check if a cell is within a range
 */
export function isCellInRange(cellRef: string, rangeRef: string): boolean {
  const { start, end } = parseRangeRef(rangeRef);
  const cellRow = parseRowFromRef(cellRef);
  const cellCol = parseColFromRef(cellRef);
  const startRow = parseRowFromRef(start);
  const startCol = parseColFromRef(start);
  const endRow = parseRowFromRef(end);
  const endCol = parseColFromRef(end);
  
  return (
    cellRow >= startRow &&
    cellRow <= endRow &&
    cellCol >= startCol &&
    cellCol <= endCol
  );
}

/**
 * Normalize a range reference (ensure start comes before end)
 */
export function normalizeRangeRef(rangeRef: string): string {
  const { start, end } = parseRangeRef(rangeRef);
  const startRow = parseRowFromRef(start);
  const startCol = parseColFromRef(start);
  const endRow = parseRowFromRef(end);
  const endCol = parseColFromRef(end);
  
  const actualStart = createCellRef(
    Math.min(startRow, endRow),
    Math.min(startCol, endCol)
  );
  const actualEnd = createCellRef(
    Math.max(startRow, endRow),
    Math.max(startCol, endCol)
  );
  
  return `${actualStart}:${actualEnd}`;
}

/**
 * Get the intersection of two ranges
 */
export function intersectRanges(range1: string, range2: string): string | null {
  const { start: start1, end: end1 } = parseRangeRef(range1);
  const { start: start2, end: end2 } = parseRangeRef(range2);
  
  const startRow1 = parseRowFromRef(start1);
  const startCol1 = parseColFromRef(start1);
  const endRow1 = parseRowFromRef(end1);
  const endCol1 = parseColFromRef(end1);
  
  const startRow2 = parseRowFromRef(start2);
  const startCol2 = parseColFromRef(start2);
  const endRow2 = parseRowFromRef(end2);
  const endCol2 = parseColFromRef(end2);
  
  const intersectStartRow = Math.max(startRow1, startRow2);
  const intersectStartCol = Math.max(startCol1, startCol2);
  const intersectEndRow = Math.min(endRow1, endRow2);
  const intersectEndCol = Math.min(endCol1, endCol2);
  
  if (intersectStartRow > intersectEndRow || intersectStartCol > intersectEndCol) {
    return null; // No intersection
  }
  
  const intersectStart = createCellRef(intersectStartRow, intersectStartCol);
  const intersectEnd = createCellRef(intersectEndRow, intersectEndCol);
  
  return `${intersectStart}:${intersectEnd}`;
}

/**
 * Calculate the size of a range (number of cells)
 */
export function getRangeSize(rangeRef: string): { rows: number; cols: number; total: number } {
  const { start, end } = parseRangeRef(rangeRef);
  const startRow = parseRowFromRef(start);
  const startCol = parseColFromRef(start);
  const endRow = parseRowFromRef(end);
  const endCol = parseColFromRef(end);
  
  const rows = endRow - startRow + 1;
  const cols = endCol - startCol + 1;
  
  return { rows, cols, total: rows * cols };
}