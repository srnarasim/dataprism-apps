import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DataPrismMCPProvider, useDataPrismMCP } from '@/contexts/DataPrismMCPContext';
import type { WorkflowDefinition } from '@/types/workflow';

// Mock the CDN loader and related utilities
vi.mock('@/utils/cdnLoader', () => ({
  CDNAssetLoader: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    loadCoreBundle: vi.fn().mockResolvedValue({
      DuckDBManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue({ data: [], rowCount: 0 })
      })),
      DataPrismEngine: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined)
      }))
    }),
    loadArrowBundle: vi.fn().mockResolvedValue({}),
    cleanup: vi.fn()
  }))
}));

vi.mock('@/utils/assetMonitor', () => ({
  AssetLoadMonitor: vi.fn().mockImplementation(() => ({
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({
      totalAssets: 0,
      loadedAssets: 0,
      failedAssets: 0,
      loadTime: 0
    })
  }))
}));

const mockWorkflowDefinition: WorkflowDefinition = {
  id: 'test-workflow',
  name: 'Test Workflow',
  description: 'A test workflow',
  nodes: [
    {
      id: 'node1',
      name: 'Data Input',
      type: 'data-input',
      description: 'Load data',
      config: {}
    }
  ],
  edges: []
};

describe('DataPrismMCPContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DataPrismMCPProvider>{children}</DataPrismMCPProvider>
  );

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isInitializing).toBe(true);
    expect(result.current.initializationError).toBe(null);
    expect(result.current.workflows).toEqual([]);
  });

  it('completes initialization successfully', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    expect(result.current.isInitializing).toBe(false);
    expect(result.current.initializationError).toBe(null);
  });

  it('creates a new workflow', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    let createdWorkflow: any;
    await act(async () => {
      createdWorkflow = await result.current.createWorkflow(mockWorkflowDefinition);
    });

    expect(createdWorkflow).toBeDefined();
    expect(createdWorkflow.id).toBeTruthy();
    expect(createdWorkflow.definition).toEqual(mockWorkflowDefinition);
    expect(createdWorkflow.status).toBe('pending');
    expect(result.current.workflows).toContain(createdWorkflow);
  });

  it('executes a workflow', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    // Create workflow first
    let workflow: any;
    await act(async () => {
      workflow = await result.current.createWorkflow(mockWorkflowDefinition);
    });

    // Execute workflow
    let executionResult: any;
    await act(async () => {
      executionResult = await result.current.executeWorkflow(workflow.id, {
        description: 'Test execution'
      });
    });

    expect(executionResult).toBeDefined();
    
    // Check that workflow status was updated
    const updatedWorkflow = result.current.getWorkflowState(workflow.id);
    expect(updatedWorkflow?.status).toBe('completed');
  });

  it('handles workflow execution with file upload', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    // Mock file
    const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });

    // Upload file first
    let uploadResult: any;
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile);
    });

    expect(uploadResult).toBeDefined();
    expect(uploadResult.success).toBe(true);

    // Create and execute workflow with uploaded file
    let workflow: any;
    await act(async () => {
      workflow = await result.current.createWorkflow(mockWorkflowDefinition);
    });

    await act(async () => {
      await result.current.executeWorkflow(workflow.id, {
        description: 'Test execution with file',
        uploadedFile: mockFile
      });
    });

    const updatedWorkflow = result.current.getWorkflowState(workflow.id);
    expect(updatedWorkflow?.status).toBe('completed');
  });

  it('gets workflow state correctly', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    // Create workflow
    let workflow: any;
    await act(async () => {
      workflow = await result.current.createWorkflow(mockWorkflowDefinition);
    });

    const retrievedWorkflow = result.current.getWorkflowState(workflow.id);
    expect(retrievedWorkflow).toEqual(workflow);

    // Test non-existent workflow
    const nonExistentWorkflow = result.current.getWorkflowState('non-existent-id');
    expect(nonExistentWorkflow).toBeUndefined();
  });

  it('handles file upload successfully', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });

    let uploadResult: any;
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile);
    });

    expect(uploadResult.success).toBe(true);
    expect(uploadResult.rowCount).toBe(1);
    expect(uploadResult.columns).toEqual(['test', 'data']);
  });

  it('handles non-CSV file upload with error', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    const mockFile = new File(['not csv content'], 'test.txt', { type: 'text/plain' });

    let uploadResult: any;
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile);
    });

    expect(uploadResult.success).toBe(false);
    expect(uploadResult.error).toBe('Only CSV files are supported');
  });

  it('simulates workflow step execution with proper timing', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    // Create workflow with multiple steps
    const multiStepWorkflow: WorkflowDefinition = {
      ...mockWorkflowDefinition,
      nodes: [
        { id: 'step1', name: 'Step 1', type: 'data-input', description: 'Step 1', config: {} },
        { id: 'step2', name: 'Step 2', type: 'data-processor', description: 'Step 2', config: {} },
        { id: 'step3', name: 'Step 3', type: 'output', description: 'Step 3', config: {} }
      ]
    };

    let workflow: any;
    await act(async () => {
      workflow = await result.current.createWorkflow(multiStepWorkflow);
    });

    // Start execution (don't await to observe intermediate states)
    act(() => {
      result.current.executeWorkflow(workflow.id, { description: 'Multi-step test' });
    });

    // Check that workflow status changes during execution
    let currentWorkflow = result.current.getWorkflowState(workflow.id);
    expect(currentWorkflow?.status).toBe('running');

    // Fast-forward through execution
    await act(async () => {
      vi.advanceTimersByTime(5000); // Fast forward through all steps
      await waitFor(() => {
        const finalWorkflow = result.current.getWorkflowState(workflow.id);
        expect(finalWorkflow?.status).toBe('completed');
      });
    });
  });

  it('maintains workflow list correctly', async () => {
    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    // Create multiple workflows
    const workflows: any[] = [];
    
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        const workflow = await result.current.createWorkflow({
          ...mockWorkflowDefinition,
          id: `test-workflow-${i}`,
          name: `Test Workflow ${i}`
        });
        workflows.push(workflow);
      });
    }

    expect(result.current.workflows).toHaveLength(3);
    expect(result.current.workflows).toEqual(expect.arrayContaining(workflows));
  });
});