import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  FileText,
  Loader,
  Zap
} from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';

interface RealPluginDemoProps {
  pluginId: string;
  pluginName: string;
  onClose: () => void;
  className?: string;
}

const RealPluginDemo: React.FC<RealPluginDemoProps> = ({
  pluginId,
  pluginName,
  onClose,
  className = ''
}) => {
  const { loadRealPlugin } = useDataPrism();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [plugin, setPlugin] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'load' | 'demo' | 'results'>('load');

  const handleLoadPlugin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading real plugin: ${pluginId}`);
      const loadedPlugin = await loadRealPlugin(pluginId);
      setPlugin(loadedPlugin);
      setStep('demo');
      console.log('Plugin loaded successfully:', loadedPlugin);
    } catch (err) {
      console.error('Failed to load plugin:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plugin');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !plugin) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Processing file with real plugin:', file.name);
      
      // Initialize the plugin if it has an initialize method
      if (plugin.initialize) {
        await plugin.initialize();
      }

      // Process the file based on plugin type
      let result;
      if (pluginId === 'csv-importer' && plugin.import) {
        result = await plugin.import(file);
        
        // Also validate if available
        if (plugin.validate && result.data) {
          const validation = await plugin.validate(result.data);
          result.validation = validation;
        }
      } else {
        throw new Error(`Unknown plugin operation for ${pluginId}`);
      }

      setResults(result);
      setStep('results');
      console.log('Plugin processing complete:', result);
      
    } catch (err) {
      console.error('Plugin processing error:', err);
      setError(err instanceof Error ? err.message : 'Plugin processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!results?.data) return;

    const csv = [
      results.meta?.fields?.join(',') || Object.keys(results.data[0]).join(','),
      ...results.data.map((row: any) => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed_data_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg max-w-4xl ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Real Plugin Demo</h2>
              <p className="text-green-100">{pluginName} - Live Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-green-100 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Plugin Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Load Plugin */}
        {step === 'load' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Load Real Plugin
              </h3>
              <p className="text-gray-600 mb-6">
                This will load the actual {pluginName} from the DataPrism CDN and initialize it for use.
              </p>
            </div>
            
            <button
              onClick={handleLoadPlugin}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Loading Plugin...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Load {pluginName}</span>
                </>
              )}
            </button>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>CDN URL: https://srnarasim.github.io/dataprism-plugins/</p>
              <p>This is a real plugin that will actually process your data</p>
            </div>
          </div>
        )}

        {/* Step 2: Demo Plugin */}
        {step === 'demo' && plugin && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Plugin Loaded Successfully</h3>
                <p className="text-sm text-gray-600">Ready to process your data</p>
              </div>
            </div>

            {/* Plugin Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Plugin Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{plugin.name || pluginName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <span className="ml-2 font-medium">{plugin.version || '1.0.0'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Description:</span>
                  <span className="ml-2">{plugin.description || 'Real DataPrism plugin'}</span>
                </div>
              </div>
            </div>

            {/* File Upload for CSV Importer */}
            {pluginId === 'csv-importer' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Upload CSV File
                </h4>
                <p className="text-gray-600 mb-4">
                  Select a CSV file to process with the real plugin
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Choose CSV File</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && results && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Processing Complete</h3>
                <p className="text-sm text-gray-600">Real plugin successfully processed your data</p>
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.data?.length || 0}
                </div>
                <div className="text-sm text-blue-800">Rows Processed</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.meta?.fields?.length || Object.keys(results.data?.[0] || {}).length}
                </div>
                <div className="text-sm text-green-800">Columns Detected</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.errors?.length || 0}
                </div>
                <div className="text-sm text-purple-800">Errors Found</div>
              </div>
            </div>

            {/* Sample Data Preview */}
            {results.data && results.data.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Data Preview (First 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(results.data[0]).map(header => (
                          <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.slice(0, 5).map((row: any, index: number) => (
                        <tr key={index} className="border-t border-gray-200">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadResults}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Results</span>
              </button>
              
              <button
                onClick={() => {
                  setStep('demo');
                  setResults(null);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Process Another File
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span>This demo uses a real DataPrism plugin loaded from CDN</span>
          </div>
          <div className="text-xs">
            Plugin ID: {pluginId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealPluginDemo;