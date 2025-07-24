import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReactFlowVisualizer } from '@/components/workflow/ReactFlowVisualizer';
import type { WorkflowDefinition } from '@/types/workflow';

// Mock React Flow
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, nodes, edges, onNodesChange, onEdgesChange }: any) => (
    <div data-testid="react-flow">
      <div data-testid="nodes">{JSON.stringify(nodes)}</div>
      <div data-testid="edges">{JSON.stringify(edges)}</div>
      {children}
    </div>
  ),
  Controls: () => <div data-testid="controls">Controls</div>,
  MiniMap: () => <div data-testid="minimap">MiniMap</div>,
  Background: () => <div data-testid="background">Background</div>,
  Panel: ({ children }: any) => <div data-testid="panel">{children}</div>,
  Handle: ({ type, position }: any) => <div data-testid={`handle-${type}-${position}`} />,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom'
  },
  MarkerType: {
    ArrowClosed: 'arrowclosed'
  },
  BackgroundVariant: {
    Dots: 'dots'
  },
  ConnectionLineType: {
    SmoothStep: 'smoothstep'
  },
  useNodesState: (initialNodes: any) => [initialNodes, vi.fn(), vi.fn()],
  useEdgesState: (initialEdges: any) => [initialEdges, vi.fn(), vi.fn()],
  addEdge: vi.fn()
}));

const mockWorkflow: WorkflowDefinition = {
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
    },
    {
      id: 'node2',
      name: 'Data Processing',
      type: 'data-processor',
      description: 'Process data',
      config: {}
    },
    {
      id: 'node3',
      name: 'Generate Report',
      type: 'output',
      description: 'Generate output report',
      config: {}
    }
  ],
  edges: [
    {
      id: 'edge1',
      from: 'node1',
      to: 'node2',
      label: 'Process'
    },
    {
      id: 'edge2',
      from: 'node2',
      to: 'node3',
      label: 'Output'
    }
  ]
};

describe('ReactFlowVisualizer', () => {
  const mockOnNodeClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders React Flow with correct components', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        onNodeClick={mockOnNodeClick}
      />
    );

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
    expect(screen.getByTestId('background')).toBeInTheDocument();
  });

  it('creates correct number of nodes from workflow definition', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        onNodeClick={mockOnNodeClick}
      />
    );

    const nodesData = screen.getByTestId('nodes');
    const nodes = JSON.parse(nodesData.textContent || '[]');
    
    expect(nodes).toHaveLength(3);
    expect(nodes[0].id).toBe('node1');
    expect(nodes[1].id).toBe('node2');
    expect(nodes[2].id).toBe('node3');
  });

  it('creates correct number of edges from workflow definition', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        onNodeClick={mockOnNodeClick}
      />
    );

    const edgesData = screen.getByTestId('edges');
    const edges = JSON.parse(edgesData.textContent || '[]');
    
    expect(edges).toHaveLength(2);
    expect(edges[0].source).toBe('node1');
    expect(edges[0].target).toBe('node2');
    expect(edges[1].source).toBe('node2');
    expect(edges[1].target).toBe('node3');
  });

  it('applies correct styling based on step statuses', () => {
    const stepStatuses = {
      'node1': 'completed' as const,
      'node2': 'running' as const,
      'node3': 'pending' as const
    };

    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        stepStatuses={stepStatuses}
        onNodeClick={mockOnNodeClick}
      />
    );

    const nodesData = screen.getByTestId('nodes');
    const nodes = JSON.parse(nodesData.textContent || '[]');
    
    expect(nodes[0].data.status).toBe('completed');
    expect(nodes[1].data.status).toBe('running');
    expect(nodes[2].data.status).toBe('pending');
  });

  it('highlights current step correctly', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        currentStep="node2"
        onNodeClick={mockOnNodeClick}
      />
    );

    const nodesData = screen.getByTestId('nodes');
    const nodes = JSON.parse(nodesData.textContent || '[]');
    
    expect(nodes[0].data.isCurrentStep).toBe(false);
    expect(nodes[1].data.isCurrentStep).toBe(true);
    expect(nodes[2].data.isCurrentStep).toBe(false);
  });

  it('renders status legend panel', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        onNodeClick={mockOnNodeClick}
      />
    );

    expect(screen.getByText('Workflow Status')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders help panel with instructions', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        onNodeClick={mockOnNodeClick}
      />
    );

    expect(screen.getByText('🖱️ Click nodes for details')).toBeInTheDocument();
    expect(screen.getByText('🔍 Scroll to zoom')).toBeInTheDocument();
    expect(screen.getByText('✋ Drag to pan')).toBeInTheDocument();
  });

  it('calculates auto-layout positions correctly', () => {
    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        onNodeClick={mockOnNodeClick}
      />
    );

    const nodesData = screen.getByTestId('nodes');
    const nodes = JSON.parse(nodesData.textContent || '[]');
    
    // Check that nodes have different positions
    expect(nodes[0].position.x).not.toBe(nodes[1].position.x);
    expect(nodes[0].position.y).toBeDefined();
    expect(nodes[1].position.y).toBeDefined();
    expect(nodes[2].position.y).toBeDefined();
  });

  it('handles edge animation for running steps', () => {
    const stepStatuses = {
      'node1': 'running' as const,
      'node2': 'pending' as const
    };

    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        stepStatuses={stepStatuses}
        onNodeClick={mockOnNodeClick}
      />
    );

    const edgesData = screen.getByTestId('edges');
    const edges = JSON.parse(edgesData.textContent || '[]');
    
    expect(edges[0].animated).toBe(true); // node1 is running
    expect(edges[1].animated).toBe(false); // node2 is not running
  });

  it('applies correct edge colors based on completion status', () => {
    const stepStatuses = {
      'node1': 'completed' as const,
      'node2': 'pending' as const
    };

    render(
      <ReactFlowVisualizer
        workflow={mockWorkflow}
        stepStatuses={stepStatuses}
        onNodeClick={mockOnNodeClick}
      />
    );

    const edgesData = screen.getByTestId('edges');
    const edges = JSON.parse(edgesData.textContent || '[]');
    
    expect(edges[0].style.stroke).toBe('#10b981'); // Green for completed
    expect(edges[1].style.stroke).toBe('#6b7280'); // Gray for pending
  });
});