import React, { useState, useEffect } from "react";
import { Database, Play, AlertCircle, CheckCircle, BookOpen, History, Table } from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';
import MonacoSQLEditor from '@/components/query-lab/MonacoSQLEditor';
import QueryResultsViewer from '@/components/query-lab/QueryResultsViewer';
import { SAMPLE_DATASETS } from '@/utils/sample-data';
import type { QueryResult, TableSchema } from '@/types/data';

const QueryLabPage: React.FC = () => {
  const { isInitialized, initializationError, query, listTables, getTableInfo } = useDataPrism();
  const [sqlQuery, setSqlQuery] = useState('-- Welcome to DataPrism Query Lab!\n-- Start with a simple query:\n\nSELECT * FROM your_table LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [availableSchemas, setAvailableSchemas] = useState<TableSchema[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<TableSchema | null>(null);

  useEffect(() => {
    if (isInitialized) {
      loadAvailableSchemas();
    }
  }, [isInitialized]);

  const loadAvailableSchemas = async () => {
    try {
      // Create schemas for sample datasets first
      const schemas: TableSchema[] = SAMPLE_DATASETS.map(dataset => ({
        name: dataset.id,
        columns: [],
        rowCount: dataset.rows,
        createdAt: new Date()
      }));

      try {
        const tableNames = await listTables();
        
        // Add any additional tables from the DataPrism engine
        for (const tableName of tableNames) {
          if (!schemas.find(s => s.name === tableName)) {
            try {
              const tableInfo = await getTableInfo(tableName);
              schemas.push({
                name: tableName,
                columns: tableInfo.columns || [],
                rowCount: tableInfo.rowCount || 0,
                createdAt: new Date()
              });
            } catch (err) {
              console.warn(`Failed to get info for table ${tableName}:`, err);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to list tables from engine, using sample datasets only:', err);
      }

      setAvailableSchemas(schemas);
    } catch (err) {
      console.warn('Failed to load schemas:', err);
      // Fallback to empty schemas if everything fails
      setAvailableSchemas([]);
    }
  };

  const handleQueryExecution = async (sql: string): Promise<QueryResult> => {
    setIsExecuting(true);
    
    try {
      const startTime = Date.now();
      
      // For demo purposes, we'll simulate query execution
      // In a real implementation, this would use the DataPrism engine
      const mockResult = await simulateQuery(sql);
      
      const executionTime = Date.now() - startTime;
      
      const result: QueryResult = {
        data: mockResult.data,
        metadata: {
          rowCount: mockResult.data.length,
          columnCount: mockResult.data.length > 0 ? Object.keys(mockResult.data[0]).length : 0,
          executionTime,
          memoryUsage: mockResult.data.length * 1024, // Rough estimate
          columns: mockResult.data.length > 0 ? Object.keys(mockResult.data[0]).map(name => ({
            name,
            type: inferColumnType(mockResult.data[0][name]),
            nullable: true
          })) : [],
          queryId: `query_${Date.now()}`,
          timestamp: new Date()
        },
        performance: {
          executionTime,
          memoryPeak: mockResult.data.length * 512,
          memoryAverage: mockResult.data.length * 256,
          cpuTime: executionTime * 0.8,
          ioOperations: Math.floor(mockResult.data.length / 1000),
          cacheHits: Math.floor(Math.random() * 100),
          cacheMisses: Math.floor(Math.random() * 20)
        }
      };

      setQueryResult(result);
      return result;
      
    } catch (error) {
      const errorResult: QueryResult = {
        data: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          executionTime: 0,
          memoryUsage: 0,
          columns: [],
          queryId: `query_error_${Date.now()}`,
          timestamp: new Date()
        },
        performance: {
          executionTime: 0,
          memoryPeak: 0,
          memoryAverage: 0,
          cpuTime: 0,
          ioOperations: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        error: error instanceof Error ? error.message : 'Query execution failed'
      };

      setQueryResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateQuery = async (sql: string): Promise<{ data: any[] }> => {
    // Simulate query processing delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));

    const sqlLower = sql.toLowerCase().trim();
    
    // Check for syntax errors
    if (!sqlLower.includes('select') && !sqlLower.includes('show') && !sqlLower.includes('describe')) {
      throw new Error('Only SELECT, SHOW, and DESCRIBE statements are supported in demo mode');
    }

    // Extract table name (simplified)
    const tableMatch = sql.match(/from\s+(\w+)/i);
    const tableName = tableMatch ? tableMatch[1] : null;

    // Find matching sample dataset
    const dataset = SAMPLE_DATASETS.find(ds => 
      ds.id === tableName || 
      ds.name.toLowerCase().includes(tableName?.toLowerCase() || '') ||
      tableName === 'your_table'
    );

    if (!dataset) {
      // Return a generic result for unknown tables
      return {
        data: [
          { message: 'Demo data', status: 'available', tables: SAMPLE_DATASETS.length },
          { message: 'Replace "your_table" with one of the sample table names', status: 'info', tables: SAMPLE_DATASETS.length }
        ]
      };
    }

    // Generate data from the sample dataset
    const fullData = await dataset.generator();
    
    // Parse LIMIT clause (simplified)
    const limitMatch = sql.match(/limit\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1]) : Math.min(100, fullData.length);
    
    // Apply basic filtering and limiting
    let resultData = fullData.slice(0, limit);

    // Handle aggregation queries (simplified)
    if (sqlLower.includes('count(') || sqlLower.includes('sum(') || sqlLower.includes('avg(')) {
      if (sqlLower.includes('group by')) {
        // Simplified GROUP BY handling
        const firstColumn = Object.keys(fullData[0] || {})[0];
        const groups = new Map();
        
        fullData.forEach(row => {
          const key = row[firstColumn];
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key).push(row);
        });

        resultData = Array.from(groups.entries()).map(([key, rows]) => ({
          [firstColumn]: key,
          count: rows.length,
          avg_value: rows.reduce((sum, r) => sum + (Number(Object.values(r)[1]) || 0), 0) / rows.length
        })).slice(0, limit);
      } else {
        // Simple aggregation
        resultData = [{
          total_rows: fullData.length,
          first_column: Object.keys(fullData[0] || {})[0] || 'unknown'
        }];
      }
    }

    return { data: resultData };
  };

  const inferColumnType = (value: any): 'string' | 'number' | 'date' | 'boolean' => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
    return 'string';
  };

  const handleSchemaSelect = (schema: TableSchema) => {
    setSelectedSchema(schema);
    // Update query to use the selected table
    const newQuery = `-- Query ${schema.name} dataset (${schema.rowCount.toLocaleString()} rows)\nSELECT * FROM ${schema.name} LIMIT 10;`;
    setSqlQuery(newQuery);
  };

  const handleVisualize = (data: any[]) => {
    // In a real implementation, this would navigate to the visualization page
    // with the query results as data source
    console.log('Visualizing data:', data.length, 'rows');
    alert(`Ready to visualize ${data.length} rows! This would open the visualization page in a full implementation.`);
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
              Initializing DataPrism Query Engine
            </h2>
            <p className="text-gray-600">
              Loading SQL execution capabilities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Query Lab</h1>
        <p className="text-xl text-gray-600">
          Write SQL queries and explore your data with DataPrism's high-performance engine
        </p>
      </div>

      {/* Engine Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            DataPrism Query Engine Ready
          </span>
          {availableSchemas.length > 0 && (
            <span className="text-green-700">
              • {availableSchemas.length} table{availableSchemas.length === 1 ? '' : 's'} available
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Available Tables */}
          {availableSchemas.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Table className="w-4 h-4 mr-2" />
                Available Tables
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {availableSchemas.map(schema => (
                  <button
                    key={schema.name}
                    onClick={() => handleSchemaSelect(schema)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedSchema?.name === schema.name
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{schema.name}</div>
                    <div className="text-sm text-gray-500">
                      {schema.rowCount.toLocaleString()} rows
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Click to query this table
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query Guide */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Quick Guide
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <div className="font-medium text-gray-800">Basic Query:</div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  SELECT * FROM table_name LIMIT 10
                </code>
              </div>
              <div>
                <div className="font-medium text-gray-800">Aggregation:</div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  SELECT category, COUNT(*) FROM table_name GROUP BY category
                </code>
              </div>
              <div>
                <div className="font-medium text-gray-800">Keyboard Shortcuts:</div>
                <div className="text-xs">
                  <div>⌘+Enter: Execute Query</div>
                  <div>⌘+S: Save Query</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* SQL Editor */}
          <div className="bg-white rounded-lg overflow-hidden">
            <MonacoSQLEditor
              value={sqlQuery}
              onChange={setSqlQuery}
              onExecute={handleQueryExecution}
              schemas={availableSchemas}
              disabled={isExecuting}
              className="h-80"
            />
          </div>

          {/* Query Results */}
          {queryResult && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Query Results
                  </h2>
                  {queryResult.error ? (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Query Failed</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Query Successful</span>
                    </div>
                  )}
                </div>
              </div>
              
              <QueryResultsViewer
                result={queryResult}
                onVisualize={handleVisualize}
                className="p-4"
              />
            </div>
          )}

          {/* Getting Started */}
          {!queryResult && !isExecuting && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Execute Queries
              </h3>
              <p className="text-gray-600 mb-4">
                Write your SQL query above and press "Run Query" or use Cmd+Enter to execute.
              </p>
              <p className="text-sm text-gray-500">
                Select a table from the sidebar to get started, or modify the example query above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryLabPage;