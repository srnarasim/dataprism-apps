import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  BackgroundVariant,
  ConnectionLineType,
  Handle,
  Position
} from '@xyflow/react';
import type { 
  Node, 
  Edge, 
  Connection, 
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { WorkflowDefinition } from '@/types/workflow';

// Custom Node Component
const WorkflowStepNode = ({ data, selected }: any) => {
  const { step, status, isCurrentStep, onClick } = data;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'running': return 'border-amber-500 bg-amber-50';
      case 'failed': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '⏳';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'data-input': '📊',
      'data-processor': '⚙️',
      'mcp-tool': '🔗',
      'llm-agent': '🤖',
      'human-review': '👁️',
      'output': '📋'
    };
    return icons[type] || '📄';
  };

  return (
    <>
      {/* Input handle on the left */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        isConnectable={true}
      />
      
      <div
        className={`px-4 py-3 shadow-lg rounded-lg border-2 cursor-pointer transition-all duration-200 min-w-[200px] ${
          getStatusColor(status)
        } ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''} ${
          isCurrentStep ? 'ring-2 ring-green-400 ring-offset-2 shadow-green-200' : ''
        }`}
        onClick={() => onClick?.(step.id)}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getNodeIcon(step.type)}</span>
          <span className="text-lg">{getStatusIcon(status)}</span>
        </div>
        {status === 'running' && (
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Title */}
      <div className="font-semibold text-gray-900 mb-1 text-sm leading-tight">
        {step.name}
      </div>

      {/* Type */}
      <div className="text-xs text-gray-600 capitalize mb-2">
        {step.type.replace('-', ' ')}
      </div>

      {/* Progress Bar for Running Steps */}
      {status === 'running' && isCurrentStep && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 rounded-full animate-pulse w-3/4 shadow-sm"></div>
        </div>
      )}

      {/* Success indicator for completed steps */}
      {status === 'completed' && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
          ✓
        </div>
      )}

        {/* Status Text */}
        <div className="text-xs font-medium capitalize text-gray-700">
          {status === 'running' && isCurrentStep ? 'Currently running...' : status}
        </div>
      </div>

      {/* Output handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        isConnectable={true}
      />
    </>
  );
};


interface ReactFlowVisualizerProps {
  workflow: WorkflowDefinition;
  currentStep?: string | null;
  stepStatuses?: Record<string, 'pending' | 'running' | 'completed' | 'failed'>;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export const ReactFlowVisualizer: React.FC<ReactFlowVisualizerProps> = ({
  workflow,
  currentStep,
  stepStatuses = {},
  onNodeClick,
  className = ''
}) => {
  // Convert workflow definition to React Flow format with auto-layout
  const initialNodes: Node[] = useMemo(() => {
    return workflow.nodes.map((node, index) => {
      // Calculate optimal positioning based on workflow structure
      const nodesPerRow = Math.min(3, workflow.nodes.length); // Max 3 nodes per row
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      // Center nodes in each row
      const totalCols = Math.min(nodesPerRow, workflow.nodes.length - row * nodesPerRow);
      const xOffset = (nodesPerRow - totalCols) * 140; // Center offset
      
      return {
        id: node.id,
        type: 'workflowStep',
        position: { 
          x: col * 280 + xOffset + 50, // Horizontal spacing with centering
          y: row * 200 + 100 // Vertical spacing between rows
        },
        data: {
          step: node,
          status: stepStatuses[node.id] || 'pending',
          isCurrentStep: currentStep === node.id,
          onClick: onNodeClick
        },
        draggable: true,
      };
    });
  }, [workflow.nodes, stepStatuses, currentStep, onNodeClick]);

  const initialEdges: Edge[] = useMemo(() => {
    return workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      animated: stepStatuses[edge.from] === 'running',
      style: { 
        stroke: stepStatuses[edge.from] === 'completed' ? '#10b981' : '#6b7280',
        strokeWidth: 2.5
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: stepStatuses[edge.from] === 'completed' ? '#10b981' : '#6b7280',
      },
      label: edge.label,
      labelStyle: { 
        fontSize: 12, 
        fontWeight: 600, 
        fill: '#374151' 
      },
      labelBgStyle: { 
        fill: '#ffffff', 
        fillOpacity: 0.9,
        rx: 4,
        ry: 4
      }
    }));
  }, [workflow.edges, stepStatuses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Debug React Flow state (can be removed in production)
  React.useEffect(() => {
    console.log('[ReactFlowVisualizer] Loaded:', nodes.length, 'nodes,', edges.length, 'edges');
    if (edges.length === 0) {
      console.log('[ReactFlowVisualizer] Warning: No edges loaded!');
    }
  }, [nodes.length, edges.length]);

  // Update nodes when props change
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: stepStatuses[node.id] || 'pending',
          isCurrentStep: currentStep === node.id,
        },
      }))
    );
  }, [stepStatuses, currentStep, setNodes]);

  // Update edges when statuses change
  React.useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: stepStatuses[edge.source] === 'running',
        style: { 
          stroke: stepStatuses[edge.source] === 'completed' ? '#10b981' : '#6b7280',
          strokeWidth: 2.5 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stepStatuses[edge.source] === 'completed' ? '#10b981' : '#6b7280',
        },
      }))
    );
  }, [stepStatuses, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Define custom node types (using built-in edges)
  const nodeTypes: NodeTypes = useMemo(() => ({
    workflowStep: WorkflowStepNode,
  }), []);

  return (
    <div className={`workflow-visualizer-reactflow ${className}`} style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls 
          position="top-left"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap 
          position="top-right"
          nodeStrokeColor={(n) => {
            const status = stepStatuses[n.id] || 'pending';
            switch (status) {
              case 'completed': return '#10b981';
              case 'running': return '#f59e0b';
              case 'failed': return '#ef4444';
              default: return '#6b7280';
            }
          }}
          nodeColor={(n) => {
            const status = stepStatuses[n.id] || 'pending';
            switch (status) {
              case 'completed': return '#d1fae5';
              case 'running': return '#fef3c7';
              case 'failed': return '#fee2e2';
              default: return '#f9fafb';
            }
          }}
          pannable
          zoomable
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
        
        {/* Status Legend Panel */}
        <Panel position="top-center">
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold mb-2">Workflow Status</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Running</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Failed</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Help Panel */}
        <Panel position="bottom-left">
          <div className="bg-white border rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-600 space-y-1">
              <div>🖱️ Click nodes for details</div>
              <div>🔍 Scroll to zoom</div>
              <div>✋ Drag to pan</div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};