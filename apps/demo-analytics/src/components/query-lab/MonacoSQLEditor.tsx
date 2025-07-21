import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save, History, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QueryResult, TableSchema } from '@/types/data';

interface MonacoSQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: (sql: string) => Promise<QueryResult>;
  schemas?: TableSchema[];
  theme?: 'light' | 'dark';
  className?: string;
  disabled?: boolean;
}

// SQL Keywords and functions for auto-completion
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN',
  'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'INSERT INTO', 'UPDATE', 'DELETE', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'EXISTS'
];

const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'FLOOR', 'CEIL', 'ABS',
  'UPPER', 'LOWER', 'LENGTH', 'TRIM', 'SUBSTRING', 'CONCAT',
  'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'DATE_FORMAT', 'YEAR', 'MONTH', 'DAY',
  'CAST', 'CONVERT', 'COALESCE', 'NULLIF'
];

const SAMPLE_QUERIES = [
  {
    name: 'Basic Selection',
    sql: 'SELECT * FROM your_table LIMIT 10;'
  },
  {
    name: 'Grouped Analytics',
    sql: `SELECT 
  category,
  COUNT(*) as count,
  AVG(price) as avg_price,
  SUM(quantity) as total_quantity
FROM your_table 
GROUP BY category 
ORDER BY count DESC;`
  },
  {
    name: 'Date Range Analysis',
    sql: `SELECT 
  DATE_FORMAT(date_column, '%Y-%m') as month,
  COUNT(*) as records,
  SUM(amount) as total_amount
FROM your_table 
WHERE date_column >= '2024-01-01'
GROUP BY DATE_FORMAT(date_column, '%Y-%m')
ORDER BY month;`
  },
  {
    name: 'Top N Analysis',
    sql: `SELECT 
  product_name,
  SUM(sales_amount) as total_sales,
  COUNT(*) as order_count
FROM your_table 
GROUP BY product_name 
ORDER BY total_sales DESC 
LIMIT 10;`
  }
];

export const MonacoSQLEditor: React.FC<MonacoSQLEditorProps> = ({
  value,
  onChange,
  onExecute,
  schemas = [],
  theme = 'light',
  className,
  disabled = false
}) => {
  const editorRef = useRef<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<Array<{
    sql: string;
    timestamp: Date;
    success: boolean;
    executionTime?: number;
  }>>([]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure SQL language features
    monaco.languages.setMonarchTokensProvider('sql', {
      tokenizer: {
        root: [
          [/\b(?:SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING|LIMIT)\b/i, 'keyword'],
          [/\b(?:COUNT|SUM|AVG|MIN|MAX|UPPER|LOWER|LENGTH)\b/i, 'function'],
          [/\b(?:AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL)\b/i, 'operator'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/"([^"\\]|\\.)*"/, 'string'],
          [/\d+(\.\d+)?/, 'number'],
          [/--.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment']
        ]
      }
    });

    // Auto-completion provider
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [];

        // Add SQL keywords
        for (const keyword of SQL_KEYWORDS) {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            detail: 'SQL Keyword'
          });
        }

        // Add SQL functions
        for (const func of SQL_FUNCTIONS) {
          suggestions.push({
            label: func,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `${func}()`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'SQL Function'
          });
        }

        // Add table names from schemas
        for (const schema of schemas) {
          suggestions.push({
            label: schema.name,
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: schema.name,
            detail: `Table (${schema.columns.length} columns)`
          });

          // Add column names for this table
          for (const column of schema.columns) {
            suggestions.push({
              label: `${schema.name}.${column.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `${schema.name}.${column.name}`,
              detail: `Column (${column.type})`
            });
          }
        }

        return { suggestions };
      }
    });

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      }
    });

    // Add keyboard shortcuts
    editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleExecute()
    });

    editor.addAction({
      id: 'save-query',
      label: 'Save Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => handleSave()
    });
  };

  const handleExecute = async () => {
    if (!value.trim() || isExecuting || disabled) return;

    const sql = value.trim();
    setIsExecuting(true);

    try {
      const startTime = Date.now();
      const result = await onExecute(sql);
      const executionTime = Date.now() - startTime;

      setLastResult(result);
      
      // Add to execution history
      setExecutionHistory(prev => [{
        sql,
        timestamp: new Date(),
        success: !result.error,
        executionTime
      }, ...prev.slice(0, 19)]); // Keep last 20 executions

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query execution failed';
      setLastResult({
        data: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          executionTime: 0,
          memoryUsage: 0,
          columns: [],
          queryId: '',
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
        error: errorMessage
      });

      setExecutionHistory(prev => [{
        sql,
        timestamp: new Date(),
        success: false
      }, ...prev.slice(0, 19)]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = () => {
    // In a real implementation, this would save to persistent storage
    const queryName = `Query_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    const savedQueries = JSON.parse(localStorage.getItem('saved_queries') || '[]');
    
    savedQueries.push({
      name: queryName,
      sql: value,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('saved_queries', JSON.stringify(savedQueries.slice(-50))); // Keep last 50
    
    // Show success feedback (in a real app, you'd use a toast notification)
    console.log('Query saved:', queryName);
  };

  const handleSampleSelect = (sampleQuery: typeof SAMPLE_QUERIES[0]) => {
    onChange(sampleQuery.sql);
    setShowSamples(false);
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className={cn("flex flex-col border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting || disabled || !value.trim()}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
              isExecuting || disabled || !value.trim()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
            <kbd className="hidden sm:inline-block text-xs bg-white/20 px-1.5 py-0.5 rounded">
              ⌘↵
            </kbd>
          </button>

          <button
            onClick={handleSave}
            disabled={disabled || !value.trim()}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => setShowSamples(!showSamples)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Samples</span>
          </button>

          {executionHistory.length > 0 && (
            <button
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{executionHistory.length}</span>
            </button>
          )}
        </div>

        {lastResult && (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {lastResult.error ? (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </div>
            ) : (
              <>
                <span>{lastResult.metadata.rowCount.toLocaleString()} rows</span>
                <span>•</span>
                <span>{formatExecutionTime(lastResult.metadata.executionTime)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sample Queries */}
      {showSamples && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SAMPLE_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSampleSelect(query)}
                className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-blue-900 text-sm">{query.name}</div>
                <div className="text-xs text-blue-600 mt-1 font-mono truncate">
                  {query.sql.split('\n')[0]}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language="sql"
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: disabled,
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>SQL</span>
          {schemas.length > 0 && (
            <span>{schemas.length} table{schemas.length === 1 ? '' : 's'} available</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Ln {editorRef.current?.getPosition?.()?.lineNumber || 1}</span>
          <span>Col {editorRef.current?.getPosition?.()?.column || 1}</span>
        </div>
      </div>
    </div>
  );
};

export default MonacoSQLEditor;