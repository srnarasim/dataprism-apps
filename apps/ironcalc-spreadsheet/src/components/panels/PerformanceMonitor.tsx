import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Memory, Zap, X, Activity } from 'lucide-react';
import { useIronCalc } from '@contexts/IronCalcContext';

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PerformanceMonitor({ isOpen, onClose }: PerformanceMonitorProps) {
  const { getPerformanceMetrics } = useIronCalc();
  const [metrics, setMetrics] = useState(() => getPerformanceMetrics());
  const [realTimeData, setRealTimeData] = useState<Array<{ time: number; value: number }>>([]);

  // Update metrics every second
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const newMetrics = getPerformanceMetrics();
      setMetrics(newMetrics);
      
      // Add to real-time data for charts
      setRealTimeData(prev => {
        const newData = [...prev, { 
          time: Date.now(), 
          value: newMetrics.formulaEvaluations.averageTime 
        }].slice(-30); // Keep last 30 data points
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, getPerformanceMetrics]);

  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)}KB`;
    if (mb < 1024) return `${mb.toFixed(1)}MB`;
    return `${(mb / 1024).toFixed(2)}GB`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 max-w-4xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 size={20} className="mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Performance Monitor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Formula Evaluations */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Zap size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Formulas</span>
                </div>
                <span className="text-2xl font-bold text-blue-900">
                  {metrics.formulaEvaluations.total}
                </span>
              </div>
              <div className="text-xs text-blue-700">
                <div>Avg: {formatTime(metrics.formulaEvaluations.averageTime)}</div>
                <div>P95: {formatTime(metrics.formulaEvaluations.p95Time)}</div>
                <div>Errors: {metrics.formulaEvaluations.errorsCount}</div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Memory size={16} className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Memory</span>
                </div>
                <span className="text-2xl font-bold text-green-900">
                  {formatMemory(metrics.memoryUsage.totalMB)}
                </span>
              </div>
              <div className="text-xs text-green-700">
                <div>Plugin: {formatMemory(metrics.memoryUsage.pluginMB)}</div>
                <div>App: {formatMemory(metrics.memoryUsage.applicationMB)}</div>
              </div>
            </div>

            {/* User Interactions */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Activity size={16} className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Activity</span>
                </div>
                <span className="text-2xl font-bold text-purple-900">
                  {metrics.interactions.cellEdits}
                </span>
              </div>
              <div className="text-xs text-purple-700">
                <div>Formulas: {metrics.interactions.formulaCreations}</div>
                <div>Files: {metrics.interactions.fileOperations}</div>
              </div>
            </div>

            {/* Plugin Performance */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock size={16} className="text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">Plugin</span>
                </div>
                <span className="text-2xl font-bold text-orange-900">
                  {formatTime(metrics.pluginMetrics.apiLatency)}
                </span>
              </div>
              <div className="text-xs text-orange-700">
                <div>Init: {formatTime(metrics.pluginMetrics.initializationTime)}</div>
                <div>Errors: {(metrics.pluginMetrics.errorRate * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formula Performance Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Formula Evaluation Times</h3>
              <div className="h-32 flex items-end space-x-1">
                {realTimeData.map((point, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 flex-1 min-w-0"
                    style={{
                      height: `${Math.max(2, (point.value / 100) * 100)}%`,
                      opacity: 0.3 + (index / realTimeData.length) * 0.7
                    }}
                    title={`${formatTime(point.value)} at ${new Date(point.time).toLocaleTimeString()}`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Real-time formula evaluation performance
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Performance Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Formula Evaluation</span>
                    <span>{formatTime(metrics.formulaEvaluations.averageTime)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (metrics.formulaEvaluations.averageTime / 100) * 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Plugin API Latency</span>
                    <span>{formatTime(metrics.pluginMetrics.apiLatency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (metrics.pluginMetrics.apiLatency / 50) * 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Error Rate</span>
                    <span>{(metrics.pluginMetrics.errorRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${metrics.pluginMetrics.errorRate * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Recommendations */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Performance Recommendations</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              {metrics.formulaEvaluations.averageTime > 100 && (
                <div>• Consider simplifying complex formulas to improve evaluation speed</div>
              )}
              {metrics.memoryUsage.totalMB > 500 && (
                <div>• Memory usage is high - consider clearing unused cells</div>
              )}
              {metrics.pluginMetrics.errorRate > 0.1 && (
                <div>• High error rate detected - check formula syntax and references</div>
              )}
              {metrics.formulaEvaluations.total === 0 && (
                <div>• No formulas evaluated yet - create some formulas to see performance data</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Performance data updates every second</span>
            <button
              onClick={() => {
                setRealTimeData([]);
                // Reset metrics would go here
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}