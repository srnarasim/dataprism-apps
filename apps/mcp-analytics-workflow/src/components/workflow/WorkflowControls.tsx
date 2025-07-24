import React from 'react';
import type { WorkflowState } from '@/types/workflow';

interface WorkflowControlsProps {
  workflow: WorkflowState;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onRetry?: () => void;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  workflow,
  onPause,
  onResume,
  onStop,
  onRetry
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '▶️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'created': return '⭕';
      default: return '⭕';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'created': return 'Created';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'created': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const totalSteps = workflow.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getStatusIcon(workflow.status)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Workflow Status
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
              {getStatusText(workflow.status)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {workflow.status === 'running' && onPause && (
            <button
              onClick={onPause}
              className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-md hover:bg-amber-200 transition-colors"
            >
              ⏸️ Pause
            </button>
          )}
          
          {workflow.status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors"
            >
              🔄 Retry
            </button>
          )}
          
          {workflow.status === 'running' && onStop && (
            <button
              onClick={onStop}
              className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors"
            >
              ⏹️ Stop
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{completedSteps} of {totalSteps} steps completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              workflow.status === 'completed' ? 'bg-green-500' :
              workflow.status === 'failed' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Execution Time */}
      {workflow.startTime && (
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Started:</span>
            <span>{workflow.startTime.toLocaleTimeString()}</span>
          </div>
          {workflow.endTime && (
            <div className="flex justify-between">
              <span>Completed:</span>
              <span>{workflow.endTime.toLocaleTimeString()}</span>
            </div>
          )}
          {workflow.startTime && workflow.endTime && (
            <div className="flex justify-between font-medium">
              <span>Duration:</span>
              <span>
                {Math.round((workflow.endTime.getTime() - workflow.startTime.getTime()) / 1000)}s
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {workflow.status === 'failed' && workflow.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
          <p className="text-sm text-red-700">{workflow.error}</p>
        </div>
      )}

      {/* Current Step Highlight */}
      {workflow.currentStep && workflow.status === 'running' && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="text-sm font-medium text-amber-800 mb-1">Currently executing:</h4>
          <p className="text-sm text-amber-700">
            {workflow.steps.find(s => s.id === workflow.currentStep)?.name || workflow.currentStep}
          </p>
        </div>
      )}
    </div>
  );
};