import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, LineChart, PieChart, ScatterChart, Activity } from 'lucide-react';
import type { ChartConfiguration, ColumnDefinition, ChartType } from '@/types/data';

interface ChartConfigPanelProps {
  data: any[];
  availableColumns: ColumnDefinition[];
  onConfigChange: (config: ChartConfiguration) => void;
  initialConfig?: ChartConfiguration | null;
  className?: string;
}

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, library: 'chartjs' },
  { id: 'line', name: 'Line Chart', icon: LineChart, library: 'chartjs' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, library: 'chartjs' },
  { id: 'scatter', name: 'Scatter Plot', icon: ScatterChart, library: 'chartjs' },
  { id: 'area', name: 'Area Chart', icon: Activity, library: 'chartjs' },
] as const;

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
];

const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
  data,
  availableColumns,
  onConfigChange,
  initialConfig,
  className = ''
}) => {
  const [selectedType, setSelectedType] = useState<string>(initialConfig?.type.id || 'bar');
  const [title, setTitle] = useState(initialConfig?.name || 'New Chart');
  const [xField, setXField] = useState<string>(initialConfig?.dimensions.x || '');
  const [yField, setYField] = useState<string>(initialConfig?.dimensions.y as string || '');
  const [colorField, setColorField] = useState<string>(initialConfig?.dimensions.color || '');
  const [groupField, setGroupField] = useState<string>(initialConfig?.dimensions.group || '');

  // Get appropriate columns for different field types
  const numericColumns = availableColumns.filter(col => col.type === 'number');
  const categoricalColumns = availableColumns.filter(col => col.type === 'string');
  const dateColumns = availableColumns.filter(col => col.type === 'date');
  const allColumns = availableColumns;

  // Auto-select appropriate default fields when chart type changes
  useEffect(() => {
    if (!xField && allColumns.length > 0) {
      // Default X field selection logic
      const defaultX = categoricalColumns[0]?.name || dateColumns[0]?.name || allColumns[0]?.name;
      setXField(defaultX);
    }

    if (!yField && numericColumns.length > 0) {
      // Default Y field selection logic
      const defaultY = numericColumns[0]?.name;
      setYField(defaultY);
    }
  }, [selectedType, allColumns]);

  // Update configuration when any field changes
  useEffect(() => {
    if (!xField || !yField) return;

    const chartType = CHART_TYPES.find(t => t.id === selectedType);
    if (!chartType) return;

    const config: ChartConfiguration = {
      id: `chart_${Date.now()}`,
      name: title,
      type: {
        id: chartType.id,
        name: chartType.name,
        library: chartType.library,
        category: 'basic',
        supportedDataTypes: ['categorical', 'numerical'],
        requiredDimensions: ['x', 'y'],
        optionalDimensions: ['color', 'group']
      },
      data,
      dimensions: {
        x: xField,
        y: yField,
        ...(colorField && { color: colorField }),
        ...(groupField && { group: groupField })
      },
      styling: {
        theme: 'light',
        colors: DEFAULT_COLORS,
        width: 800,
        height: 400,
        margins: { top: 20, right: 30, bottom: 40, left: 60 },
        title,
        xAxisLabel: xField,
        yAxisLabel: yField
      },
      interactions: {
        zoom: false,
        pan: false,
        hover: true,
        select: false,
        brush: false
      },
      plugins: []
    };

    onConfigChange(config);
  }, [selectedType, title, xField, yField, colorField, groupField, data]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 space-y-6 ${className}`}>
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
        <Settings className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Chart Configuration</h3>
      </div>

      {/* Chart Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Chart Type</label>
        <div className="grid grid-cols-2 gap-3">
          {CHART_TYPES.map(chartType => {
            const Icon = chartType.icon;
            return (
              <button
                key={chartType.id}
                type="button"
                onClick={() => setSelectedType(chartType.id)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  selectedType === chartType.id
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{chartType.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Chart Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter chart title"
        />
      </div>

      {/* Field Mapping */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Data Mapping</h4>
        
        {/* X Axis Field */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">X-Axis Field</label>
          <select
            value={xField}
            onChange={(e) => setXField(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select field...</option>
            {allColumns.map(col => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* Y Axis Field */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">Y-Axis Field</label>
          <select
            value={yField}
            onChange={(e) => setYField(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select field...</option>
            {numericColumns.map(col => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* Color Field (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">Color Field (Optional)</label>
          <select
            value={colorField}
            onChange={(e) => setColorField(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {categoricalColumns.map(col => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* Group Field (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">Group Field (Optional)</label>
          <select
            value={groupField}
            onChange={(e) => setGroupField(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {categoricalColumns.map(col => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Data Summary</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Rows:</span>
            <span className="font-medium">{data.length.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Available Columns:</span>
            <span className="font-medium">{availableColumns.length}</span>
          </div>
          {xField && yField && (
            <div className="flex justify-between">
              <span>Valid Data Points:</span>
              <span className="font-medium">
                {data.filter(row => 
                  row[xField] != null && row[yField] != null
                ).length.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartConfigPanel;