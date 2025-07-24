import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface RealTimeChartProps {
  title: string;
  yAxisLabel?: string;
  color?: string;
  fillArea?: boolean;
  maxDataPoints?: number;
  updateInterval?: number;
  dataGenerator: () => number;
  unit?: string;
  height?: number;
  className?: string;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  title,
  yAxisLabel,
  color = '#3B82F6',
  fillArea = true,
  maxDataPoints = 50,
  updateInterval = 1000,
  dataGenerator,
  unit = '',
  height = 300,
  className = ''
}) => {
  const chartRef = useRef<ChartJS>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({
    current: 0,
    avg: 0,
    min: 0,
    max: 0
  });

  // Generate new data point
  const addDataPoint = () => {
    const now = Date.now();
    const value = dataGenerator();
    
    setData(prevData => {
      const newData = [
        ...prevData,
        { timestamp: now, value }
      ];
      
      // Keep only the last maxDataPoints
      if (newData.length > maxDataPoints) {
        return newData.slice(-maxDataPoints);
      }
      
      return newData;
    });
  };

  // Update statistics
  useEffect(() => {
    if (data.length === 0) return;
    
    const values = data.map(d => d.value);
    const current = values[values.length - 1];
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    setStats({ current, avg, min, max });
  }, [data]);

  // Start/stop data collection
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(addDataPoint, updateInterval);
      // Add initial data point
      if (data.length === 0) {
        addDataPoint();
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateInterval]);

  // Chart data configuration
  const chartData: ChartData<'line'> = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: yAxisLabel || title,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: fillArea ? `${color}20` : 'transparent',
        fill: fillArea,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4
      }
    ]
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Disable animation for real-time updates
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yAxisLabel || title
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}${unit}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const togglePlayback = () => {
    setIsRunning(!isRunning);
  };

  const resetData = () => {
    setData([]);
    setStats({ current: 0, avg: 0, min: 0, max: 0 });
  };

  const exportData = () => {
    const csvContent = [
      'Timestamp,Value',
      ...data.map(d => `${new Date(d.timestamp).toISOString()},${d.value}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatValue = (value: number) => {
    return `${value.toFixed(2)}${unit}`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            {data.length} data points • Updated every {updateInterval / 1000}s
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayback}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isRunning
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            )}
          </button>
          
          <button
            onClick={resetData}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={exportData}
            disabled={data.length === 0}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      {data.length > 0 && (
        <div className="grid grid-cols-4 divide-x divide-gray-200 bg-gray-50">
          <div className="p-3 text-center">
            <div className="text-sm text-gray-500">Current</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatValue(stats.current)}
            </div>
          </div>
          <div className="p-3 text-center">
            <div className="text-sm text-gray-500">Average</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatValue(stats.avg)}
            </div>
          </div>
          <div className="p-3 text-center">
            <div className="text-sm text-gray-500">Minimum</div>
            <div className="text-lg font-semibold text-green-600">
              {formatValue(stats.min)}
            </div>
          </div>
          <div className="p-3 text-center">
            <div className="text-sm text-gray-500">Maximum</div>
            <div className="text-lg font-semibold text-red-600">
              {formatValue(stats.max)}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-4">
        <div style={{ height }}>
          {data.length > 0 ? (
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No Data Available</div>
                <div className="text-sm">Chart will appear when data collection starts</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;