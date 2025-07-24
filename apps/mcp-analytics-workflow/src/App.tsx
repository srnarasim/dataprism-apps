import React, { useState, useCallback } from 'react';
import { DataPrismMCPProvider, useDataPrismMCP } from '@/contexts/DataPrismMCPContext';
import { WorkflowVisualizer } from '@/components/workflow/WorkflowVisualizer';
import { ReactFlowVisualizer } from '@/components/workflow/ReactFlowVisualizer';
import { SimpleReactFlowTest } from '@/components/workflow/SimpleReactFlowTest';
import { WorkflowControls } from '@/components/workflow/WorkflowControls';
import { StepDetail } from '@/components/workflow/StepDetail';
import { AuditLog } from '@/components/workflow/AuditLog';
import { WorkflowReport } from '@/components/workflow/WorkflowReport';
import { TechnicalDocumentation } from '@/components/documentation/TechnicalDocumentation';
import { SALES_ANALYSIS_WORKFLOW } from '@/types/workflow';
import './App.css';

function AppContent() {
  const {
    isInitialized,
    isInitializing,
    initializationError,
    workflows,
    createWorkflow,
    executeWorkflow,
    getWorkflowState,
    uploadFile
  } = useDataPrismMCP();

  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleStartWorkflow = useCallback(async () => {
    try {
      const workflow = await createWorkflow(SALES_ANALYSIS_WORKFLOW);
      setCurrentWorkflowId(workflow.id);
      
      // Auto-start execution immediately after creation
      console.log('Starting workflow execution for:', workflow.id);
      await executeWorkflow(workflow.id, {
        description: 'Demo sales analysis workflow execution',
        uploadedFile: uploadedFile
      });
      
      // Show report automatically when workflow completes
      setShowReport(true);
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  }, [createWorkflow, executeWorkflow, uploadedFile]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFile(file);
      const result = await uploadFile(file);
      console.log('File uploaded successfully:', result);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  }, [uploadFile]);

  const handleDownloadSampleCSV = useCallback(() => {
    // Generate sample sales data
    const sampleData = [
      ['date', 'amount', 'region', 'product'],
      ['2024-01-01', '1500', 'North', 'Widget A'],
      ['2024-01-02', '2300', 'South', 'Widget B'],
      ['2024-01-03', '1800', 'East', 'Widget A'],
      ['2024-01-04', '2100', 'West', 'Widget C'],
      ['2024-01-05', '2800', 'North', 'Widget B'],
      ['2024-01-06', '1950', 'South', 'Premium Widget'],
      ['2024-01-07', '3200', 'North', 'Gadget C'],
      ['2024-01-08', '1750', 'East', 'Widget A'],
      ['2024-01-09', '2650', 'West', 'Widget B'],
      ['2024-01-10', '3800', 'North', 'Premium Widget'],
      ['2024-01-11', '1400', 'South', 'Widget C'],
      ['2024-01-12', '2900', 'East', 'Gadget C'],
      ['2024-01-13', '2200', 'West', 'Widget A'],
      ['2024-01-14', '3500', 'North', 'Premium Widget'],
      ['2024-01-15', '1600', 'South', 'Widget B'],
      ['2024-01-16', '2750', 'East', 'Widget C'],
      ['2024-01-17', '4200', 'North', 'Gadget C'],
      ['2024-01-18', '1850', 'West', 'Widget A'],
      ['2024-01-19', '3100', 'South', 'Premium Widget'],
      ['2024-01-20', '2450', 'East', 'Widget B'],
      ['2024-01-21', '1700', 'West', 'Widget C'],
      ['2024-01-22', '3900', 'North', 'Premium Widget'],
      ['2024-01-23', '2050', 'South', 'Gadget C'],
      ['2024-01-24', '2800', 'East', 'Widget A'],
      ['2024-01-25', '1550', 'West', 'Widget B'],
      ['2024-01-26', '3300', 'North', 'Premium Widget'],
      ['2024-01-27', '2150', 'South', 'Widget C'],
      ['2024-01-28', '2950', 'East', 'Gadget C'],
      ['2024-01-29', '1750', 'West', 'Widget A'],
      ['2024-01-30', '4100', 'North', 'Premium Widget'],
      ['2024-01-31', '2250', 'South', 'Widget B'],
      ['2024-02-01', '3400', 'East', 'Gadget C'],
      ['2024-02-02', '1900', 'West', 'Widget C'],
      ['2024-02-03', '2600', 'North', 'Widget A'],
      ['2024-02-04', '3700', 'South', 'Premium Widget'],
      ['2024-02-05', '2100', 'East', 'Widget B'],
      ['2024-02-06', '1450', 'West', 'Widget C'],
      ['2024-02-07', '3850', 'North', 'Gadget C'],
      ['2024-02-08', '2350', 'South', 'Widget A'],
      ['2024-02-09', '2750', 'East', 'Premium Widget'],
      ['2024-02-10', '1650', 'West', 'Widget B'],
      ['2024-02-11', '3200', 'North', 'Widget C'],
      ['2024-02-12', '2500', 'South', 'Gadget C'],
      ['2024-02-13', '1800', 'East', 'Widget A'],
      ['2024-02-14', '4300', 'West', 'Premium Widget'],
      ['2024-02-15', '2050', 'North', 'Widget B'],
      ['2024-02-16', '2900', 'South', 'Widget C'],
      ['2024-02-17', '3600', 'East', 'Gadget C'],
      ['2024-02-18', '1750', 'West', 'Widget A']
    ];

    // Convert to CSV string
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-sales-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const currentWorkflow = currentWorkflowId ? getWorkflowState(currentWorkflowId) : null;
  const stepStatuses = currentWorkflow?.steps.reduce((acc, step) => {
    acc[step.id] = step.status;
    return acc;
  }, {} as Record<string, 'pending' | 'running' | 'completed' | 'failed'>) || {};

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {isInitializing ? 'Loading DataPrism MCP Analytics' : 'Initializing...'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isInitializing 
              ? 'Setting up plugins and connecting to services...' 
              : 'Preparing the analytics workflow environment...'
            }
          </p>
          
          {/* Loading Steps */}
          <div className="text-left space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Loading DataPrism Core</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isInitializing ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
              <span>Initializing MCP Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Setting up LangGraph Workflows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Loading Plugin Ecosystem</span>
            </div>
          </div>

          {initializationError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="text-red-800 font-medium mb-1">Initialization Failed</h3>
              <p className="text-red-700 text-sm mb-3">{initializationError.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
              >
                🔄 Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🔗</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  MCP Analytics Workflow
                </h1>
                <p className="text-gray-600">
                  Automated Sales Data Quality and Insight Agent
                </p>
                <p className="text-xs text-blue-600">v3.0 - React Flow Professional Visualizer</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDocumentation(true)}
                className="px-4 py-2 text-sm font-medium rounded-md border text-gray-700 bg-white border-gray-300 hover:bg-gray-50 transition-colors"
              >
                📚 How It's Built
              </button>
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  showAuditLog 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                📝 {showAuditLog ? 'Hide' : 'Show'} Audit Log
              </button>
              {currentWorkflow && currentWorkflow.status === 'completed' && (
                <button
                  onClick={() => setShowReport(!showReport)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    showReport 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📊 {showReport ? 'Hide' : 'Show'} Report
                </button>
              )}
              <button
                onClick={handleStartWorkflow}
                disabled={currentWorkflow?.status === 'running'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentWorkflow?.status === 'running' ? (
                  <>
                    <span className="animate-pulse-slow">⏳</span> Running...
                  </>
                ) : (
                  '🚀 Start New Workflow'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* File Upload Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Data Upload</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors">
                📊 Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>✅</span>
                  <span>{uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)</span>
                </div>
              )}
              {!uploadedFile && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Upload a CSV file to begin the workflow, or 
                  </span>
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                  >
                    📥 Download sample CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Workflow Visualization - Full Width */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Workflow Execution
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentWorkflow 
                      ? `Status: ${currentWorkflow.status.toUpperCase()}`
                      : 'Click "Start New Workflow" to begin'
                    }
                  </p>
                </div>
                {currentWorkflow && (
                  <div className="flex items-center gap-6">
                    {/* Progress Stats */}
                    <div className="text-right text-sm text-gray-500">
                      <div>Steps: {currentWorkflow.steps.filter(s => s.status === 'completed').length} / {currentWorkflow.steps.length}</div>
                      {currentWorkflow.currentStep && (
                        <div className="text-amber-600 font-medium">
                          Running: {currentWorkflow.steps.find(s => s.id === currentWorkflow.currentStep)?.name}
                        </div>
                      )}
                    </div>
                    {/* Quick Stats Inline */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="bg-blue-50 px-3 py-1 rounded border border-blue-200">
                        <span className="text-blue-600 font-medium">{workflows.length}</span>
                        <span className="text-blue-800 ml-1">Total</span>
                      </div>
                      <div className="bg-green-50 px-3 py-1 rounded border border-green-200">
                        <span className="text-green-600 font-medium">{workflows.filter(w => w.status === 'completed').length}</span>
                        <span className="text-green-800 ml-1">Completed</span>
                      </div>
                      {workflows.filter(w => w.status === 'running').length > 0 && (
                        <div className="bg-amber-50 px-3 py-1 rounded border border-amber-200">
                          <span className="text-amber-600 font-medium">{workflows.filter(w => w.status === 'running').length}</span>
                          <span className="text-amber-800 ml-1">Running</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative h-[600px]">
                <ReactFlowVisualizer
                  workflow={SALES_ANALYSIS_WORKFLOW}
                  currentStep={currentWorkflow?.currentStep}
                  stepStatuses={stepStatuses}
                  onNodeClick={setSelectedStepId}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Workflow Controls */}
          {currentWorkflow && (
            <WorkflowControls
              workflow={currentWorkflow}
              onPause={() => console.log('Pause workflow')}
              onResume={() => console.log('Resume workflow')}
              onStop={() => console.log('Stop workflow')}
              onRetry={() => executeWorkflow(currentWorkflow.id, {})}
            />
          )}

          {/* Progress Overview and Step Detail - Horizontal Layout */}
          {currentWorkflow && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Overview */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Progress Overview</h3>
                <div className="space-y-3">
                  {currentWorkflow.steps.map(step => (
                    <div 
                      key={step.id} 
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedStepId === step.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStepId(step.id)}
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'running' ? 'bg-amber-500 animate-pulse-slow' :
                        step.status === 'failed' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {step.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {step.status === 'running' && currentWorkflow.currentStep === step.id ? 
                            'Currently running...' : step.status
                          }
                        </div>
                      </div>
                      {step.status === 'running' && (
                        <div className="text-amber-500 text-sm">⏳</div>
                      )}
                      {step.status === 'completed' && (
                        <div className="text-green-500 text-sm">✅</div>
                      )}
                      {step.status === 'failed' && (
                        <div className="text-red-500 text-sm">❌</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Detail */}
              <div className="min-h-[200px]">
                {selectedStepId ? (
                  <StepDetail
                    stepId={selectedStepId}
                    workflow={currentWorkflow}
                    onClose={() => setSelectedStepId(null)}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                    <div className="text-gray-400 text-4xl mb-2">👆</div>
                    <p className="text-gray-500">Click on a workflow step to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workflow Report */}
          {currentWorkflow && currentWorkflow.status === 'completed' && showReport && (
            <WorkflowReport 
              workflow={currentWorkflow} 
              onClose={() => setShowReport(false)}
            />
          )}
        </div>

        {/* Audit Log */}
        {showAuditLog && (
          <div className="mt-6">
            <AuditLog workflowId={currentWorkflowId} />
          </div>
        )}
      </div>

      {/* Technical Documentation Modal */}
      {showDocumentation && (
        <TechnicalDocumentation onClose={() => setShowDocumentation(false)} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>🔗 MCP Analytics Workflow</span>
              <span>•</span>
              <span>Powered by DataPrism</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowDocumentation(true)}
                className="hover:text-gray-900 cursor-pointer bg-transparent border-none p-0 text-sm"
              >
                📚 How It's Built
              </button>
              <a href="https://github.com/dataprism-ai/dataprism-core" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">GitHub</a>
              <a href="https://dataprism.ai/support" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <DataPrismMCPProvider>
      <AppContent />
    </DataPrismMCPProvider>
  );
}

export default App;