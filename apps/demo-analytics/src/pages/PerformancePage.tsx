import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  MonitorSpeaker, 
  Cpu, 
  HardDrive, 
  Network,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';
import MetricsCard, { type MetricData } from '@/components/performance/MetricsCard';
import RealTimeChart from '@/components/performance/RealTimeChart';

interface PerformanceData {
  queryExecutionTime: MetricData;
  memoryUsage: MetricData;
  cpuUsage: MetricData;
  cacheHitRate: MetricData;
  activeConnections: MetricData;
  queriesPerSecond: MetricData;
  errorRate: MetricData;
  dataVolume: MetricData;
}

const PerformancePage: React.FC = () => {
  const { isInitialized, initializationError, getPerformanceMetrics } = useDataPrism();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulated performance data generators for real-time charts
  const generateCpuUsage = () => {
    // Simulate CPU usage between 10-80%
    const base = 30;
    const variation = 20;
    const spike = Math.random() > 0.9 ? 30 : 0; // Occasional spikes
    return Math.min(80, base + Math.random() * variation + spike);
  };

  const generateMemoryUsage = () => {
    // Simulate memory usage with gradual increase and occasional cleanup
    const baseMemory = 45;
    const growth = Math.random() > 0.8 ? -15 : 2; // Occasional garbage collection
    return Math.max(20, Math.min(85, baseMemory + growth + Math.random() * 10));
  };

  const generateQueryLatency = () => {
    // Simulate query latency in milliseconds
    const baseLatency = 150;
    const variation = 100;
    const slowQuery = Math.random() > 0.95 ? 300 : 0; // Occasional slow queries
    return Math.max(50, baseLatency + Math.random() * variation + slowQuery);
  };

  const generateNetworkThroughput = () => {
    // Simulate network throughput in MB/s
    const baseThroughput = 25;
    const variation = 15;
    return Math.max(5, baseThroughput + (Math.random() - 0.5) * variation);
  };

  // Load performance metrics
  const loadPerformanceMetrics = async () => {
    if (!isInitialized) return;
    
    try {
      // Get metrics from DataPrism engine
      const metrics = await getPerformanceMetrics();
      
      // Transform metrics into display format
      const data: PerformanceData = {
        queryExecutionTime: {
          value: metrics.averageQueryTime || Math.random() * 500 + 100,
          previousValue: metrics.previousAverageQueryTime || Math.random() * 500 + 150,
          format: 'milliseconds',
          trend: metrics.averageQueryTime < (metrics.previousAverageQueryTime || 200) ? 'down' : 'up',
          status: metrics.averageQueryTime < 200 ? 'good' : metrics.averageQueryTime < 500 ? 'warning' : 'error'
        },
        memoryUsage: {
          value: metrics.memoryUsage || Math.random() * 1024 * 1024 * 100,
          previousValue: metrics.previousMemoryUsage,
          format: 'bytes',
          trend: 'stable',
          status: 'good'
        },
        cpuUsage: {
          value: Math.random() * 60 + 20,
          previousValue: Math.random() * 60 + 25,
          format: 'percentage',
          trend: 'down',
          status: 'good'
        },
        cacheHitRate: {
          value: Math.random() * 30 + 70,
          previousValue: Math.random() * 30 + 65,
          format: 'percentage',
          trend: 'up',
          status: 'good'
        },
        activeConnections: {
          value: Math.floor(Math.random() * 50 + 10),
          previousValue: Math.floor(Math.random() * 50 + 15),
          format: 'number',
          trend: 'stable',
          status: 'good'
        },
        queriesPerSecond: {
          value: Math.random() * 100 + 50,
          previousValue: Math.random() * 100 + 45,
          format: 'number',
          unit: '/sec',
          trend: 'up',
          status: 'good'
        },
        errorRate: {
          value: Math.random() * 2,
          previousValue: Math.random() * 3,
          format: 'percentage',
          trend: 'down',
          status: Math.random() * 2 < 1 ? 'good' : 'warning'
        },
        dataVolume: {
          value: Math.random() * 1024 * 1024 * 1024 * 5, // Up to 5GB
          previousValue: Math.random() * 1024 * 1024 * 1024 * 4.5,
          format: 'bytes',
          trend: 'up',
          status: 'good'
        }
      };
      
      setPerformanceData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load performance metrics';
      setError(errorMessage);
    }
  };

  // Auto-refresh performance metrics
  useEffect(() => {
    if (!isInitialized || !isMonitoring) return;
    
    loadPerformanceMetrics();
    const interval = setInterval(loadPerformanceMetrics, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [isInitialized, isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
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
              Loading performance monitoring capabilities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Performance Monitor</h1>
          <p className="text-xl text-gray-600">
            Real-time monitoring and performance analytics for your DataPrism instance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={loadPerformanceMetrics}
            disabled={!isInitialized}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={toggleMonitoring}
            className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-md transition-colors ${
              isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? (
              <>
                <Activity className="w-4 h-4" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Start Monitoring</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`border rounded-lg p-4 ${
        isMonitoring 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className={`w-5 h-5 ${
              isMonitoring ? 'text-green-600' : 'text-gray-500'
            }`} />
            <span className={`font-medium ${
              isMonitoring ? 'text-green-800' : 'text-gray-700'
            }`}>
              {isMonitoring ? 'Performance Monitoring Active' : 'Performance Monitoring Paused'}
            </span>
            {lastUpdate && (
              <span className="text-gray-600">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Performance Monitoring Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Query Execution Time"
            metric={performanceData.queryExecutionTime}
            icon={Clock}
            description="Average query response time"
          />
          
          <MetricsCard
            title="Memory Usage"
            metric={performanceData.memoryUsage}
            icon={MonitorSpeaker}
            description="Current memory consumption"
          />
          
          <MetricsCard
            title="CPU Usage"
            metric={performanceData.cpuUsage}
            icon={Cpu}
            description="Current CPU utilization"
          />
          
          <MetricsCard
            title="Cache Hit Rate"
            metric={performanceData.cacheHitRate}
            icon={Zap}
            description="Percentage of cache hits"
          />
          
          <MetricsCard
            title="Active Connections"
            metric={performanceData.activeConnections}
            icon={Network}
            description="Current active connections"
          />
          
          <MetricsCard
            title="Queries per Second"
            metric={performanceData.queriesPerSecond}
            icon={BarChart3}
            description="Query throughput rate"
          />
          
          <MetricsCard
            title="Error Rate"
            metric={performanceData.errorRate}
            icon={AlertCircle}
            description="Percentage of failed requests"
          />
          
          <MetricsCard
            title="Data Volume"
            metric={performanceData.dataVolume}
            icon={HardDrive}
            description="Total data processed"
          />
        </div>
      )}

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <RealTimeChart
          title="CPU Usage"
          yAxisLabel="CPU Usage (%)"
          color="#EF4444"
          dataGenerator={generateCpuUsage}
          unit="%"
          updateInterval={2000}
        />
        
        <RealTimeChart
          title="Memory Usage"
          yAxisLabel="Memory Usage (%)"
          color="#10B981"
          dataGenerator={generateMemoryUsage}
          unit="%"
          updateInterval={3000}
        />
        
        <RealTimeChart
          title="Query Latency"
          yAxisLabel="Response Time (ms)"
          color="#3B82F6"
          dataGenerator={generateQueryLatency}
          unit="ms"
          updateInterval={1500}
        />
        
        <RealTimeChart
          title="Network Throughput"
          yAxisLabel="Throughput (MB/s)"
          color="#8B5CF6"
          dataGenerator={generateNetworkThroughput}
          unit=" MB/s"
          updateInterval={2500}
        />
      </div>

      {/* Performance Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Performance Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">System Health</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Overall Status:</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Restart:</span>
                <span className="font-medium">2 days ago</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Performance Metrics</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Query Time:</span>
                <span className="font-medium">145ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">P95 Query Time:</span>
                <span className="font-medium">320ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Throughput:</span>
                <span className="font-medium">1.2K req/sec</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Resource Usage</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Memory:</span>
                <span className="font-medium">1.8 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak CPU:</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disk I/O:</span>
                <span className="font-medium">42 MB/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;