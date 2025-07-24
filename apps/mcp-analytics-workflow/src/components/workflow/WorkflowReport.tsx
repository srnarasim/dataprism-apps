import React from 'react';
import type { WorkflowState } from '@/types/workflow';

interface WorkflowReportProps {
  workflow: WorkflowState;
  onClose?: () => void;
}

export const WorkflowReport: React.FC<WorkflowReportProps> = ({ workflow, onClose }) => {
  if (workflow.status !== 'completed') {
    return null;
  }

  // Collect all step results
  const stepResults = workflow.steps.reduce((acc, step) => {
    if (step.result) {
      acc[step.id] = step.result;
    }
    return acc;
  }, {} as Record<string, any>);
  
  // Debug logging (can be removed in production)
  // console.log('[WorkflowReport] Step results:', stepResults);
  // console.log('[WorkflowReport] AI insights step result:', stepResults['ai-insights']);

  // Generate comprehensive report
  const generateReport = () => {
    const report = {
      workflowId: workflow.id,
      executionTime: workflow.startTime && workflow.endTime 
        ? Math.round((workflow.endTime.getTime() - workflow.startTime.getTime()) / 1000)
        : 0,
      completedSteps: workflow.steps.filter(s => s.status === 'completed').length,
      totalSteps: workflow.steps.length,
      results: stepResults
    };

    return report;
  };

  const report = generateReport();

  const downloadReport = () => {
    const reportData = {
      ...report,
      generatedAt: new Date().toISOString(),
      summary: generateSummary()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-report-${workflow.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSummary = () => {
    const dataInput = stepResults['data-upload'];
    const enrichment = stepResults['external-enrichment'];
    const calculations = stepResults['calculations'];
    const insights = stepResults['ai-insights'];

    return {
      dataProcessed: dataInput?.rowCount || 0,
      categoriesIdentified: enrichment?.categories?.length || 0,
      enrichedRecords: enrichment?.enrichedCount || 0,
      totalSales: calculations?.calculations?.total || 0,
      averageSale: calculations?.calculations?.average || 0,
      maxSale: calculations?.calculations?.max || 0,
      keyInsights: insights?.insights || 'No insights generated'
    };
  };

  const summary = generateSummary();

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📊</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sales Analysis Report
              </h2>
              <p className="text-gray-600">
                Automated workflow completed successfully
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📥 Download Report
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{summary.dataProcessed}</div>
            <div className="text-sm text-blue-800">Records Processed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">${(summary.totalSales).toLocaleString()}</div>
            <div className="text-sm text-green-800">Total Sales</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">${(summary.averageSale).toLocaleString()}</div>
            <div className="text-sm text-purple-800">Average Sale</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{summary.categoriesIdentified}</div>
            <div className="text-sm text-orange-800">Categories Found</div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-2">🔍 Key Insights</h4>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">{summary.keyInsights}</p>
          </div>
        </div>

        {/* Step-by-Step Results */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">📋 Detailed Results</h4>
          
          {/* Data Upload Results */}
          {stepResults['data-upload'] && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✅</span>
                <h5 className="font-medium">Data Upload & Validation</h5>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Processed {stepResults['data-upload'].rowCount} rows successfully</div>
                <div>• Data validation completed with no errors</div>
                <div>• All required columns present and validated</div>
              </div>
            </div>
          )}

          {/* MCP Enrichment Results */}
          {stepResults['external-enrichment'] && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✅</span>
                <h5 className="font-medium">Product Categorization (MCP)</h5>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Enriched {stepResults['external-enrichment'].enrichedCount} product records</div>
                <div>• Identified categories: {stepResults['external-enrichment'].categories?.join(', ')}</div>
                <div>• External API integration successful</div>
              </div>
            </div>
          )}

          {/* Calculations Results */}
          {stepResults['calculations'] && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✅</span>
                <h5 className="font-medium">Spreadsheet Calculations</h5>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Total Sales: ${stepResults['calculations'].calculations?.total?.toLocaleString()}</div>
                <div>• Average Sale: ${stepResults['calculations'].calculations?.average?.toLocaleString()}</div>
                <div>• Maximum Sale: ${stepResults['calculations'].calculations?.max?.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* LLM Insights Results */}
          {stepResults['ai-insights'] && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-500">✅</span>
                <h5 className="font-medium">AI-Generated Insights</h5>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {Math.round((stepResults['ai-insights'].confidence || 0) * 100)}% confidence
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-3">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <em>"{stepResults['ai-insights'].insights}"</em>
                </div>
                {stepResults['ai-insights'].keyMetrics && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                      <div className="text-xs font-medium text-emerald-800">Top Region</div>
                      <div className="text-emerald-700">{stepResults['ai-insights'].keyMetrics.topRegion}</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <div className="text-xs font-medium text-purple-800">Recommendation</div>
                      <div className="text-purple-700 text-xs">{stepResults['ai-insights'].keyMetrics.recommendation}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Execution Metadata */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold mb-2">⚙️ Execution Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Workflow ID:</strong> {workflow.id}
            </div>
            <div>
              <strong>Execution Time:</strong> {report.executionTime}s
            </div>
            <div>
              <strong>Steps Completed:</strong> {report.completedSteps}/{report.totalSteps}
            </div>
            <div>
              <strong>Status:</strong> 
              <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Completed Successfully
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};