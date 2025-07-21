import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { 
  ChevronUp, 
  ChevronDown, 
  Download,
  Clock,
  Database,
  Memory,
  AlertTriangle,
  CheckCircle,
  Copy,
  BarChart3,
  TrendingUp,
  X
} from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { cn } from '@/utils/cn';
import type { QueryResult } from '@/types/data';

interface QueryResultsViewerProps {
  result: QueryResult;
  onVisualize?: (data: any[]) => void;
  className?: string;
}

const columnHelper = createColumnHelper<any>();

export const QueryResultsViewer: React.FC<QueryResultsViewerProps> = ({
  result,
  onVisualize,
  className
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Create table columns from data
  const columns = useMemo(() => {
    if (!result.data.length) return [];

    return Object.keys(result.data[0]).map(key => 
      columnHelper.accessor(key, {
        id: key,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center space-x-1 hover:text-gray-900 font-medium group"
          >
            <span>{key}</span>
            {column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
            {column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
            {!column.getIsSorted() && (
              <div className="opacity-0 group-hover:opacity-50 transition-opacity">
                <ChevronUp className="w-4 h-4" />
              </div>
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          
          if (value === null || value === undefined) {
            return <span className="text-gray-400 italic">null</span>;
          }
          
          if (typeof value === 'boolean') {
            return (
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {String(value)}
              </span>
            );
          }
          
          if (typeof value === 'number') {
            return (
              <span className="font-mono text-sm">
                {value.toLocaleString()}
              </span>
            );
          }
          
          if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            const date = new Date(value);
            if (!isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
              return (
                <span className="text-sm">
                  {date.toLocaleDateString()}
                </span>
              );
            }
          }
          
          return (
            <span className="text-sm">
              {String(value).length > 50 
                ? String(value).slice(0, 47) + '...'
                : String(value)
              }
            </span>
          );
        },
        size: 150,
        enableSorting: true
      })
    );
  }, [result.data]);

  const table = useReactTable({
    data: result.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const filename = `query_result_${Date.now()}`;
    const data = result.data;

    if (format === 'csv') {
      const headers = columns.map(col => col.id);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
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
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      saveAs(blob, `${filename}.json`);
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    setShowExportDialog(false);
  };

  const handleCopyResults = async () => {
    try {
      const text = JSON.stringify(result.data, null, 2);
      await navigator.clipboard.writeText(text);
      // In a real app, you'd show a toast notification
      console.log('Results copied to clipboard');
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (result.error) {
    return (
      <div className={cn("border border-red-200 rounded-lg p-6", className)}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800 mb-2">Query Error</h3>
            <pre className="text-sm text-red-700 bg-red-50 p-3 rounded font-mono whitespace-pre-wrap">
              {result.error}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!result.data.length) {
    return (
      <div className={cn("border border-gray-200 rounded-lg p-6", className)}>
        <div className="text-center text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Query executed successfully but returned no results.</p>
          <div className="mt-3 text-xs text-gray-400">
            Execution time: {formatDuration(result.metadata.executionTime)}
          </div>
        </div>
      </div>
    );
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">
              {result.metadata.rowCount.toLocaleString()} rows
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">
              {result.metadata.columnCount} columns
            </span>
          </div>
          
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>{formatDuration(result.metadata.executionTime)}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onVisualize && (
            <button
              onClick={() => onVisualize(result.data)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Visualize</span>
            </button>
          )}
          
          <button
            onClick={handleCopyResults}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      {showMetrics && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatDuration(result.metadata.executionTime)}
              </div>
              <div className="text-sm text-gray-600">Execution Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatBytes(result.metadata.memoryUsage)}
              </div>
              <div className="text-sm text-gray-600">Memory Used</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {result.performance.cacheHits}
              </div>
              <div className="text-sm text-gray-600">Cache Hits</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {result.performance.ioOperations}
              </div>
              <div className="text-sm text-gray-600">I/O Operations</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left border-b border-gray-200 font-medium text-gray-900"
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
                      className="px-4 py-2 border-b border-gray-100 text-sm"
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
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>Rows per page:</span>
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

            <div className="flex items-center space-x-4">
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
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Export Query Results</h3>
              <button
                onClick={() => setShowExportDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Export {result.metadata.rowCount.toLocaleString()} rows to:
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs font-bold">
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
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
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
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">
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

export default QueryResultsViewer;