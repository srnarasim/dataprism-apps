import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Code, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Copy,
  ExternalLink 
} from 'lucide-react';
import type { PluginInfo } from './PluginCard';

interface PluginDemoProps {
  plugin: PluginInfo;
  onClose: () => void;
  className?: string;
}

interface DemoStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  expectedOutput?: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: any;
  error?: string;
}

const PluginDemo: React.FC<PluginDemoProps> = ({ 
  plugin, 
  onClose, 
  className = '' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCode, setShowCode] = useState(true);

  // Initialize demo steps based on plugin type
  useEffect(() => {
    const steps = generateDemoSteps(plugin);
    setDemoSteps(steps);
  }, [plugin]);

  const generateDemoSteps = (plugin: PluginInfo): DemoStep[] => {
    switch (plugin.id) {
      case 'csv-importer':
        return [
          {
            id: 'initialize',
            title: 'Initialize CSV Importer',
            description: 'Load and configure the CSV Importer plugin',
            code: `import { CSVImporter } from '@dataprism/csv-importer';\n\nconst importer = new CSVImporter({\n  delimiter: ',',\n  hasHeader: true,\n  encoding: 'utf-8'\n});`,
            status: 'pending'
          },
          {
            id: 'load-file',
            title: 'Load Sample CSV File',
            description: 'Parse a sample CSV file with sales data',
            code: `const csvData = \`name,sales,region\nJohn,1200,North\nSarah,1500,South\nMike,800,East\`;\n\nconst result = await importer.parse(csvData);\nconsole.log(result);`,
            expectedOutput: [
              { name: 'John', sales: 1200, region: 'North' },
              { name: 'Sarah', sales: 1500, region: 'South' },
              { name: 'Mike', sales: 800, region: 'East' }
            ],
            status: 'pending'
          },
          {
            id: 'validate',
            title: 'Validate Data Quality',
            description: 'Check for data quality issues and inconsistencies',
            code: `const validation = importer.validate(result.data);\nconsole.log('Validation results:', validation);`,
            expectedOutput: {
              valid: true,
              rowCount: 3,
              columnCount: 3,
              issues: []
            },
            status: 'pending'
          }
        ];

      case 'observable-charts':
        return [
          {
            id: 'setup',
            title: 'Setup Observable Charts',
            description: 'Initialize the Observable Plot charting library',
            code: `import { ObservableCharts } from '@dataprism/observable-charts';\n\nconst charts = new ObservableCharts({\n  theme: 'light',\n  responsive: true\n});`,
            status: 'pending'
          },
          {
            id: 'create-chart',
            title: 'Create Interactive Chart',
            description: 'Generate a bar chart from sample data',
            code: `const data = [\n  { category: 'A', value: 10 },\n  { category: 'B', value: 20 },\n  { category: 'C', value: 15 }\n];\n\nconst chart = charts.createBarChart(data, {\n  x: 'category',\n  y: 'value',\n  title: 'Sample Bar Chart'\n});`,
            expectedOutput: 'Interactive bar chart rendered',
            status: 'pending'
          },
          {
            id: 'export',
            title: 'Export Chart',
            description: 'Export the chart as PNG or SVG',
            code: `const exportedChart = await charts.export(chart, {\n  format: 'png',\n  width: 800,\n  height: 400\n});`,
            expectedOutput: 'Chart exported successfully',
            status: 'pending'
          }
        ];

      case 'performance-monitor':
        return [
          {
            id: 'start-monitoring',
            title: 'Start Performance Monitoring',
            description: 'Begin tracking DataPrism performance metrics',
            code: `import { PerformanceMonitor } from '@dataprism/performance-monitor';\n\nconst monitor = new PerformanceMonitor();\nmonitor.start();`,
            status: 'pending'
          },
          {
            id: 'track-query',
            title: 'Track Query Performance',
            description: 'Monitor the execution of a sample query',
            code: `// Execute a sample query\nconst query = 'SELECT * FROM sales_data WHERE amount > 1000';\nconst startTime = performance.now();\n\nconst result = await dataprism.query(query);\nconst metrics = monitor.getLastQueryMetrics();\n\nconsole.log('Query metrics:', metrics);`,
            expectedOutput: {
              executionTime: 145,
              memoryUsed: '2.4MB',
              rowsProcessed: 1250,
              cacheHit: true
            },
            status: 'pending'
          },
          {
            id: 'generate-report',
            title: 'Generate Performance Report',
            description: 'Create a comprehensive performance report',
            code: `const report = monitor.generateReport({\n  timeframe: '1h',\n  includeCharts: true,\n  format: 'detailed'\n});\n\nconsole.log('Performance report:', report);`,
            expectedOutput: 'Performance report generated with charts and metrics',
            status: 'pending'
          }
        ];

      default:
        return [
          {
            id: 'demo',
            title: 'Plugin Demo',
            description: 'This is a demonstration of the plugin functionality',
            code: `// Plugin-specific demo code would go here\nconsole.log('Demo for ${plugin.name}');`,
            status: 'pending'
          }
        ];
    }
  };

  const runStep = async (stepIndex: number) => {
    setIsRunning(true);
    const step = demoSteps[stepIndex];
    
    // Update step status to running
    const updatedSteps = [...demoSteps];
    updatedSteps[stepIndex] = { ...step, status: 'running' };
    setDemoSteps(updatedSteps);

    try {
      // Simulate plugin execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate successful execution
      updatedSteps[stepIndex] = {
        ...step,
        status: 'completed',
        output: step.expectedOutput || 'Operation completed successfully'
      };
      setDemoSteps(updatedSteps);
      
    } catch (error) {
      // Handle errors
      updatedSteps[stepIndex] = {
        ...step,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setDemoSteps(updatedSteps);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllSteps = async () => {
    for (let i = 0; i < demoSteps.length; i++) {
      await runStep(i);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between steps
    }
  };

  const resetDemo = () => {
    const resetSteps = demoSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      output: undefined,
      error: undefined
    }));
    setDemoSteps(resetSteps);
    setCurrentStep(0);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{plugin.name} Demo</h2>
            <p className="text-blue-100">{plugin.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Demo Controls */}
        <div className="flex items-center space-x-4 mt-4">
          <button
            onClick={runAllSteps}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Run Demo</span>
          </button>
          
          <button
            onClick={resetDemo}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-400 transition-colors"
          >
            <Code className="w-4 h-4" />
            <span>{showCode ? 'Hide Code' : 'Show Code'}</span>
          </button>
        </div>
      </div>

      {/* Demo Steps */}
      <div className="p-6 space-y-6">
        {demoSteps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-lg ${
              index === currentStep ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {/* Step Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.status === 'completed' ? 'bg-green-100 text-green-800' :
                  step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  step.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : step.status === 'running' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : step.status === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => runStep(index)}
                disabled={isRunning}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Run Step</span>
              </button>
            </div>
            
            {/* Step Content */}
            <div className="p-4">
              {/* Code Block */}
              {showCode && step.code && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Code:</h4>
                    <button
                      onClick={() => copyCode(step.code!)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{step.code}</code>
                  </pre>
                </div>
              )}
              
              {/* Output */}
              {step.output && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Output:</h4>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <pre className="text-sm text-green-800 whitespace-pre-wrap">
                      {typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Error */}
              {step.error && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Error:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">{step.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Demo Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Demo Progress: {demoSteps.filter(s => s.status === 'completed').length} / {demoSteps.length} steps completed
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={plugin.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <FileText className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            <a
              href={plugin.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginDemo;