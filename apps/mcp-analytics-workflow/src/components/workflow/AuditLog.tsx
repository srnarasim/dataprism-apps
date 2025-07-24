import React, { useState, useEffect } from 'react';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  source: string;
}

interface AuditLogProps {
  workflowId: string | null;
}

export const AuditLog: React.FC<AuditLogProps> = ({ workflowId }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  useEffect(() => {
    // Mock audit log entries for demonstration
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000),
        level: 'info',
        message: 'Workflow initialization started',
        source: 'workflow-engine',
        details: { workflowId }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 290000),
        level: 'success',
        message: 'DataPrism engine connected successfully',
        source: 'dataprism-core'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 280000),
        level: 'info',
        message: 'MCP server connection established',
        source: 'mcp-integration',
        details: { serverUrl: 'mock-enrichment-server' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 270000),
        level: 'info',
        message: 'Step execution started: Data Upload & Validation',
        source: 'workflow-engine',
        details: { stepId: 'data-upload', stepType: 'data-input' }
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 260000),
        level: 'success',
        message: 'CSV file parsed successfully - 50 rows, 4 columns',
        source: 'csv-importer',
        details: { rowCount: 50, columnCount: 4 }
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 250000),
        level: 'info',
        message: 'Step execution started: Product Categorization (MCP)',
        source: 'workflow-engine',
        details: { stepId: 'external-enrichment', stepType: 'mcp-tool' }
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 240000),
        level: 'warning',
        message: 'MCP tool response time exceeded 2s threshold',
        source: 'mcp-integration',
        details: { responseTime: 2543, threshold: 2000 }
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 230000),
        level: 'success',
        message: 'Product categorization completed - 50 products enriched',
        source: 'mcp-integration',
        details: { processedCount: 50, categoriesAdded: 12 }
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 220000),
        level: 'info',
        message: 'Step execution started: Spreadsheet Calculations',
        source: 'workflow-engine',
        details: { stepId: 'calculations', stepType: 'data-processor' }
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 210000),
        level: 'success',
        message: 'IronCalc formulas executed successfully',
        source: 'ironcalc-formula',
        details: { formulasExecuted: 3, executionTime: 156 }
      }
    ];

    setLogs(mockLogs);
  }, [workflowId]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📝';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      source: log.source,
      message: log.message,
      details: log.details
    }));
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Workflow Audit Log</h3>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <button
              onClick={exportLogs}
              className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors"
            >
              📥 Export
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No audit log entries</p>
            <p className="text-sm">Logs will appear here as the workflow executes</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{getLevelIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{log.source}</span>
                      <span className="text-xs text-gray-400">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{log.message}</p>
                    {log.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          View details
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-gray-700 overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        Showing {filteredLogs.length} of {logs.length} log entries
        {workflowId && (
          <span className="ml-2">• Workflow: {workflowId}</span>
        )}
      </div>
    </div>
  );
};