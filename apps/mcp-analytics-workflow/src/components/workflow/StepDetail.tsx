import React from 'react';
import type { WorkflowState } from '@/types/workflow';

interface StepDetailProps {
  stepId: string;
  workflow: WorkflowState | null;
  onClose: () => void;
}

export const StepDetail: React.FC<StepDetailProps> = ({ stepId, workflow, onClose }) => {
  if (!workflow) return null;

  const step = workflow.steps.find(s => s.id === stepId);
  if (!step) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '⏳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⭕';
      default: return '⭕';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return 'Not started';
    if (!end) return 'In progress...';
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Step Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Step Information</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getStatusIcon(step.status)}</span>
              <span className="font-medium">{step.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                {step.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div><strong>ID:</strong> {step.id}</div>
              <div><strong>Type:</strong> {step.type}</div>
              <div><strong>Duration:</strong> {formatDuration(step.startTime, step.endTime)}</div>
            </div>
          </div>
        </div>

        {/* Timing Information */}
        {(step.startTime || step.endTime) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Execution Timeline</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              {step.startTime && (
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span>{step.startTime.toLocaleString()}</span>
                </div>
              )}
              {step.endTime && (
                <div className="flex justify-between">
                  <span>Ended:</span>
                  <span>{step.endTime.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result Display */}
        {step.result && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Step Result</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <pre className="text-xs text-green-800 overflow-auto max-h-40">
                {JSON.stringify(step.result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Error Display */}
        {step.error && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Error Details</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{step.error}</p>
            </div>
          </div>
        )}

        {/* Step Configuration */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <pre className="text-xs text-gray-700 overflow-auto max-h-32">
              {JSON.stringify({
                type: step.type,
                status: step.status,
                // Add more configuration details as needed
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {step.status === 'failed' && (
            <button className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors">
              🔄 Retry Step
            </button>
          )}
          
          {step.status === 'running' && (
            <button className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors">
              ⏹️ Stop Step
            </button>
          )}
          
          <button 
            onClick={onClose}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};