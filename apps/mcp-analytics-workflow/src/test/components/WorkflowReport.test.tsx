import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WorkflowReport } from '@/components/workflow/WorkflowReport';
import type { WorkflowState } from '@/types/workflow';

const mockWorkflow: WorkflowState = {
  id: 'test-workflow-123',
  definition: {
    id: 'sales-analysis-workflow',
    name: 'Sales Analysis Workflow',
    description: 'Analyze sales data and generate insights',
    nodes: [],
    edges: []
  },
  status: 'completed',
  currentStep: null,
  steps: [
    {
      id: 'data-input',
      name: 'Data Input',
      status: 'completed',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:01:00Z'),
      result: {
        type: 'data-input',
        success: true,
        rowCount: 100,
        columns: ['date', 'amount', 'region', 'product'],
        preview: [
          { date: '2024-01-01', amount: 1500, region: 'North', product: 'Widget A' }
        ]
      }
    },
    {
      id: 'calculations',
      name: 'Calculations',
      status: 'completed',
      startTime: new Date('2024-01-01T10:01:00Z'),
      endTime: new Date('2024-01-01T10:02:00Z'),
      result: {
        type: 'calculations',
        success: true,
        calculations: {
          total: 250000,
          average: 2500,
          count: 100
        }
      }
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      status: 'completed',
      startTime: new Date('2024-01-01T10:02:00Z'),
      endTime: new Date('2024-01-01T10:03:00Z'),
      result: {
        type: 'ai-insights',
        success: true,
        insights: 'Sales show strong growth in Q4 with Widget A leading performance'
      }
    }
  ],
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:03:00Z')
};

describe('WorkflowReport', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workflow report header', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    expect(screen.getByText('📊 Workflow Report')).toBeInTheDocument();
    expect(screen.getByText('Sales Analysis Workflow')).toBeInTheDocument();
    expect(screen.getByText('Status: COMPLETED')).toBeInTheDocument();
  });

  it('displays executive summary with calculated metrics', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Data processed
    expect(screen.getByText('$250,000')).toBeInTheDocument(); // Total sales
    expect(screen.getByText('Sales show strong growth in Q4 with Widget A leading performance')).toBeInTheDocument(); // Insights
  });

  it('shows step results for each completed step', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    expect(screen.getByText('Step Results')).toBeInTheDocument();
    expect(screen.getByText('Data Input')).toBeInTheDocument();
    expect(screen.getByText('Calculations')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });

  it('displays data input step details correctly', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    expect(screen.getByText('Processed 100 rows with 4 columns')).toBeInTheDocument();
    expect(screen.getByText('date, amount, region, product')).toBeInTheDocument();
  });

  it('displays calculation results correctly', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    expect(screen.getByText('Total: $250,000')).toBeInTheDocument();
    expect(screen.getByText('Average: $2,500')).toBeInTheDocument();
    expect(screen.getByText('Count: 100')).toBeInTheDocument();
  });

  it('shows execution time for each step', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    // Each step took 1 minute based on mock data
    const executionTimes = screen.getAllByText('Execution time: 1 minute');
    expect(executionTimes).toHaveLength(3);
  });

  it('handles export to JSON functionality', () => {
    // Mock URL.createObjectURL and document methods
    const createObjectURL = vi.fn(() => 'mock-url');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();
    
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          setAttribute: vi.fn(),
          style: {},
          click,
        } as any;
      }
      return document.createElement(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeChild);

    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    const exportButton = screen.getByText('📥 Export Report');
    fireEvent.click(exportButton);

    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('calls onClose when close button is clicked', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles workflow with no results gracefully', () => {
    const workflowWithoutResults: WorkflowState = {
      ...mockWorkflow,
      steps: [
        {
          id: 'step1',
          name: 'Step 1',
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
          result: null
        }
      ]
    };

    render(<WorkflowReport workflow={workflowWithoutResults} onClose={mockOnClose} />);

    expect(screen.getByText('No results available')).toBeInTheDocument();
  });

  it('shows appropriate message when no insights are generated', () => {
    const workflowWithoutInsights: WorkflowState = {
      ...mockWorkflow,
      steps: mockWorkflow.steps.map(step => 
        step.id === 'ai-insights' 
          ? { ...step, result: { ...step.result, insights: null } }
          : step
      )
    };

    render(<WorkflowReport workflow={workflowWithoutInsights} onClose={mockOnClose} />);

    expect(screen.getByText('No insights generated')).toBeInTheDocument();
  });

  it('formats large numbers correctly in summary', () => {
    const workflowWithLargeNumbers: WorkflowState = {
      ...mockWorkflow,
      steps: mockWorkflow.steps.map(step => 
        step.id === 'calculations' 
          ? { 
              ...step, 
              result: { 
                ...step.result, 
                calculations: { total: 1500000, average: 15000, count: 100 } 
              } 
            }
          : step
      )
    };

    render(<WorkflowReport workflow={workflowWithLargeNumbers} onClose={mockOnClose} />);

    expect(screen.getByText('$1,500,000')).toBeInTheDocument(); // Total sales formatted
    expect(screen.getByText('Total: $1,500,000')).toBeInTheDocument(); // In step results
  });

  it('displays step status badges correctly', () => {
    render(<WorkflowReport workflow={mockWorkflow} onClose={mockOnClose} />);

    const successBadges = screen.getAllByText('✅ Success');
    expect(successBadges).toHaveLength(3); // All steps completed successfully
  });

  it('handles failed step results appropriately', () => {
    const workflowWithFailedStep: WorkflowState = {
      ...mockWorkflow,
      steps: [
        ...mockWorkflow.steps.slice(0, 2),
        {
          id: 'ai-insights',
          name: 'AI Insights',
          status: 'failed',
          startTime: new Date('2024-01-01T10:02:00Z'),
          endTime: new Date('2024-01-01T10:03:00Z'),
          result: {
            type: 'ai-insights',
            success: false,
            error: 'Failed to generate insights'
          }
        }
      ]
    };

    render(<WorkflowReport workflow={workflowWithFailedStep} onClose={mockOnClose} />);

    expect(screen.getByText('❌ Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed to generate insights')).toBeInTheDocument();
  });
});