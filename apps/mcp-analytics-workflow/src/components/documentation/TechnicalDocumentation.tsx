import React from 'react';

interface TechnicalDocumentationProps {
  onClose: () => void;
}

export const TechnicalDocumentation: React.FC<TechnicalDocumentationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏗️</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  How This MCP Analytics Workflow Is Built
                </h2>
                <p className="text-gray-600">
                  DataPrism Framework, Plugins & Architecture
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Architecture Overview */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏛️ Architecture Overview
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-3">
                  This MCP Analytics Workflow application demonstrates the DataPrism ecosystem's capabilities 
                  for building intelligent data processing pipelines with external integrations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-600">🧠 DataPrism Core</div>
                    <div className="text-sm text-gray-600">WebAssembly engine with DuckDB</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-green-600">🔗 MCP Integration</div>
                    <div className="text-sm text-gray-600">Model Context Protocol plugins</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-purple-600">🎯 LangGraph Orchestration</div>
                    <div className="text-sm text-gray-600">Workflow execution engine</div>
                  </div>
                </div>
              </div>
            </section>

            {/* DataPrism Framework */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚡ DataPrism Framework
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-800">Core Engine</h4>
                  <p className="text-gray-700 text-sm">
                    DataPrism provides a WebAssembly-powered analytics engine with DuckDB for high-performance 
                    data processing directly in the browser. The engine supports:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
                    <li>Sub-second query performance on datasets up to 1M+ rows</li>
                    <li>Apache Arrow format for efficient data transfer</li>
                    <li>Memory-efficient processing (&lt;4GB for large datasets)</li>
                    <li>CDN-optimized loading with fallback mechanisms</li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">💻 Implementation Example</h5>
                  <pre className="text-xs bg-slate-800 text-slate-200 p-3 rounded overflow-x-auto">
{`// DataPrism initialization
const DataPrism = await loadDataPrismFromCDN();
const engine = new DataPrism.DataPrismEngine({
  maxMemoryMB: 512,
  enableWasmOptimizations: true,
  queryTimeoutMs: 30000
});
await engine.initialize();`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Plugin Architecture */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🧩 Plugin Architecture
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  This application uses a modular plugin system where each capability is provided by a specialized plugin:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CSV Importer Plugin */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📊</span>
                      <h4 className="font-medium">CSV Importer Plugin</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Handles file parsing, data validation, and ingestion into the DataPrism engine.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <strong>Features:</strong> Schema detection, type inference, error handling
                    </div>
                  </div>

                  {/* MCP Integration Plugin */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔗</span>
                      <h4 className="font-medium">MCP Integration Plugin</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Connects to external Model Context Protocol servers for data enrichment.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <strong>Use Case:</strong> Product categorization, data enrichment, external APIs
                    </div>
                  </div>

                  {/* LangGraph Plugin */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎯</span>
                      <h4 className="font-medium">LangGraph Integration</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Orchestrates complex multi-step workflows with conditional logic and error handling.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <strong>Capabilities:</strong> Step-by-step execution, state management, branching
                    </div>
                  </div>

                  {/* IronCalc Plugin */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📋</span>
                      <h4 className="font-medium">IronCalc Formula Engine</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Provides spreadsheet-like calculations with Excel-compatible formulas.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <strong>Functions:</strong> SUM, AVERAGE, MAX, MIN, complex calculations
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Workflow Pipeline */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🔄 Workflow Pipeline
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  The sales analysis workflow demonstrates a complete data processing pipeline:
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">📋 Workflow Steps</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <div className="font-medium">Data Upload & Validation</div>
                        <div className="text-sm text-gray-600">CSV parsing, schema validation, data quality checks</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <div className="font-medium">External Enrichment (MCP)</div>
                        <div className="text-sm text-gray-600">Product categorization via external API integration</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <div className="font-medium">Spreadsheet Calculations</div>
                        <div className="text-sm text-gray-600">Aggregations, totals, averages using IronCalc</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                      <div>
                        <div className="font-medium">Visualization Generation</div>
                        <div className="text-sm text-gray-600">Charts and graphs using Observable Plot</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</div>
                      <div>
                        <div className="font-medium">AI Insights Generation</div>
                        <div className="text-sm text-gray-600">LLM-powered business insights and recommendations</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">6</div>
                      <div>
                        <div className="font-medium">Report Generation</div>
                        <div className="text-sm text-gray-600">Comprehensive report with download capabilities</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Implementation */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚙️ Technical Implementation
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="text-blue-500">🎨</span> Frontend Stack
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• React 18+ with TypeScript</li>
                      <li>• Vite for fast development</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• React Flow for interactive workflow visualization</li>
                      <li>• Context API for state management</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="text-green-500">🔧</span> Backend Integration
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• DataPrism WebAssembly engine</li>
                      <li>• DuckDB for analytical queries</li>
                      <li>• Apache Arrow data format</li>
                      <li>• CDN-based asset loading</li>
                      <li>• Mock MCP server simulation</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">🔍 Key Code Patterns</h5>
                  <pre className="text-xs bg-slate-800 text-slate-200 p-3 rounded overflow-x-auto">
{`// Plugin Loading Pattern
const loadRequiredPlugins = async (DataPrism, engine) => {
  const plugins = ['csv-importer', 'mcp-integration', 'langgraph-integration'];
  for (const pluginId of plugins) {
    const plugin = await DataPrism.loadPlugin(pluginId);
    setLoadedPlugins(prev => prev.set(pluginId, plugin));
  }
};

// Workflow Execution Pattern  
const executeWorkflow = async (workflowId, input) => {
  const workflow = getWorkflowState(workflowId);
  for (const step of workflow.steps) {
    const plugin = getPlugin(step.type);
    const result = await plugin.execute(step.configuration);
    updateStepResult(step.id, result);
  }
};`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🚀 Getting Started
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">📖 Learn More</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📚</span>
                      <a href="https://dataprism.ai/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        DataPrism Documentation
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🧩</span>
                      <a href="https://dataprism.ai/plugins" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Plugin Gallery & API Reference
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💡</span>
                      <a href="https://dataprism.ai/examples" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        More Examples & Tutorials
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🔗</span>
                      <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Model Context Protocol Specification
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">🛠️ Build Your Own</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Ready to build your own DataPrism workflow application? Start with our template:
                  </p>
                  <pre className="text-xs bg-green-800 text-green-200 p-2 rounded">
                    npx create-dataprism-app my-analytics-app --template=mcp-workflow
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            💡 This documentation shows how DataPrism plugins work together to create powerful analytics workflows
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};