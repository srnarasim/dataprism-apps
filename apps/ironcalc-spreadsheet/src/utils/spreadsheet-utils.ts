import type { CellReference } from '../types/cell';

/**
 * Convert column number to Excel column letter(s)
 * 0 -> A, 1 -> B, 25 -> Z, 26 -> AA, etc.
 */
export function colToLetter(col: number): string {
  let result = '';
  while (col >= 0) {
    result = String.fromCharCode(65 + (col % 26)) + result;
    col = Math.floor(col / 26) - 1;
    if (col < 0) break;
  }
  return result;
}

/**
 * Convert Excel column letter(s) to column number
 * A -> 0, B -> 1, Z -> 25, AA -> 26, etc.
 */
export function letterToCol(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1;
}

/**
 * Convert cell reference to A1 notation
 */
export function cellToA1(row: number, col: number, sheet?: string): string {
  const colLetter = colToLetter(col);
  const rowNumber = row + 1; // Convert 0-based to 1-based
  const address = `${colLetter}${rowNumber}`;
  return sheet ? `${sheet}!${address}` : address;
}

/**
 * Parse A1 notation to cell reference
 */
export function a1ToCell(address: string): CellReference {
  const sheetMatch = address.match(/^(.+)!(.+)$/);
  let cellPart = address;
  let sheet: string | undefined;
  
  if (sheetMatch) {
    sheet = sheetMatch[1];
    cellPart = sheetMatch[2];
  }
  
  const match = cellPart.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell address: ${address}`);
  }
  
  const col = letterToCol(match[1]);
  const row = parseInt(match[2]) - 1; // Convert 1-based to 0-based
  
  return { row, col, sheet };
}

/**
 * Check if address is a range (contains colon)
 */
export function isRange(address: string): boolean {
  return address.includes(':');
}

/**
 * Parse range notation (A1:B10) to start and end cells
 */
export function parseRange(range: string): { start: CellReference; end: CellReference } {
  const parts = range.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid range: ${range}`);
  }
  
  return {
    start: a1ToCell(parts[0]),
    end: a1ToCell(parts[1])
  };
}

/**
 * Generate all cell addresses in a range
 */
export function expandRange(range: string): string[] {
  const { start, end } = parseRange(range);
  const addresses: string[] = [];
  
  for (let row = start.row; row <= end.row; row++) {
    for (let col = start.col; col <= end.col; col++) {
      addresses.push(cellToA1(row, col, start.sheet));
    }
  }
  
  return addresses;
}

/**
 * Check if a cell reference is absolute ($A$1)
 */
export function isAbsoluteReference(address: string): { row: boolean; col: boolean } {
  const match = address.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/);
  if (!match) {
    return { row: false, col: false };
  }
  
  return {
    col: match[1] === '$',
    row: match[3] === '$'
  };
}

/**
 * Make cell reference absolute
 */
export function makeAbsolute(address: string): string {
  const cell = a1ToCell(address);
  return `$${colToLetter(cell.col)}$${cell.row + 1}`;
}

/**
 * Get the next cell address in a direction
 */
export function getNextCell(address: string, direction: 'up' | 'down' | 'left' | 'right'): string {
  const cell = a1ToCell(address);
  
  switch (direction) {
    case 'up':
      return cellToA1(Math.max(0, cell.row - 1), cell.col, cell.sheet);
    case 'down':
      return cellToA1(cell.row + 1, cell.col, cell.sheet);
    case 'left':
      return cellToA1(cell.row, Math.max(0, cell.col - 1), cell.sheet);
    case 'right':
      return cellToA1(cell.row, cell.col + 1, cell.sheet);
    default:
      return address;
  }
}

/**
 * Check if two cell references are equal
 */
export function cellsEqual(a: CellReference, b: CellReference): boolean {
  return a.row === b.row && a.col === b.col && a.sheet === b.sheet;
}

/**
 * Check if a cell is within a range
 */
export function cellInRange(cell: CellReference, range: { start: CellReference; end: CellReference }): boolean {
  return (
    cell.row >= range.start.row &&
    cell.row <= range.end.row &&
    cell.col >= range.start.col &&
    cell.col <= range.end.col &&
    cell.sheet === range.start.sheet
  );
}

/**
 * Get the dimensions of a range
 */
export function getRangeDimensions(range: string): { rows: number; cols: number } {
  const { start, end } = parseRange(range);
  return {
    rows: end.row - start.row + 1,
    cols: end.col - start.col + 1
  };
}

/**
 * Validate cell address format
 */
export function isValidCellAddress(address: string): boolean {
  try {
    a1ToCell(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sort cell addresses by row then column
 */
export function sortCellAddresses(addresses: string[]): string[] {
  return addresses.sort((a, b) => {
    const cellA = a1ToCell(a);
    const cellB = a1ToCell(b);
    
    if (cellA.row !== cellB.row) {
      return cellA.row - cellB.row;
    }
    return cellA.col - cellB.col;
  });
}

/**
 * Get visible range for viewport optimization
 */
export function getVisibleRange(
  viewportStart: { row: number; col: number },
  viewportSize: { rows: number; cols: number },
  buffer: number = 5
): { start: CellReference; end: CellReference } {
  return {
    start: {
      row: Math.max(0, viewportStart.row - buffer),
      col: Math.max(0, viewportStart.col - buffer)
    },
    end: {
      row: viewportStart.row + viewportSize.rows + buffer,
      col: viewportStart.col + viewportSize.cols + buffer
    }
  };
}