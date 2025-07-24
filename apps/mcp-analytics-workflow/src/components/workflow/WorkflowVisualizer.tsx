import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { WorkflowDefinition, WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface WorkflowVisualizerProps {
  workflow: WorkflowDefinition;
  currentStep?: string | null;
  stepStatuses?: Record<string, 'pending' | 'running' | 'completed' | 'failed'>;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  className?: string;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  currentStep,
  stepStatuses = {},
  onNodeClick,
  onEdgeClick,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  // Auto-layout function to position nodes optimally
  const calculateAutoLayout = (nodes: WorkflowNode[], width: number, height: number) => {
    const padding = 60;
    const nodeWidth = 180;
    const nodeHeight = 80;
    
    // Calculate optimal grid layout
    const nodeCount = nodes.length;
    const cols = Math.ceil(Math.sqrt(nodeCount * 1.5)); // Slightly wider than square
    const rows = Math.ceil(nodeCount / cols);
    
    // Calculate spacing to fit within bounds
    const availableWidth = width - (2 * padding);
    const availableHeight = height - (2 * padding);
    const spacingX = Math.max(nodeWidth + 40, availableWidth / Math.max(cols - 1, 1));
    const spacingY = Math.max(nodeHeight + 40, availableHeight / Math.max(rows - 1, 1));
    
    // Center the entire layout
    const totalLayoutWidth = (cols - 1) * spacingX;
    const totalLayoutHeight = (rows - 1) * spacingY;
    const offsetX = (width - totalLayoutWidth) / 2;
    const offsetY = (height - totalLayoutHeight) / 2;
    
    return nodes.map((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      return {
        ...node,
        position: {
          x: offsetX + col * spacingX - nodeWidth / 2,
          y: offsetY + row * spacingY - nodeHeight / 2
        }
      };
    });
  };

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width, 800),
          height: Math.max(rect.height, 500)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !workflow) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Setup dimensions and viewBox with auto-layout
    const { width, height } = dimensions;
    
    // Calculate auto-layout positions
    const layoutNodes = calculateAutoLayout(workflow.nodes, width, height);
    const layoutWorkflow = { ...workflow, nodes: layoutNodes };

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'workflow-container');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Define node dimensions and styling
    const nodeWidth = 180;
    const nodeHeight = 80;
    const nodeRadius = 8;

    // Define improved arrow marker for edges
    const defs = svg.append('defs');
    
    // Standard arrowhead
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 9)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4L2,0Z')
      .attr('fill', '#4b5563')
      .attr('stroke', 'none');
    
    // Hover arrowhead
    defs.append('marker')
      .attr('id', 'arrowhead-hover')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 9)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4L2,0Z')
      .attr('fill', '#2563eb')
      .attr('stroke', 'none');

    // Add glow filter for current step
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create edges first (so they appear behind nodes)
    const edgeGroup = g.append('g').attr('class', 'edges');
    
    layoutWorkflow.edges.forEach(edge => {
      const fromNode = layoutWorkflow.nodes.find(n => n.id === edge.from);
      const toNode = layoutWorkflow.nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      // Calculate edge connection points (right side of from node to left side of to node)
      const fromX = fromNode.position.x + nodeWidth;
      const fromY = fromNode.position.y + nodeHeight / 2;
      const toX = toNode.position.x;
      const toY = toNode.position.y + nodeHeight / 2;

      // Calculate midpoint and curve control points
      const midX = (fromX + toX) / 2;
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      
      // Create subtle curved path - gentle upward curve
      const controlOffset = Math.max(40, Math.abs(deltaX) * 0.3);
      const curveHeight = 25; // Gentler upward curve
      
      const path = `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY - curveHeight}, ${toX - controlOffset} ${toY - curveHeight}, ${toX} ${toY}`;
      
      // Debug logging (can be removed in production)
      // console.log(`[WorkflowVisualizer] Edge ${edge.from} -> ${edge.to}:`, {
      //   fromNode: fromNode.position, toNode: toNode.position, fromX, fromY, toX, toY, path
      // });

      const edgeElement = edgeGroup.append('g')
        .attr('class', 'edge')
        .style('cursor', onEdgeClick ? 'pointer' : 'default');

      // Edge path with subtle curved styling
      const edgePath = edgeElement.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 0.7)
        .attr('marker-end', 'url(#arrowhead)')
        .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))')
        .style('transition', 'all 0.2s ease');

      // Edge label if present (positioned at curve midpoint)
      if (edge.label) {
        edgeElement.append('text')
          .attr('x', midX)
          .attr('y', (fromY + toY) / 2 - 8)
          .attr('text-anchor', 'middle')
          .attr('class', 'edge-label')
          .style('font-size', '10px')
          .style('fill', '#4b5563')
          .style('font-weight', '600')
          .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
          .text(edge.label);
      }

      // Enhanced interaction handlers
      if (onEdgeClick) {
        edgeElement
          .style('cursor', 'pointer')
          .on('click', () => onEdgeClick(edge.id))
          .on('mouseenter', function() {
            edgePath
              .attr('stroke', '#4b5563')
              .attr('stroke-width', 3)
              .attr('opacity', 0.9)
              .attr('marker-end', 'url(#arrowhead-hover)');
          })
          .on('mouseleave', function() {
            edgePath
              .attr('stroke', '#6b7280')
              .attr('stroke-width', 2.5)
              .attr('opacity', 0.7)
              .attr('marker-end', 'url(#arrowhead)');
          });
      }
    });

    // Create nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    layoutWorkflow.nodes.forEach(node => {
      const status = stepStatuses[node.id] || 'pending';
      const isCurrentStep = currentStep === node.id;

      const nodeElement = nodeGroup.append('g')
        .attr('class', `node node-${node.type} node-${status}`)
        .attr('transform', `translate(${node.position.x}, ${node.position.y})`)
        .style('cursor', onNodeClick ? 'pointer' : 'default');

      // Node background
      const nodeRect = nodeElement.append('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', nodeRadius)
        .attr('ry', nodeRadius)
        .attr('fill', getNodeColor(node.type, status))
        .attr('stroke', isCurrentStep ? '#10b981' : getNodeBorderColor(status))
        .attr('stroke-width', isCurrentStep ? 3 : 1)
        .attr('class', 'node-background');

      // Add glow effect for current step
      if (isCurrentStep) {
        nodeRect.attr('filter', 'url(#glow)');
      }

      // Node icon
      const iconSize = 20;
      nodeElement.append('text')
        .attr('x', 15)
        .attr('y', 25)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', iconSize)
        .attr('fill', '#374151')
        .text(getNodeIcon(node.type));

      // Node title
      nodeElement.append('text')
        .attr('x', 40)
        .attr('y', 22)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .attr('fill', '#111827')
        .text(truncateText(node.name, 18));

      // Node type label
      nodeElement.append('text')
        .attr('x', 40)
        .attr('y', 36)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '10px')
        .attr('fill', '#6b7280')
        .text(node.type.replace('-', ' '));

      // Status indicator
      const statusIndicator = nodeElement.append('circle')
        .attr('cx', nodeWidth - 15)
        .attr('cy', 15)
        .attr('r', 5)
        .attr('fill', getStatusColor(status));

      // Add pulse animation for running status
      if (status === 'running') {
        statusIndicator
          .style('animation', 'pulse-slow 2s infinite')
          .attr('opacity', 0.8);
      }

      // Progress bar for running steps
      if (status === 'running' && isCurrentStep) {
        const progressBar = nodeElement.append('rect')
          .attr('x', 8)
          .attr('y', nodeHeight - 8)
          .attr('width', 0)
          .attr('height', 3)
          .attr('fill', '#10b981')
          .attr('rx', 1.5);

        // Animate progress bar
        progressBar.transition()
          .duration(3000)
          .attr('width', nodeWidth - 16)
          .ease(d3.easeLinear);
      }

      // Completion checkmark
      if (status === 'completed') {
        nodeElement.append('text')
          .attr('x', nodeWidth - 15)
          .attr('y', 20)
          .attr('font-family', 'Arial, sans-serif')
          .attr('font-size', 12)
          .attr('fill', '#10b981')
          .attr('text-anchor', 'middle')
          .text('✓');
      }

      // Error indicator
      if (status === 'failed') {
        nodeElement.append('text')
          .attr('x', nodeWidth - 15)
          .attr('y', 20)
          .attr('font-family', 'Arial, sans-serif')
          .attr('font-size', 12)
          .attr('fill', '#ef4444')
          .attr('text-anchor', 'middle')
          .text('✗');
      }

      // Click handler
      if (onNodeClick) {
        nodeElement.on('click', () => onNodeClick(node.id));
      }

      // Hover effects
      nodeElement
        .on('mouseenter', function() {
          d3.select(this).select('.node-background')
            .transition()
            .duration(200)
            .attr('stroke-width', isCurrentStep ? 3 : 2)
            .attr('transform', 'scale(1.02)');
        })
        .on('mouseleave', function() {
          d3.select(this).select('.node-background')
            .transition()
            .duration(200)
            .attr('stroke-width', isCurrentStep ? 3 : 1)
            .attr('transform', 'scale(1)');
        });
    });

  }, [workflow, currentStep, stepStatuses, dimensions, onNodeClick, onEdgeClick]);

  // Helper functions
  const getNodeColor = (type: string, status: string): string => {
    if (status === 'failed') return '#fef2f2';
    if (status === 'completed') return '#f0fdf4';
    if (status === 'running') return '#fffbeb';
    
    const colors: Record<string, string> = {
      'data-input': '#eff6ff',
      'data-processor': '#f0f9ff',
      'mcp-tool': '#f3e8ff',
      'llm-agent': '#fef3c7',
      'human-review': '#fef7ed',
      'output': '#f0fdf4'
    };
    return colors[type] || '#f9fafb';
  };

  const getNodeBorderColor = (status: string): string => {
    const colors: Record<string, string> = {
      'pending': '#d1d5db',
      'running': '#f59e0b',
      'completed': '#10b981',
      'failed': '#ef4444'
    };
    return colors[status] || '#d1d5db';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'pending': '#9ca3af',
      'running': '#f59e0b',
      'completed': '#10b981',
      'failed': '#ef4444'
    };
    return colors[status] || '#9ca3af';
  };

  const getNodeIcon = (type: string): string => {
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

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div ref={containerRef} className={`workflow-visualizer relative ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="border rounded-lg bg-white shadow-sm"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white border rounded-lg p-3 shadow-sm">
        <h4 className="text-sm font-semibold mb-2">Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Failed</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>🖱️ Click nodes for details</span>
          <span>•</span>
          <span>🔍 Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};