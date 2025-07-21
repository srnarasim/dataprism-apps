import React, { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Download,
  Filter,
  MoreVertical,
  Eye,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from '@/utils/cn';
import type { TableSchema, ColumnFilter, ExportOptions, ColumnDefinition } from '@/types/data';

interface DataTableViewerProps {
  data: any[];
  schema: TableSchema;
  onExport?: (options: ExportOptions) => void;
  className?: string;
  maxHeight?: string;
}

const columnHelper = createColumnHelper<any>();

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'number': return <Hash className="w-4 h-4" />;
    case 'date': return <Calendar className="w-4 h-4" />;
    case 'boolean': return <ToggleLeft className="w-4 h-4" />;
    default: return <Type className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'number': return 'text-blue-600 bg-blue-50';
    case 'date': return 'text-green-600 bg-green-50';
    case 'boolean': return 'text-purple-600 bg-purple-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const DataTableViewer: React.FC<DataTableViewerProps> = ({
  data,
  schema,
  onExport,
  className,
  maxHeight = '600px'
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumnStats, setShowColumnStats] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Create table columns from schema
  const columns = useMemo(() => {
    if (!schema.columns.length) return [];

    return schema.columns.map(col => 
      columnHelper.accessor(col.name, {
        id: col.name,
        header: ({ column }) => (
          <div className="flex items-center space-x-2 group">
            <div className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-md",
              getTypeColor(col.type)
            )}>
              {getTypeIcon(col.type)}
              <span className="text-xs font-medium">{col.type}</span>
            </div>
            <div className="flex-1 text-left">
              <button
                onClick={() => column.toggleSorting()}
                className="flex items-center space-x-1 hover:text-gray-900 font-medium"
              >
                <span>{col.name}</span>
                {column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
                {column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
              </button>
              {col.nullable && (
                <span className="text-xs text-gray-400">nullable</span>
              )}
            </div>
            {showColumnStats && (
              <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {col.uniqueCount ? `${col.uniqueCount} unique` : ''}
                {col.nullCount ? ` • ${col.nullCount} nulls` : ''}
              </div>
            )}
          </div>
        ),
        cell: ({ getValue, row }) => {
          const value = getValue();
          
          if (value === null || value === undefined) {
            return <span className="text-gray-400 italic">null</span>;
          }
          
          if (col.type === 'boolean') {
            return (
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {String(value)}
              </span>
            );
          }
          
          if (col.type === 'number') {
            return (
              <span className="font-mono text-sm">
                {typeof value === 'number' ? value.toLocaleString() : String(value)}
              </span>
            );
          }
          
          if (col.type === 'date') {
            const dateValue = value instanceof Date ? value : new Date(value);
            return (
              <span className="text-sm">
                {isNaN(dateValue.getTime()) ? String(value) : dateValue.toLocaleDateString()}
              </span>
            );
          }
          
          return <span className="text-sm">{String(value)}</span>;
        },
        size: 200,
        enableSorting: true,
        enableColumnFilter: true
      })
    );
  }, [schema.columns, showColumnStats]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'excel') => {
    const exportData = table.getFilteredRowModel().rows.map(row => row.original);
    const filename = `${schema.name}_export_${Date.now()}`;

    if (format === 'csv') {
      const headers = schema.columns.map(col => col.name);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      saveAs(blob, `${filename}.json`);
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    setShowExportDialog(false);
  }, [table, schema]);

  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const totalRowCount = data.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowColumnStats(!showColumnStats)}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
              showColumnStats 
                ? "bg-blue-100 text-blue-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <Eye className="w-4 h-4" />
            <span>Stats</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {filteredRowCount !== totalRowCount && (
              <>
                <span className="font-medium">{filteredRowCount.toLocaleString()}</span>
                <span> of </span>
              </>
            )}
            <span className="font-medium">{totalRowCount.toLocaleString()}</span>
            <span> rows • </span>
            <span className="font-medium">{schema.columns.length}</span>
            <span> columns</span>
          </div>

          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div 
        className="border border-gray-200 rounded-lg overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left border-b border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr 
                key={row.id}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 border-b border-gray-100 text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[25, 50, 100, 200].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pageCount}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Export Data</h3>
              <button
                onClick={() => setShowExportDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Export {filteredRowCount.toLocaleString()} rows to:
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      CSV
                    </div>
                    <div className="text-left">
                      <p className="font-medium">CSV File</p>
                      <p className="text-sm text-gray-500">Comma-separated values</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      XLS
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Excel File</p>
                      <p className="text-sm text-gray-500">Microsoft Excel format</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      JSON
                    </div>
                    <div className="text-left">
                      <p className="font-medium">JSON File</p>
                      <p className="text-sm text-gray-500">JavaScript Object Notation</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTableViewer;