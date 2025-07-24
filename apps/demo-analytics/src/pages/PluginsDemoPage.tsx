import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  Search, 
  Filter, 
  Download, 
  Activity, 
  Zap, 
  ExternalLink, 
  Settings,
  AlertCircle,
  CheckCircle,
  Database
} from 'lucide-react';
import { useDataPrism } from '@/contexts/DataPrismCDNContext';
import PluginCard, { type PluginInfo } from '@/components/plugins/PluginCard';
import RealPluginDemo from '@/components/plugins/RealPluginDemo';

const SAMPLE_PLUGINS: PluginInfo[] = [
  {
    id: 'csv-importer',
    name: 'CSV Importer',
    version: '2.1.0',
    description: 'Advanced CSV file parser with data validation, type inference, and error handling capabilities.',
    category: 'import',
    author: 'DataPrism Team',
    status: 'installed',
    size: '156KB',
    features: [
      'Auto-detect delimiters',
      'Type inference',
      'Data validation',
      'Large file support',
      'Progress tracking',
      'Error reporting'
    ],
    demoUrl: '/demos/csv-importer',
    documentationUrl: 'https://docs.dataprism.io/plugins/csv-importer',
    githubUrl: 'https://github.com/dataprism/csv-importer',
    npmUrl: 'https://www.npmjs.com/package/@dataprism/csv-importer',
    lastUpdated: '2 days ago',
    downloads: 12450,
    rating: 4.8,
    tags: ['csv', 'import', 'parser', 'validation']
  },
  {
    id: 'observable-charts',
    name: 'Observable Charts',
    version: '1.5.2',
    description: 'Create beautiful, interactive visualizations using Observable Plot with seamless DataPrism integration.',
    category: 'visualization',
    author: 'Observable Inc.',
    status: 'available',
    size: '245KB',
    features: [
      'Interactive charts',
      'Real-time updates',
      'Multiple chart types',
      'Custom themes',
      'Export capabilities',
      'Responsive design'
    ],
    demoUrl: '/demos/observable-charts',
    documentationUrl: 'https://docs.dataprism.io/plugins/observable-charts',
    githubUrl: 'https://github.com/observablehq/plot',
    npmUrl: 'https://www.npmjs.com/package/@observablehq/plot',
    lastUpdated: '1 week ago',
    downloads: 8920,
    rating: 4.9,
    tags: ['visualization', 'charts', 'interactive', 'plot']
  },
  {
    id: 'performance-monitor',
    name: 'Performance Monitor',
    version: '1.2.1',
    description: 'Real-time performance monitoring and profiling tools for DataPrism queries and operations.',
    category: 'analysis',
    author: 'DataPrism Team',
    status: 'installed',
    size: '89KB',
    features: [
      'Query profiling',
      'Memory tracking',
      'Performance metrics',
      'Real-time monitoring',
      'Historical analysis',
      'Alert system'
    ],
    demoUrl: '/demos/performance-monitor',
    documentationUrl: 'https://docs.dataprism.io/plugins/performance-monitor',
    githubUrl: 'https://github.com/dataprism/performance-monitor',
    npmUrl: 'https://www.npmjs.com/package/@dataprism/performance-monitor',
    lastUpdated: '5 days ago',
    downloads: 6730,
    rating: 4.6,
    tags: ['performance', 'monitoring', 'profiling', 'metrics']
  },
  {
    id: 'json-explorer',
    name: 'JSON Explorer',
    version: '1.4.0',
    description: 'Advanced JSON data explorer with schema inference, nested object handling, and query capabilities.',
    category: 'utility',
    author: 'JSON Tools Inc.',
    status: 'available',
    size: '112KB',
    features: [
      'Schema inference',
      'Nested exploration',
      'JSONPath queries',
      'Data flattening',
      'Type validation',
      'Export options'
    ],
    demoUrl: '/demos/json-explorer',
    documentationUrl: 'https://docs.dataprism.io/plugins/json-explorer',
    githubUrl: 'https://github.com/json-tools/explorer',
    lastUpdated: '3 weeks ago',
    downloads: 4850,
    rating: 4.4,
    tags: ['json', 'explorer', 'schema', 'nested']
  },
  {
    id: 'excel-processor',
    name: 'Excel Processor',
    version: '2.0.3',
    description: 'Comprehensive Excel file processing with support for multiple sheets, formulas, and advanced formatting.',
    category: 'import',
    author: 'Office Tools Ltd.',
    status: 'available',
    size: '334KB',
    features: [
      'Multi-sheet support',
      'Formula evaluation',
      'Format preservation',
      'Large file handling',
      'Password protection',
      'Macro support'
    ],
    demoUrl: '/demos/excel-processor',
    documentationUrl: 'https://docs.dataprism.io/plugins/excel-processor',
    githubUrl: 'https://github.com/office-tools/excel-processor',
    lastUpdated: '1 week ago',
    downloads: 9200,
    rating: 4.7,
    tags: ['excel', 'spreadsheet', 'xlsx', 'formulas']
  },
  {
    id: 'data-validator',
    name: 'Data Validator',
    version: '1.3.2',
    description: 'Comprehensive data validation and quality assessment tools with customizable rules and reporting.',
    category: 'analysis',
    author: 'DataPrism Team',
    status: 'available',
    size: '78KB',
    features: [
      'Custom validation rules',
      'Quality scoring',
      'Anomaly detection',
      'Missing data analysis',
      'Data profiling',
      'Automated reports'
    ],
    demoUrl: '/demos/data-validator',
    documentationUrl: 'https://docs.dataprism.io/plugins/data-validator',
    githubUrl: 'https://github.com/dataprism/data-validator',
    lastUpdated: '4 days ago',
    downloads: 5640,
    rating: 4.5,
    tags: ['validation', 'quality', 'analysis', 'profiling']
  }
];

type FilterCategory = 'all' | 'import' | 'visualization' | 'analysis' | 'export' | 'utility';
type FilterStatus = 'all' | 'available' | 'installed';

const PluginsDemoPage: React.FC = () => {
  const { isInitialized, initializationError, listLoadedPlugins, loadPlugin } = useDataPrism();
  const [plugins, setPlugins] = useState<PluginInfo[]>(SAMPLE_PLUGINS);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginInfo[]>(SAMPLE_PLUGINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginInfo | null>(null);
  const [showRealDemo, setShowRealDemo] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // Filter plugins based on search and filters
  useEffect(() => {
    let filtered = plugins;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(plugin => plugin.status === statusFilter);
    }

    setFilteredPlugins(filtered);
  }, [plugins, searchQuery, categoryFilter, statusFilter]);

  const handleInstallPlugin = async (pluginId: string) => {
    setLoading(pluginId);
    
    try {
      // Simulate plugin installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update plugin status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'installed' as const }
          : plugin
      ));
      
      console.log(`Plugin ${pluginId} installed successfully`);
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      // Update to error status
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'error' as const }
          : plugin
      ));
    } finally {
      setLoading(null);
    }
  };

  const handleRealDemoPlugin = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin) {
      setSelectedPlugin(plugin);
      setShowRealDemo(true);
    }
  };

  const handleConfigurePlugin = (pluginId: string) => {
    console.log(`Configuring plugin: ${pluginId}`);
    // In a full implementation, this would open a configuration modal
  };

  const getCategoryStats = () => {
    const stats = {
      all: plugins.length,
      import: plugins.filter(p => p.category === 'import').length,
      visualization: plugins.filter(p => p.category === 'visualization').length,
      analysis: plugins.filter(p => p.category === 'analysis').length,
      export: plugins.filter(p => p.category === 'export').length,
      utility: plugins.filter(p => p.category === 'utility').length
    };
    return stats;
  };

  const categoryStats = getCategoryStats();

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
              Loading plugin management capabilities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real Demo Modal
  if (showRealDemo && selectedPlugin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <RealPluginDemo
            pluginId={selectedPlugin.id}
            pluginName={selectedPlugin.name}
            onClose={() => {
              setShowRealDemo(false);
              setSelectedPlugin(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Plugin Ecosystem</h1>
        <p className="text-xl text-gray-600">
          Extend DataPrism with powerful plugins for import, visualization, analysis, and more
        </p>
      </div>

      {/* Engine Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            DataPrism Plugin Manager Ready
          </span>
          <span className="text-green-700">• {plugins.filter(p => p.status === 'installed').length} plugins installed</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plugins by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <div className="flex space-x-1">
                {([['all', 'All'], ['import', 'Import'], ['visualization', 'Visualization'], ['analysis', 'Analysis'], ['utility', 'Utility']] as const).map(([category, label]) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      categoryFilter === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({category === 'all' ? categoryStats.all : categoryStats[category]})
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex space-x-1">
                {([['all', 'All'], ['installed', 'Installed'], ['available', 'Available']] as const).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      statusFilter === status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({status === 'all' ? plugins.length : plugins.filter(p => p.status === status).length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredPlugins.length} of {plugins.length} plugins
            </span>
            {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlugins.map(plugin => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            onInstall={handleInstallPlugin}
            onRealDemo={handleRealDemoPlugin}
            onConfigure={handleConfigurePlugin}
            isLoading={loading === plugin.id}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <Puzzle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No plugins found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 
              `No plugins match "${searchQuery}"` : 
              'No plugins match the selected filters'
            }
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Plugin Development Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Puzzle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Develop Your Own Plugin
            </h3>
            <p className="text-blue-800 mb-4">
              Create custom plugins to extend DataPrism's functionality. Our plugin SDK provides 
              everything you need to build, test, and publish your plugins.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://docs.dataprism.io/plugin-development"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Plugin SDK Documentation</span>
              </a>
              <a
                href="https://github.com/dataprism/plugin-template"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Plugin Template</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginsDemoPage;