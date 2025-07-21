import React, { useState, useEffect } from "react";
import { Database, BarChart3, FileText, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';
import FileUploadZone from '@/components/data-explorer/FileUploadZone';
import DataTableViewer from '@/components/data-explorer/DataTableViewer';
import { SAMPLE_DATASETS, initializeSampleDataPreviews } from '@/utils/sample-data';
import type { UploadResult, TableSchema } from '@/types/data';

const DataExplorerPage: React.FC = () => {
  const { isInitialized, initializationError, loadData, listTables, getTableInfo } = useDataPrism();
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [currentSchema, setCurrentSchema] = useState<TableSchema | null>(null);
  const [loadedTables, setLoadedTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSampleDataPreviews();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      refreshTablesList();
    }
  }, [isInitialized]);

  const refreshTablesList = async () => {
    try {
      const tables = await listTables();
      setLoadedTables(tables);
    } catch (err) {
      console.warn('Failed to list tables:', err);
    }
  };

  const handleUploadComplete = async (result: UploadResult) => {
    if (!result.success || !result.schema) {
      setError(result.error || 'Upload failed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo purposes, we'll use the sample data directly
      // In a real implementation, this would load into DataPrism engine
      const fullData = await SAMPLE_DATASETS.find(ds => ds.id === result.tableName)?.generator?.() || [];
      const dataToUse = fullData.length > 0 ? fullData : result.sampleData;

      // Simulate loading data into DataPrism
      if (isInitialized) {
        await loadData(dataToUse, result.tableName);
      }

      setUploadedData(dataToUse);
      setCurrentSchema(result.schema);
      setSelectedTable(result.tableName);
      
      await refreshTablesList();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (tableName: string) => {
    if (!isInitialized) return;

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would query the DataPrism engine
      // For demo purposes, we'll simulate with sample data
      const sampleDataSet = SAMPLE_DATASETS.find(ds => ds.id === tableName);
      if (sampleDataSet) {
        const data = await sampleDataSet.generator();
        setUploadedData(data);
        
        // Generate schema from data
        const schema: TableSchema = {
          name: tableName,
          columns: Object.keys(data[0] || {}).map(name => ({
            name,
            type: inferDataType(data[0]?.[name]),
            nullable: data.some(row => row[name] == null),
            uniqueCount: new Set(data.map(row => row[name])).size,
            nullCount: data.filter(row => row[name] == null).length
          })),
          rowCount: data.length,
          createdAt: new Date()
        };
        
        setCurrentSchema(schema);
      }

      setSelectedTable(tableName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load table';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inferDataType = (value: any): 'string' | 'number' | 'date' | 'boolean' => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
    return 'string';
  };

  const calculateTableStats = (data: any[]) => {
    if (!data.length) return null;

    const totalRows = data.length;
    const columns = Object.keys(data[0]);
    const totalCells = totalRows * columns.length;
    const nullCells = data.reduce((count, row) => 
      count + columns.filter(col => row[col] == null).length, 0
    );
    const completeness = ((totalCells - nullCells) / totalCells * 100).toFixed(1);

    return {
      totalRows: totalRows.toLocaleString(),
      totalColumns: columns.length,
      completeness: `${completeness}%`,
      memoryEstimate: `${Math.round(JSON.stringify(data).length / 1024)} KB`
    };
  };

  if (initializationError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-red-800 mb-2">
              DataPrism Engine Failed to Initialize
            </h2>
            <p className="text-red-700">
              {initializationError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <Database className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900">
              Initializing DataPrism Engine
            </h2>
            <p className="text-gray-600">
              Loading analytics capabilities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = uploadedData.length > 0 ? calculateTableStats(uploadedData) : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Data Explorer</h1>
        <p className="text-xl text-gray-600">
          Upload, explore, and analyze your datasets with DataPrism
        </p>
      </div>

      {/* Engine Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            DataPrism Engine Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          {stats && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dataset Overview
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rows:</span>
                  <span className="font-medium">{stats.totalRows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Columns:</span>
                  <span className="font-medium">{stats.totalColumns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completeness:</span>
                  <span className="font-medium">{stats.completeness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">{stats.memoryEstimate}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loaded Tables */}
          {loadedTables.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Loaded Tables
              </h3>
              <div className="space-y-1">
                {loadedTables.map(tableName => (
                  <button
                    key={tableName}
                    onClick={() => handleTableSelect(tableName)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedTable === tableName
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {tableName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schema Information */}
          {currentSchema && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Schema
              </h3>
              <div className="space-y-1 text-sm max-h-64 overflow-y-auto">
                {currentSchema.columns.map(col => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="font-medium truncate">{col.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      col.type === 'number' ? 'bg-blue-100 text-blue-700' :
                      col.type === 'date' ? 'bg-green-100 text-green-700' :
                      col.type === 'boolean' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Zone */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <FileUploadZone
              onUpload={handleUploadComplete}
              sampleDataSets={SAMPLE_DATASETS}
              maxFileSize={50 * 1024 * 1024} // 50MB
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {uploadedData.length > 0 && currentSchema && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {currentSchema.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {uploadedData.length.toLocaleString()} rows • {currentSchema.columns.length} columns
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      Ready for Analysis
                    </span>
                  </div>
                </div>
              </div>
              
              <DataTableViewer
                data={uploadedData}
                schema={currentSchema}
                className="p-4"
              />
            </div>
          )}

          {/* Getting Started */}
          {uploadedData.length === 0 && !loading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready for Data
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your CSV, JSON, or Excel files to start exploring data with DataPrism.
              </p>
              <p className="text-sm text-gray-500">
                Try our sample datasets to see DataPrism in action, or upload your own data files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExplorerPage;