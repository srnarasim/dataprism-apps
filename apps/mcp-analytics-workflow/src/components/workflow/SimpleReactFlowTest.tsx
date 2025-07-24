import React from 'react';
import { ReactFlow, Controls, Background, MarkerType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Minimal test component to verify React Flow edges work
export const SimpleReactFlowTest: React.FC = () => {
  const nodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 400, y: 100 },
      data: { label: 'Node 2' },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 700, y: 100 },
      data: { label: 'Node 3' },
    },
  ];

  const edges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      style: { stroke: '#ff0000', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ff0000' },
      label: 'Edge 1-2'
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'smoothstep',
      style: { stroke: '#0000ff', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0000ff' },
      label: 'Edge 2-3'
    },
  ];

  console.log('[SimpleReactFlowTest] Nodes:', nodes);
  console.log('[SimpleReactFlowTest] Edges:', edges);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};