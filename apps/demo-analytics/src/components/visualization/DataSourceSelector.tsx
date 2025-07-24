import React, { useState, useEffect } from 'react';
import { Database, Table, BarChart3, RefreshCw, CheckCircle } from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';
import { SAMPLE_DATASETS } from '@/utils/sample-data';
import type { TableSchema, ColumnDefinition } from '@/types/data';

interface DataSourceSelectorProps {
  onDataSelect: (data: any[], schema: TableSchema) => void;
  className?: string;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  onDataSelect,
  className = ''
}) => {
  const { isInitialized, listTables, getTableInfo, query } = useDataPrism();
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableInfo, setTableInfo] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available tables on initialization
  useEffect(() => {
    if (isInitialized) {
      loadAvailableTables();
    }
  }, [isInitialized]);

  const loadAvailableTables = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, try to get tables from DataPrism engine
      let tables: string[] = [];
      
      try {
        tables = await listTables();
      } catch (engineError) {
        console.warn('Failed to get tables from engine, using sample datasets:', engineError);
        // Fallback to sample dataset names
        tables = SAMPLE_DATASETS.map(ds => ds.id);
      }
      
      setAvailableTables(tables);
      
      // Auto-select first table if none selected
      if (!selectedTable && tables.length > 0) {
        setSelectedTable(tables[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tables';
      setError(errorMessage);
      // Fallback to sample datasets
      const sampleTableNames = SAMPLE_DATASETS.map(ds => ds.id);
      setAvailableTables(sampleTableNames);
      if (!selectedTable && sampleTableNames.length > 0) {
        setSelectedTable(sampleTableNames[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load table info when selected table changes
  useEffect(() => {
    if (selectedTable) {
      loadTableInfo(selectedTable);
    }
  }, [selectedTable]);

  const loadTableInfo = async (tableName: string) => {
    setLoadingData(true);
    setError(null);

    try {
      // Try to get table info from DataPrism engine
      let schema: TableSchema;
      
      try {
        schema = await getTableInfo(tableName);
        console.log('[DataSourceSelector] getTableInfo response:', schema);
        
        // Check if schema has proper column information
        if (!schema.columns || schema.columns.length === 0) {
          console.warn('Schema missing column information, trying to infer from data...');
          
          try {
            // Try to get sample data to infer schema
            const queryResult = await query(`SELECT * FROM ${tableName} LIMIT 100`);
            const sampleData = queryResult.data || [];
            
            if (sampleData.length > 0) {
              console.log('[DataSourceSelector] Inferring schema from query result');
              schema = {
                name: tableName,
                columns: Object.keys(sampleData[0] || {}).map(name => ({
                  name,
                  type: inferDataType(sampleData[0]?.[name]),
                  nullable: sampleData.some(row => row[name] == null),
                  uniqueCount: new Set(sampleData.map(row => row[name])).size,
                  nullCount: sampleData.filter(row => row[name] == null).length
                })),
                rowCount: schema.rowCount || sampleData.length,
                createdAt: schema.createdAt || new Date()
              };
              console.log('[DataSourceSelector] ✅ Schema inferred from data:', schema);
            } else {
              throw new Error('No data available to infer schema');
            }
          } catch (inferError) {
            console.warn('Failed to infer schema from data, using sample data fallback:', inferError);
            throw new Error('Schema missing column information');
          }
        }
      } catch (engineError) {
        console.warn('Failed to get table info from engine, using sample data:', engineError);
        // Fallback to sample dataset info
        const sampleDataSet = SAMPLE_DATASETS.find(ds => ds.id === tableName);
        if (sampleDataSet) {
          const sampleData = await sampleDataSet.generator();
          schema = {
            name: tableName,
            columns: Object.keys(sampleData[0] || {}).map(name => ({
              name,
              type: inferDataType(sampleData[0]?.[name]),
              nullable: sampleData.some(row => row[name] == null),
              uniqueCount: new Set(sampleData.map(row => row[name])).size,
              nullCount: sampleData.filter(row => row[name] == null).length
            })),
            rowCount: sampleData.length,
            createdAt: new Date()
          };
        } else {
          throw new Error(`Table '${tableName}' not found`);
        }
      }
      
      setTableInfo(schema);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load table info';
      setError(errorMessage);
      setTableInfo(null);
    } finally {
      setLoadingData(false);
    }
  };

  const inferDataType = (value: any): 'string' | 'number' | 'date' | 'boolean' => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
    return 'string';
  };

  const handleLoadData = async () => {
    if (!selectedTable || !tableInfo) return;
    
    setLoadingData(true);
    setError(null);

    try {
      let data: any[] = [];
      
      // Try to query from DataPrism engine first
      try {
        const queryResult = await query(`SELECT * FROM ${selectedTable} LIMIT 10000`);
        data = queryResult.data || [];
      } catch (engineError) {
        console.warn('Failed to query from engine, using sample data:', engineError);
        // Fallback to sample data generation
        const sampleDataSet = SAMPLE_DATASETS.find(ds => ds.id === selectedTable);
        if (sampleDataSet) {
          data = await sampleDataSet.generator();
        } else {
          throw new Error(`No data available for table '${selectedTable}'`);
        }
      }

      if (data.length === 0) {
        throw new Error('No data found in the selected table');
      }

      // Ensure tableInfo has proper column schema before passing to visualization
      let finalTableInfo = tableInfo;
      if (!tableInfo.columns || tableInfo.columns.length === 0) {
        console.log('[DataSourceSelector] Inferring column schema from loaded data for visualization...');
        finalTableInfo = {
          ...tableInfo,
          columns: Object.keys(data[0] || {}).map(name => ({
            name,
            type: inferDataType(data[0]?.[name]),
            nullable: data.some(row => row[name] == null),
            uniqueCount: new Set(data.map(row => row[name])).size,
            nullCount: data.filter(row => row[name] == null).length
          })),
          rowCount: data.length
        };
        console.log('[DataSourceSelector] ✅ Final schema for visualization:', finalTableInfo);
      }

      onDataSelect(data, finalTableInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Data Source</h3>
        </div>
        
        <button
          onClick={loadAvailableTables}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Table Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Available Tables</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="">Select a table...</option>
          {availableTables.map(tableName => (
            <option key={tableName} value={tableName}>{tableName}</option>
          ))}
        </select>
      </div>

      {/* Table Info */}
      {tableInfo && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Table className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Table Information</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Table Name:</span>
                <span className="font-medium">{tableInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rows:</span>
                <span className="font-medium">{(tableInfo.rowCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Columns:</span>
                <span className="font-medium">{tableInfo.columns?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Column Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Columns Preview</h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {(tableInfo.columns || []).slice(0, 10).map(column => (
                <div
                  key={column.name}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium text-sm truncate">{column.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      column.type === 'number' ? 'bg-blue-100 text-blue-700' :
                      column.type === 'date' ? 'bg-green-100 text-green-700' :
                      column.type === 'boolean' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {column.type}
                    </span>
                    {column.uniqueCount && (
                      <span className="text-xs text-gray-500">
                        {column.uniqueCount} unique
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {(tableInfo.columns?.length || 0) > 10 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  ... and {(tableInfo.columns?.length || 0) - 10} more columns
                </div>
              )}
            </div>
          </div>

          {/* Load Data Button */}
          <button
            onClick={handleLoadData}
            disabled={loadingData || !selectedTable}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingData ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading Data...</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                <span>Use for Visualization</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Sample Datasets Info */}
      {availableTables.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                {availableTables.length} tables available
              </p>
              <p className="text-xs text-blue-700">
                These include sample datasets and any tables you've uploaded to DataPrism.
                Select a table to see its structure and create visualizations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceSelector;