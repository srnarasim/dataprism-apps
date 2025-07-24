import React, { useState } from 'react';
import { BarChart3, AlertCircle, CheckCircle, Palette, Database } from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';
import DataSourceSelector from '@/components/visualization/DataSourceSelector';
import ChartConfigPanel from '@/components/visualization/ChartConfigPanel';
import ChartRenderer from '@/components/visualization/ChartRenderer';
import type { ChartConfiguration, TableSchema, ColumnDefinition } from '@/types/data';

const VisualizationPage: React.FC = () => {
  const { isInitialized, initializationError } = useDataPrism();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<TableSchema | null>(null);
  const [currentChart, setCurrentChart] = useState<ChartConfiguration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDataSelect = (data: any[], schema: TableSchema) => {
    setSelectedData(data);
    setSelectedSchema(schema);
    setCurrentChart(null); // Reset current chart when data changes
    setError(null);
    console.log('Data selected for visualization:', data.length, 'rows');
  };

  const handleChartConfigChange = (config: ChartConfiguration) => {
    setCurrentChart(config);
    setError(null);
  };

  const handleChartExport = (format: 'png' | 'svg' | 'pdf') => {
    console.log(`Exporting chart as ${format}`);
    // In a full implementation, this would trigger the actual export
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
              Loading visualization capabilities...
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
        <h1 className="text-4xl font-bold text-gray-900">Data Visualization</h1>
        <p className="text-xl text-gray-600">
          Create interactive charts and explore your data with powerful visualization tools
        </p>
      </div>

      {/* Engine Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            DataPrism Visualization Engine Ready
          </span>
          <span className="text-green-700">• Chart.js, D3.js, Observable Plot supported</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Visualization Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Sidebar - Data Source Selection */}
        <div className="xl:col-span-1 space-y-6">
          <DataSourceSelector 
            onDataSelect={handleDataSelect}
          />

          {/* Chart Configuration Panel */}
          {selectedData.length > 0 && selectedSchema && selectedSchema.columns && (
            <ChartConfigPanel
              data={selectedData}
              availableColumns={selectedSchema.columns}
              onConfigChange={handleChartConfigChange}
              initialConfig={currentChart}
            />
          )}
        </div>

        {/* Main Content - Chart Display */}
        <div className="xl:col-span-3 space-y-6">
          {currentChart ? (
            <div className="space-y-6">
              {/* Chart Display */}
              <ChartRenderer
                config={currentChart}
                onExport={handleChartExport}
              />

              {/* Chart Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-900">Chart Type</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{currentChart.type.name}</p>
                  <p className="text-sm text-gray-500">Using {currentChart.type.library}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-900">Data Points</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{currentChart.data.length.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {selectedSchema?.columns?.length || 0} columns available
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-900">Dimensions</h3>
                  </div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">X:</span> {currentChart.dimensions.x}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Y:</span> {currentChart.dimensions.y as string}
                  </p>
                  {currentChart.dimensions.group && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Group:</span> {currentChart.dimensions.group}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : selectedData.length > 0 ? (
            // Data Selected but No Chart
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Visualize
              </h3>
              <p className="text-gray-600 mb-4">
                Your data is loaded! Configure your chart using the panel on the left to create your first visualization.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Data Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Rows:</span>
                    <span className="font-medium">{selectedData.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Columns:</span>
                    <span className="font-medium">{selectedSchema?.columns?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Numeric Columns:</span>
                    <span className="font-medium">
                      {selectedSchema?.columns?.filter(col => col.type === 'number')?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // No Data Selected
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Data Source
              </h3>
              <p className="text-gray-600 mb-6">
                Choose a table from the data source panel to start creating visualizations.
                You can use sample datasets or upload your own data.
              </p>
              
              {/* Supported Chart Types Preview */}
              <div className="max-w-2xl mx-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Supported Chart Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { name: 'Bar Chart', icon: BarChart3 },
                    { name: 'Line Chart', icon: BarChart3 },
                    { name: 'Pie Chart', icon: BarChart3 },
                    { name: 'Scatter Plot', icon: BarChart3 },
                    { name: 'Area Chart', icon: BarChart3 }
                  ].map(chart => (
                    <div key={chart.name} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                      <chart.icon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">{chart.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;