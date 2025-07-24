import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '@/App';
import * as DataPrismMCPContext from '@/contexts/DataPrismMCPContext';

// Mock the DataPrism MCP Context
vi.mock('@/contexts/DataPrismMCPContext', () => ({
  DataPrismMCPProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDataPrismMCP: vi.fn()
}));

const mockUseDataPrismMCP = {
  isInitialized: true,
  isInitializing: false,
  initializationError: null,
  workflows: [],
  createWorkflow: vi.fn(),
  executeWorkflow: vi.fn(),
  getWorkflowState: vi.fn(),
  uploadFile: vi.fn()
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(DataPrismMCPContext.useDataPrismMCP).mockReturnValue(mockUseDataPrismMCP);
  });

  it('renders the application header correctly', () => {
    render(<App />);
    
    expect(screen.getByText('MCP Analytics Workflow')).toBeInTheDocument();
    expect(screen.getByText('Automated Sales Data Quality and Insight Agent')).toBeInTheDocument();
    expect(screen.getByText('v3.0 - React Flow Professional Visualizer')).toBeInTheDocument();
  });

  it('shows loading state when not initialized', () => {
    vi.mocked(DataPrismMCPContext.useDataPrismMCP).mockReturnValue({
      ...mockUseDataPrismMCP,
      isInitialized: false,
      isInitializing: true
    });

    render(<App />);
    
    expect(screen.getByText('Loading DataPrism MCP Analytics')).toBeInTheDocument();
    expect(screen.getByText('Setting up plugins and connecting to services...')).toBeInTheDocument();
  });

  it('shows initialization error when present', () => {
    vi.mocked(DataPrismMCPContext.useDataPrismMCP).mockReturnValue({
      ...mockUseDataPrismMCP,
      isInitialized: false,
      initializationError: new Error('Failed to connect to DataPrism')
    });

    render(<App />);
    
    expect(screen.getByText('Initialization Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to DataPrism')).toBeInTheDocument();
    expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
  });

  it('renders file upload section', () => {
    render(<App />);
    
    expect(screen.getByText('Data Upload')).toBeInTheDocument();
    expect(screen.getByText('📊 Choose CSV File')).toBeInTheDocument();
    expect(screen.getByText('📥 Download sample CSV')).toBeInTheDocument();
  });

  it('handles CSV file upload', async () => {
    const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });
    mockUseDataPrismMCP.uploadFile.mockResolvedValue({ success: true });

    render(<App />);
    
    const fileInput = screen.getByRole('button', { name: /choose csv file/i }).querySelector('input');
    expect(fileInput).toBeInTheDocument();
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
    }
    
    await waitFor(() => {
      expect(mockUseDataPrismMCP.uploadFile).toHaveBeenCalledWith(mockFile);
    });
  });

  it('downloads sample CSV when clicked', () => {
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

    render(<App />);
    
    const downloadButton = screen.getByText('📥 Download sample CSV');
    fireEvent.click(downloadButton);
    
    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('starts workflow when button is clicked', async () => {
    const mockWorkflow = { id: 'test-workflow-123', status: 'running' };
    mockUseDataPrismMCP.createWorkflow.mockResolvedValue(mockWorkflow);
    mockUseDataPrismMCP.executeWorkflow.mockResolvedValue({});

    render(<App />);
    
    const startButton = screen.getByText('🚀 Start New Workflow');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockUseDataPrismMCP.createWorkflow).toHaveBeenCalled();
      expect(mockUseDataPrismMCP.executeWorkflow).toHaveBeenCalledWith(
        mockWorkflow.id,
        expect.objectContaining({
          description: 'Demo sales analysis workflow execution'
        })
      );
    });
  });

  it('shows workflow status when workflow is running', () => {
    const mockWorkflow = {
      id: 'test-workflow',
      status: 'running',
      steps: [
        { id: 'step1', name: 'Data Input', status: 'completed' },
        { id: 'step2', name: 'Processing', status: 'running' }
      ],
      currentStep: 'step2'
    };
    
    mockUseDataPrismMCP.getWorkflowState.mockReturnValue(mockWorkflow);

    render(<App />);
    
    // Simulate having a current workflow
    const startButton = screen.getByText('🚀 Start New Workflow');
    fireEvent.click(startButton);
    
    // Re-render with workflow state
    vi.mocked(DataPrismMCPContext.useDataPrismMCP).mockReturnValue({
      ...mockUseDataPrismMCP,
      workflows: [mockWorkflow]
    });
    
    render(<App />);
    
    expect(screen.getByText('Status: RUNNING')).toBeInTheDocument();
  });

  it('shows documentation button and modal', () => {
    render(<App />);
    
    const docButtons = screen.getAllByText('📚 How It\'s Built');
    expect(docButtons).toHaveLength(2); // Header and footer
    
    fireEvent.click(docButtons[0]);
    
    // Modal should be rendered - check for specific modal content instead
    expect(screen.getByText('⚡ DataPrism Framework')).toBeInTheDocument();
  });

  it('shows audit log toggle button', () => {
    render(<App />);
    
    const auditButton = screen.getByText('📝 Show Audit Log');
    expect(auditButton).toBeInTheDocument();
    
    fireEvent.click(auditButton);
    expect(screen.getByText('📝 Hide Audit Log')).toBeInTheDocument();
  });

  it('disables start button when workflow is running', () => {
    const mockWorkflow = {
      id: 'test-workflow',
      status: 'running',
      steps: [],
      currentStep: null
    };
    
    mockUseDataPrismMCP.getWorkflowState.mockReturnValue(mockWorkflow);

    render(<App />);
    
    // Simulate workflow running state
    vi.mocked(DataPrismMCPContext.useDataPrismMCP).mockReturnValue({
      ...mockUseDataPrismMCP,
      workflows: [mockWorkflow]
    });
    
    render(<App />);
    
    const startButton = screen.getByRole('button', { name: /running/i });
    expect(startButton).toBeDisabled();
  });
});