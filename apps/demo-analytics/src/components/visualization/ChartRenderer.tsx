import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartConfiguration as ChartJSConfig,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { AlertCircle, Download } from 'lucide-react';
import type { ChartConfiguration } from '@/types/data';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartRendererProps {
  config: ChartConfiguration;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  className?: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  config, 
  onExport, 
  className = '' 
}) => {
  const chartRef = useRef<ChartJS>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Process data based on chart configuration
  const processedData = React.useMemo(() => {
    if (!config.data || config.data.length === 0) {
      return null;
    }

    const { dimensions, data, styling } = config;
    const chartType = config.type.id;

    // Extract unique categories for x-axis
    const categories = [...new Set(data.map(row => row[dimensions.x]))];
    
    // Handle different chart types
    switch (chartType) {
      case 'bar':
      case 'line':
      case 'area': {
        // Group data by category if grouping is specified
        if (dimensions.group) {
          const groups = [...new Set(data.map(row => row[dimensions.group!]))];
          const datasets = groups.map((group, index) => {
            const groupData = categories.map(category => {
              const rows = data.filter(row => 
                row[dimensions.x] === category && row[dimensions.group!] === group
              );
              // Sum values for the same category
              return rows.reduce((sum, row) => sum + (Number(row[dimensions.y]) || 0), 0);
            });

            return {
              label: String(group),
              data: groupData,
              backgroundColor: chartType === 'line' ? 'transparent' : styling.colors[index % styling.colors.length],
              borderColor: styling.colors[index % styling.colors.length],
              borderWidth: chartType === 'line' ? 2 : 1,
              fill: chartType === 'area'
            };
          });

          return { labels: categories, datasets };
        } else {
          // Single dataset
          const values = categories.map(category => {
            const rows = data.filter(row => row[dimensions.x] === category);
            return rows.reduce((sum, row) => sum + (Number(row[dimensions.y]) || 0), 0);
          });

          return {
            labels: categories,
            datasets: [{
              label: dimensions.y as string,
              data: values,
              backgroundColor: chartType === 'line' ? 'transparent' : styling.colors[0],
              borderColor: styling.colors[0],
              borderWidth: chartType === 'line' ? 2 : 1,
              fill: chartType === 'area'
            }]
          };
        }
      }

      case 'pie': {
        // Aggregate data by category
        const aggregatedData = categories.map(category => {
          const rows = data.filter(row => row[dimensions.x] === category);
          return rows.reduce((sum, row) => sum + (Number(row[dimensions.y]) || 0), 0);
        });

        return {
          labels: categories,
          datasets: [{
            data: aggregatedData,
            backgroundColor: styling.colors.slice(0, categories.length),
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        };
      }

      case 'scatter': {
        const scatterData = data
          .filter(row => row[dimensions.x] != null && row[dimensions.y] != null)
          .map(row => ({
            x: Number(row[dimensions.x]) || 0,
            y: Number(row[dimensions.y]) || 0
          }));

        return {
          datasets: [{
            label: `${dimensions.x} vs ${dimensions.y}`,
            data: scatterData,
            backgroundColor: styling.colors[0],
            borderColor: styling.colors[0],
            showLine: false
          }]
        };
      }

      default:
        return null;
    }
  }, [config]);

  // Chart.js options
  const chartOptions: ChartOptions = React.useMemo(() => {
    const { styling, type, dimensions } = config;
    
    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!styling.title,
          text: styling.title,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top' as const
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: false
        }
      }
    };

    // Add scales for non-pie charts
    if (type.id !== 'pie') {
      baseOptions.scales = {
        x: {
          title: {
            display: true,
            text: styling.xAxisLabel || dimensions.x
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          title: {
            display: true,
            text: styling.yAxisLabel || (dimensions.y as string)
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          beginAtZero: true
        }
      };
    }

    return baseOptions;
  }, [config]);

  // Export functionality
  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    if (!chartRef.current) return;

    if (format === 'png') {
      const canvas = chartRef.current.canvas;
      const link = document.createElement('a');
      link.download = `${config.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas?.toDataURL('image/png') || '';
      link.click();
    }

    onExport?.(format);
  };

  if (!processedData) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center space-y-2">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-500">No data available for visualization</p>
          <p className="text-sm text-gray-400">Please configure your chart and ensure data is loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{config.name}</h3>
          <p className="text-sm text-gray-500">
            {config.type.name} • {config.data.length.toLocaleString()} data points
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('png')}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Export as PNG"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef}
        className="p-4"
        style={{ 
          width: config.styling.width || 800,
          height: config.styling.height || 400 
        }}
      >
        <Chart
          ref={chartRef}
          type={config.type.id === 'area' ? 'line' : config.type.id as any}
          data={processedData as ChartData}
          options={chartOptions}
        />
      </div>

      {/* Chart Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Library: Chart.js</span>
            <span>Type: {config.type.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>X: {config.dimensions.x}</span>
            <span>Y: {config.dimensions.y as string}</span>
            {config.dimensions.group && <span>Group: {config.dimensions.group}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartRenderer;