# Product Requirements Prompt: MCP Analytics Workflow App

## Executive Summary

Implement an advanced demo application that showcases DataPrism's Model Context Protocol (MCP) and LangGraph integration capabilities through an intelligent, agentic analytics workflow. The app demonstrates external tool orchestration, multi-agent coordination, and full workflow traceability using the MCP ecosystem for tool interoperability and LangGraph for defining complex, branching analytics pipelines.

**Primary Objectives:**
- Create an interactive "Automated Sales Data Quality and Insight Agent" workflow
- Demonstrate seamless integration between DataPrism plugins, external MCP tools, and LangGraph orchestration
- Provide comprehensive workflow visualization, tracing, and debugging capabilities
- Establish a canonical example for agentic analytics implementations in DataPrism

**Architecture Layer:** Full-stack integration (DataPrism Core + MCP Plugin + LangGraph Plugin + React Frontend)

## Context and Background

### Current State

DataPrism Apps currently includes:
- **Demo Analytics App**: React-based interactive demonstration with CDN-based DataPrism loading
- **Plugin Ecosystem**: Comprehensive plugin framework with 7 official plugins including MCP and LangGraph integration
- **CDN Infrastructure**: Optimized delivery via GitHub Pages with progressive loading
- **Working Implementations**: Fallback plugin implementations for reliable demo functionality

### Why This Feature is Needed

1. **MCP Ecosystem Showcase**: Demonstrate DataPrism's capability to integrate with external tools via the emerging Model Context Protocol standard
2. **Agentic Analytics**: Show how LangGraph enables sophisticated multi-agent workflows for complex data analysis scenarios
3. **Developer Education**: Provide a concrete, extensible example of orchestrating multiple plugins for advanced analytics workflows
4. **Marketing Demonstration**: Create a compelling showcase for DataPrism's advanced capabilities

### Architecture Integration

The MCP Analytics Workflow App integrates across multiple architectural layers:
- **CDN Layer**: MCP and LangGraph plugins loaded via optimized CDN bundles
- **Plugin Layer**: Real plugin integration with fallback working implementations
- **Application Layer**: React components for workflow visualization and interaction
- **Orchestration Layer**: LangGraph workflow definitions with MCP tool integrations

## Technical Specifications

### Core Requirements

**Performance Targets:**
- Complete workflow execution (100k-row CSV): <10 seconds per step
- Plugin loading time: <2 seconds
- Workflow visualization rendering: <500ms
- Memory usage: <512MB for complete workflow

**Security Specifications:**
- MCP connections authenticated via JWT/OAuth2
- External tool execution in sandboxed environments
- Permission-based access control for all operations
- No data leakage between workflow steps

**Browser Compatibility:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Progressive enhancement for varying JavaScript capabilities
- Responsive design for desktop and tablet interfaces

### Integration Specifications

**MCP Integration:**
- Connect to at least one real external MCP server
- Dynamic tool discovery and registration
- Secure tool invocation with timeout handling
- Error recovery and retry mechanisms

**LangGraph Integration:**
- Graph-based workflow definition and execution
- Multi-agent coordination with specialized analytics agents
- State persistence across workflow steps
- Branch condition handling and parallel execution

**DataPrism Plugin Integration:**
- CSV Importer for data ingestion
- IronCalc for spreadsheet-style calculations
- Observable Charts for visualization generation
- Performance Monitor for workflow metrics

## Implementation Plan

### Phase 1: Environment Setup and Dependencies (2 hours)

**Step 1.1: Create Application Structure**
```bash
# Create new app directory in dataprism-apps
cd /Users/i851894/projects/temp-restructure/dataprism-apps/apps
mkdir mcp-analytics-workflow
cd mcp-analytics-workflow

# Initialize React + TypeScript + Vite project
npm create vite@latest . -- --template react-ts
npm install

# Install additional dependencies
npm install @types/d3 tailwindcss @headlessui/react @heroicons/react
npm install --save-dev @types/node
```

**Step 1.2: Configure Build System**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/dataprism-apps/mcp-analytics-workflow/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'dataprism-cdn': ['../../../utils/cdn-loader'],
          'workflow-engine': ['./src/contexts/WorkflowContext'],
          'visualization': ['./src/components/workflow/WorkflowVisualizer']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['d3', 'react', 'react-dom']
  }
})
```

**Step 1.3: Setup Tailwind CSS**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#2196f3',
        accent: '#03dac6',
        workflow: {
          node: '#f3f4f6',
          edge: '#6b7280',
          active: '#10b981',
          error: '#ef4444',
          pending: '#f59e0b'
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3'
      }
    },
  },
  plugins: [],
}
```

### Phase 2: Core Infrastructure Implementation (4 hours)

**Step 2.1: DataPrism CDN Integration Context**
```typescript
// src/contexts/DataPrismMCPContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadDataPrismDependencies, type LoadedDependencies } from '@/utils/cdn-loader';

interface MCPConnection {
  id: string;
  serverUrl: string;
  authenticated: boolean;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}

interface MCPTool {
  name: string;
  description: string;
  schema: any;
  connection: string;
}

interface WorkflowState {
  id: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  currentStep: string | null;
  steps: WorkflowStep[];
  result?: any;
  error?: string;
}

interface DataPrismMCPContextValue {
  // Core DataPrism
  dependencies: LoadedDependencies | null;
  engine: any | null;
  isInitialized: boolean;
  initializationError: Error | null;
  
  // MCP Integration
  mcpConnections: MCPConnection[];
  connectToMCPServer: (serverUrl: string, auth?: any) => Promise<MCPConnection>;
  disconnectFromMCPServer: (connectionId: string) => Promise<void>;
  invokeMCPTool: (connectionId: string, toolName: string, params: any) => Promise<any>;
  
  // LangGraph Integration
  workflows: WorkflowState[];
  createWorkflow: (definition: any) => Promise<WorkflowState>;
  executeWorkflow: (workflowId: string, input: any) => Promise<any>;
  getWorkflowState: (workflowId: string) => WorkflowState | null;
  
  // Plugin Operations
  loadPlugin: (pluginId: string) => Promise<any>;
  getPlugin: (pluginId: string) => any | null;
  
  // Utilities
  retry: () => Promise<void>;
}

const DataPrismMCPContext = createContext<DataPrismMCPContextValue | null>(null);

export function useDataPrismMCP() {
  const context = useContext(DataPrismMCPContext);
  if (!context) {
    throw new Error('useDataPrismMCP must be used within a DataPrismMCPProvider');
  }
  return context;
}

export function DataPrismMCPProvider({ children }: { children: React.ReactNode }) {
  const [dependencies, setDependencies] = useState<LoadedDependencies | null>(null);
  const [engine, setEngine] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  
  const [mcpConnections, setMCPConnections] = useState<MCPConnection[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowState[]>([]);
  const [loadedPlugins, setLoadedPlugins] = useState<Map<string, any>>(new Map());

  // Initialize DataPrism with CDN loading
  useEffect(() => {
    async function initialize() {
      try {
        console.log('[MCP App] Loading DataPrism dependencies from CDN...');
        const deps = await loadDataPrismDependencies({
          coreBaseUrl: 'https://srnarasim.github.io/dataprism-core',
          pluginsBaseUrl: 'https://srnarasim.github.io/dataprism-plugins',
          timeout: 30000,
          retries: 3
        });
        
        setDependencies(deps);
        
        // Initialize engine
        const { DataPrismEngine } = deps.core;
        const engineInstance = new DataPrismEngine({
          maxMemoryMB: 512,
          enableWasmOptimizations: true,
          queryTimeoutMs: 30000,
          logLevel: 'info'
        });
        
        await engineInstance.initialize();
        setEngine(engineInstance);
        setIsInitialized(true);
        
        console.log('[MCP App] ✅ DataPrism initialized successfully');
        
        // Load required plugins
        await loadRequiredPlugins(deps, engineInstance);
        
      } catch (error) {
        console.error('[MCP App] ❌ Initialization failed:', error);
        setInitializationError(error as Error);
      }
    }
    
    initialize();
  }, []);

  const loadRequiredPlugins = useCallback(async (deps: LoadedDependencies, engine: any) => {
    const requiredPlugins = [
      'mcp-integration',
      'langgraph-integration', 
      'csv-importer',
      'ironcalc-formula',
      'observable-charts',
      'performance-monitor'
    ];
    
    const { PluginManager } = deps.plugins;
    const pluginManager = new PluginManager();
    
    for (const pluginId of requiredPlugins) {
      try {
        console.log(`[MCP App] Loading plugin: ${pluginId}`);
        const plugin = await pluginManager.loadPlugin(pluginId);
        await plugin.initialize({ engine, logger: console });
        setLoadedPlugins(prev => new Map(prev).set(pluginId, plugin));
        console.log(`[MCP App] ✅ Plugin loaded: ${pluginId}`);
      } catch (error) {
        console.warn(`[MCP App] ⚠️ Failed to load plugin ${pluginId}:`, error);
      }
    }
  }, []);

  const connectToMCPServer = useCallback(async (serverUrl: string, auth?: any): Promise<MCPConnection> => {
    const mcpPlugin = loadedPlugins.get('mcp-integration');
    if (!mcpPlugin) {
      throw new Error('MCP Integration plugin not loaded');
    }
    
    try {
      const connection = await mcpPlugin.connectToMCPServer(serverUrl, auth);
      const tools = await mcpPlugin.discoverTools(connection);
      
      const mcpConnection: MCPConnection = {
        id: `mcp-${Date.now()}`,
        serverUrl,
        authenticated: connection.authenticated,
        tools,
        status: 'connected'
      };
      
      setMCPConnections(prev => [...prev, mcpConnection]);
      return mcpConnection;
    } catch (error) {
      console.error('[MCP App] Failed to connect to MCP server:', error);
      throw error;
    }
  }, [loadedPlugins]);

  const createWorkflow = useCallback(async (definition: any): Promise<WorkflowState> => {
    const langGraphPlugin = loadedPlugins.get('langgraph-integration');
    if (!langGraphPlugin) {
      throw new Error('LangGraph Integration plugin not loaded');
    }
    
    try {
      const workflow = await langGraphPlugin.createWorkflow(definition);
      
      const workflowState: WorkflowState = {
        id: workflow.id,
        status: 'created',
        currentStep: null,
        steps: definition.nodes.map((node: any) => ({
          id: node.id,
          name: node.name || node.id,
          type: node.type,
          status: 'pending',
          result: null,
          error: null
        }))
      };
      
      setWorkflows(prev => [...prev, workflowState]);
      return workflowState;
    } catch (error) {
      console.error('[MCP App] Failed to create workflow:', error);
      throw error;
    }
  }, [loadedPlugins]);

  const executeWorkflow = useCallback(async (workflowId: string, input: any): Promise<any> => {
    const langGraphPlugin = loadedPlugins.get('langgraph-integration');
    if (!langGraphPlugin) {
      throw new Error('LangGraph Integration plugin not loaded');
    }
    
    // Update workflow status
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'running' as const }
        : w
    ));
    
    try {
      const result = await langGraphPlugin.executeWorkflow(workflowId, input, {
        onStepStart: (stepId: string) => {
          setWorkflows(prev => prev.map(w => 
            w.id === workflowId 
              ? { ...w, currentStep: stepId, steps: w.steps.map(s => 
                  s.id === stepId ? { ...s, status: 'running' } : s
                )}
              : w
          ));
        },
        onStepComplete: (stepId: string, stepResult: any) => {
          setWorkflows(prev => prev.map(w => 
            w.id === workflowId 
              ? { ...w, steps: w.steps.map(s => 
                  s.id === stepId ? { ...s, status: 'completed', result: stepResult } : s
                )}
              : w
          ));
        },
        onStepError: (stepId: string, error: Error) => {
          setWorkflows(prev => prev.map(w => 
            w.id === workflowId 
              ? { ...w, steps: w.steps.map(s => 
                  s.id === stepId ? { ...s, status: 'failed', error: error.message } : s
                )}
              : w
          ));
        }
      });
      
      // Update final workflow status
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'completed', currentStep: null, result }
          : w
      ));
      
      return result;
    } catch (error) {
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : w
      ));
      throw error;
    }
  }, [loadedPlugins]);

  // Implementation continues for other methods...
  
  const value: DataPrismMCPContextValue = {
    dependencies,
    engine,
    isInitialized,
    initializationError,
    mcpConnections,
    connectToMCPServer,
    disconnectFromMCPServer: async () => {}, // Implementation needed
    invokeMCPTool: async () => {}, // Implementation needed
    workflows,
    createWorkflow,
    executeWorkflow,
    getWorkflowState: (id) => workflows.find(w => w.id === id) || null,
    loadPlugin: async () => {}, // Implementation needed
    getPlugin: (id) => loadedPlugins.get(id) || null,
    retry: async () => {} // Implementation needed
  };

  return (
    <DataPrismMCPContext.Provider value={value}>
      {children}
    </DataPrismMCPContext.Provider>
  );
}
```

**Step 2.2: Workflow Definition System**
```typescript
// src/types/workflow.ts
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  entryPoint: string;
  exitPoints: string[];
  metadata: {
    author: string;
    created: string;
    tags: string[];
    estimatedDuration?: number;
  };
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'data-input' | 'data-processor' | 'mcp-tool' | 'llm-agent' | 'human-review' | 'output';
  position: { x: number; y: number };
  configuration: any;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

// Pre-defined workflow for demo
export const SALES_ANALYSIS_WORKFLOW: WorkflowDefinition = {
  id: 'sales-analysis-workflow',
  name: 'Automated Sales Data Quality and Insight Agent',
  description: 'Complete sales data processing pipeline with external enrichment and AI insights',
  version: '1.0.0',
  nodes: [
    {
      id: 'data-upload',
      name: 'Data Upload & Validation',
      type: 'data-input',
      position: { x: 100, y: 100 },
      configuration: {
        pluginId: 'csv-importer',
        operation: 'import',
        validation: {
          required: true,
          minRows: 10,
          expectedColumns: ['date', 'amount', 'region', 'product']
        }
      }
    },
    {
      id: 'external-enrichment',
      name: 'Product Categorization (MCP)',
      type: 'mcp-tool',
      position: { x: 300, y: 100 },
      configuration: {
        server: 'https://api.external-enrichment.com/mcp',
        tool: 'product-categorizer',
        inputMapping: {
          products: '{{data-upload.result.data}}'
        },
        auth: {
          type: 'bearer',
          token: '${MCP_AUTH_TOKEN}'
        }
      },
      timeout: 30000,
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000
      }
    },
    {
      id: 'calculations',
      name: 'Spreadsheet Calculations',
      type: 'data-processor',
      position: { x: 500, y: 100 },
      configuration: {
        pluginId: 'ironcalc-formula',
        formulas: [
          { field: 'monthly_total', formula: 'SUMIF(date, MONTH(date)=MONTH(TODAY()), amount)' },
          { field: 'growth_rate', formula: '(current_month - previous_month) / previous_month * 100' },
          { field: 'category_performance', formula: 'SUMIF(category, category, amount)' }
        ]
      }
    },
    {
      id: 'visualization',
      name: 'Chart Generation',
      type: 'data-processor',
      position: { x: 700, y: 100 },
      configuration: {
        pluginId: 'observable-charts',
        charts: [
          {
            type: 'bar',
            data: '{{calculations.result}}',
            x: 'region',
            y: 'monthly_total',
            title: 'Sales by Region'
          },
          {
            type: 'line',
            data: '{{calculations.result}}',
            x: 'date',
            y: 'growth_rate',
            title: 'Growth Rate Trend'
          }
        ]
      }
    },
    {
      id: 'ai-insights',
      name: 'Business Insights Generation',
      type: 'llm-agent',
      position: { x: 900, y: 100 },
      configuration: {
        agent: 'insight-generator',
        model: 'openai/gpt-4o',
        prompt: `Analyze this sales data and provide actionable business insights:
        
        Data Summary: {{calculations.result.summary}}
        Charts: {{visualization.result.charts}}
        Categories: {{external-enrichment.result.categories}}
        
        Provide:
        1. Key performance indicators
        2. Trends and anomalies
        3. Actionable recommendations
        4. Risk factors to monitor`,
        maxTokens: 1000
      }
    },
    {
      id: 'human-review',
      name: 'Human Review & Approval',
      type: 'human-review',
      position: { x: 1100, y: 100 },
      configuration: {
        reviewFields: [
          'data_quality',
          'insights_accuracy',
          'recommendations_feasibility'
        ],
        approvalRequired: true,
        timeout: 3600000 // 1 hour
      }
    },
    {
      id: 'final-output',
      name: 'Generate Report',
      type: 'output',
      position: { x: 1300, y: 100 },
      configuration: {
        format: 'comprehensive-report',
        includeCharts: true,
        includeRawData: false,
        deliveryMethod: 'download'
      }
    }
  ],
  edges: [
    { id: 'e1', from: 'data-upload', to: 'external-enrichment', label: 'Valid data' },
    { id: 'e2', from: 'external-enrichment', to: 'calculations', label: 'Enriched' },
    { id: 'e3', from: 'calculations', to: 'visualization', label: 'Calculated' },
    { id: 'e4', from: 'visualization', to: 'ai-insights', label: 'Visualized' },
    { id: 'e5', from: 'ai-insights', to: 'human-review', label: 'AI insights' },
    { id: 'e6', from: 'human-review', to: 'final-output', label: 'Approved', condition: 'approved === true' },
    { id: 'e7', from: 'human-review', to: 'ai-insights', label: 'Revise', condition: 'approved === false' }
  ],
  entryPoint: 'data-upload',
  exitPoints: ['final-output'],
  metadata: {
    author: 'DataPrism Team',
    created: '2024-01-15',
    tags: ['sales', 'analytics', 'mcp', 'automation'],
    estimatedDuration: 300000 // 5 minutes
  }
};
```

### Phase 3: User Interface Implementation (4 hours)

**Step 3.1: Workflow Visualizer Component**
```typescript
// src/components/workflow/WorkflowVisualizer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WorkflowDefinition, WorkflowNode, WorkflowEdge } from '@/types/workflow';

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
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    if (!svgRef.current || !workflow) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Setup dimensions and viewBox
    const { width, height } = dimensions;
    svg.attr('viewBox', \`0 0 \${width} \${height}\`)
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
    const nodeWidth = 150;
    const nodeHeight = 80;
    const nodeRadius = 8;

    // Create edges first (so they appear behind nodes)
    const edgeGroup = g.append('g').attr('class', 'edges');
    
    workflow.edges.forEach(edge => {
      const fromNode = workflow.nodes.find(n => n.id === edge.from);
      const toNode = workflow.nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      // Calculate edge path
      const fromX = fromNode.position.x + nodeWidth / 2;
      const fromY = fromNode.position.y + nodeHeight / 2;
      const toX = toNode.position.x + nodeWidth / 2;
      const toY = toNode.position.y + nodeHeight / 2;

      // Create curved path
      const path = \`M \${fromX} \${fromY} 
                   Q \${(fromX + toX) / 2} \${fromY - 50} 
                   \${toX} \${toY}\`;

      const edgeElement = edgeGroup.append('g')
        .attr('class', 'edge')
        .style('cursor', onEdgeClick ? 'pointer' : 'default');

      // Edge path
      edgeElement.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');

      // Edge label if present
      if (edge.label) {
        edgeElement.append('text')
          .attr('x', (fromX + toX) / 2)
          .attr('y', (fromY + toY) / 2 - 25)
          .attr('text-anchor', 'middle')
          .attr('class', 'edge-label')
          .style('font-size', '12px')
          .style('fill', '#6b7280')
          .style('background', 'white')
          .text(edge.label);
      }

      // Click handler
      if (onEdgeClick) {
        edgeElement.on('click', () => onEdgeClick(edge.id));
      }
    });

    // Define arrow marker for edges
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6b7280');

    // Create nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    workflow.nodes.forEach(node => {
      const status = stepStatuses[node.id] || 'pending';
      const isCurrentStep = currentStep === node.id;

      const nodeElement = nodeGroup.append('g')
        .attr('class', \`node node-\${node.type} node-\${status}\`)
        .attr('transform', \`translate(\${node.position.x}, \${node.position.y})\`)
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
      const iconSize = 24;
      nodeElement.append('text')
        .attr('x', 20)
        .attr('y', 30)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', iconSize)
        .attr('fill', '#374151')
        .text(getNodeIcon(node.type));

      // Node title
      nodeElement.append('text')
        .attr('x', 50)
        .attr('y', 25)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#111827')
        .text(truncateText(node.name, 12));

      // Node type label
      nodeElement.append('text')
        .attr('x', 50)
        .attr('y', 40)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '11px')
        .attr('fill', '#6b7280')
        .text(node.type.replace('-', ' '));

      // Status indicator
      const statusIndicator = nodeElement.append('circle')
        .attr('cx', nodeWidth - 15)
        .attr('cy', 15)
        .attr('r', 6)
        .attr('fill', getStatusColor(status));

      // Add pulse animation for running status
      if (status === 'running') {
        statusIndicator.attr('class', 'animate-pulse');
      }

      // Progress bar for running steps
      if (status === 'running' && isCurrentStep) {
        const progressBar = nodeElement.append('rect')
          .attr('x', 10)
          .attr('y', nodeHeight - 10)
          .attr('width', 0)
          .attr('height', 4)
          .attr('fill', '#10b981')
          .attr('rx', 2);

        // Animate progress bar
        progressBar.transition()
          .duration(2000)
          .attr('width', nodeWidth - 20)
          .ease(d3.easeLinear);
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
            .attr('stroke-width', 2)
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

    // Add glow filter definition
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
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
    <div className={`workflow-visualizer \${className}`}>
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
    </div>
  );
};
```

**Step 3.2: Main Application Component**
```typescript
// src/App.tsx
import React, { useState, useCallback } from 'react';
import { DataPrismMCPProvider, useDataPrismMCP } from '@/contexts/DataPrismMCPContext';
import { WorkflowVisualizer } from '@/components/workflow/WorkflowVisualizer';
import { WorkflowControls } from '@/components/workflow/WorkflowControls';
import { StepDetail } from '@/components/workflow/StepDetail';
import { AuditLog } from '@/components/workflow/AuditLog';
import { SALES_ANALYSIS_WORKFLOW } from '@/types/workflow';
import './App.css';

function AppContent() {
  const {
    isInitialized,
    initializationError,
    workflows,
    createWorkflow,
    executeWorkflow,
    getWorkflowState
  } = useDataPrismMCP();

  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const handleStartWorkflow = useCallback(async () => {
    try {
      const workflow = await createWorkflow(SALES_ANALYSIS_WORKFLOW);
      setCurrentWorkflowId(workflow.id);
      
      // Auto-start execution (could be made optional)
      setTimeout(() => {
        executeWorkflow(workflow.id, {
          description: 'Demo sales analysis workflow execution'
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  }, [createWorkflow, executeWorkflow]);

  const currentWorkflow = currentWorkflowId ? getWorkflowState(currentWorkflowId) : null;
  const stepStatuses = currentWorkflow?.steps.reduce((acc, step) => {
    acc[step.id] = step.status;
    return acc;
  }, {} as Record<string, string>) || {};

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading DataPrism MCP Analytics
          </h2>
          <p className="text-gray-600">
            Initializing plugins and connecting to services...
          </p>
          {initializationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-red-800">
                Initialization failed: {initializationError.message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                MCP Analytics Workflow
              </h1>
              <p className="text-gray-600">
                Automated Sales Data Quality and Insight Agent
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showAuditLog ? 'Hide' : 'Show'} Audit Log
              </button>
              <button
                onClick={handleStartWorkflow}
                disabled={currentWorkflow?.status === 'running'}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentWorkflow?.status === 'running' ? 'Running...' : 'Start New Workflow'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Workflow Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Workflow Execution
                </h2>
                <p className="text-sm text-gray-600">
                  {currentWorkflow 
                    ? \`Status: \${currentWorkflow.status.toUpperCase()}\`
                    : 'Click "Start New Workflow" to begin'
                  }
                </p>
              </div>
              
              <div className="p-4">
                <div className="relative h-96">
                  <WorkflowVisualizer
                    workflow={SALES_ANALYSIS_WORKFLOW}
                    currentStep={currentWorkflow?.currentStep}
                    stepStatuses={stepStatuses}
                    onNodeClick={setSelectedStepId}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Workflow Controls */}
            {currentWorkflow && (
              <div className="mt-6">
                <WorkflowControls
                  workflow={currentWorkflow}
                  onPause={() => {}}
                  onResume={() => {}}
                  onStop={() => {}}
                  onRetry={() => executeWorkflow(currentWorkflow.id, {})}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Step Detail */}
            {selectedStepId && (
              <StepDetail
                stepId={selectedStepId}
                workflow={currentWorkflow}
                onClose={() => setSelectedStepId(null)}
              />
            )}

            {/* Workflow Progress */}
            {currentWorkflow && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Progress</h3>
                <div className="space-y-2">
                  {currentWorkflow.steps.map(step => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={\`w-3 h-3 rounded-full \${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'running' ? 'bg-amber-500' :
                        step.status === 'failed' ? 'bg-red-500' :
                        'bg-gray-300'
                      }\`} />
                      <span className="text-sm font-medium">{step.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log */}
        {showAuditLog && (
          <div className="mt-6">
            <AuditLog workflowId={currentWorkflowId} />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <DataPrismMCPProvider>
      <AppContent />
    </DataPrismMCPProvider>
  );
}

export default App;
```

### Phase 4: Testing and Validation (2 hours)

**Step 4.1: Unit Tests for Core Components**
```typescript
// src/components/__tests__/WorkflowVisualizer.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowVisualizer } from '../workflow/WorkflowVisualizer';
import { SALES_ANALYSIS_WORKFLOW } from '@/types/workflow';

// Mock D3 to avoid DOM manipulation issues in tests
vi.mock('d3', () => ({
  select: () => ({
    selectAll: () => ({ remove: vi.fn() }),
    attr: () => ({}),
    append: () => ({}),
    call: vi.fn()
  }),
  zoom: () => ({
    scaleExtent: () => ({ on: vi.fn() })
  })
}));

describe('WorkflowVisualizer', () => {
  it('renders workflow nodes correctly', () => {
    render(
      <WorkflowVisualizer
        workflow={SALES_ANALYSIS_WORKFLOW}
        currentStep="data-upload"
        stepStatuses={{
          'data-upload': 'running',
          'external-enrichment': 'pending'
        }}
      />
    );

    // Check that SVG is rendered
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('handles node click events', () => {
    const onNodeClick = vi.fn();
    
    render(
      <WorkflowVisualizer
        workflow={SALES_ANALYSIS_WORKFLOW}
        onNodeClick={onNodeClick}
      />
    );

    // Test would need more sophisticated D3 mocking for full interaction testing
    expect(onNodeClick).toBeDefined();
  });

  it('displays workflow legend correctly', () => {
    render(<WorkflowVisualizer workflow={SALES_ANALYSIS_WORKFLOW} />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
```

**Step 4.2: Integration Tests**
```typescript
// src/contexts/__tests__/DataPrismMCPContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataPrismMCPProvider, useDataPrismMCP } from '../DataPrismMCPContext';

// Mock CDN loader
vi.mock('@/utils/cdn-loader', () => ({
  loadDataPrismDependencies: vi.fn().mockResolvedValue({
    core: {
      DataPrismEngine: class MockEngine {
        async initialize() { return Promise.resolve(); }
        async query() { return { data: [], rowCount: 0 }; }
        async loadData() { return Promise.resolve(); }
      }
    },
    plugins: {
      PluginManager: class MockPluginManager {
        async loadPlugin(id: string) {
          return {
            id,
            async initialize() { return true; }
          };
        }
      }
    }
  })
}));

describe('DataPrismMCPContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes DataPrism engine successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataPrismMCPProvider>{children}</DataPrismMCPProvider>
    );

    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.isInitialized).toBe(true);
    expect(result.current.engine).toBeDefined();
  });

  it('creates and executes workflows', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataPrismMCPProvider>{children}</DataPrismMCPProvider>
    );

    const { result } = renderHook(() => useDataPrismMCP(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for init
    });

    const mockWorkflow = {
      id: 'test-workflow',
      nodes: [{ id: 'step1', type: 'data-input' }],
      edges: []
    };

    await act(async () => {
      const workflow = await result.current.createWorkflow(mockWorkflow);
      expect(workflow.id).toBe('test-workflow');
      expect(result.current.workflows).toHaveLength(1);
    });
  });
});
```

**Step 4.3: End-to-End Test**
```typescript
// e2e/workflow-execution.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MCP Analytics Workflow', () => {
  test('completes full workflow execution', async ({ page }) => {
    // Navigate to the app
    await page.goto('/dataprism-apps/mcp-analytics-workflow/');

    // Wait for initialization
    await expect(page.locator('text=Loading DataPrism MCP Analytics')).toBeVisible();
    await expect(page.locator('text=Start New Workflow')).toBeVisible();

    // Start workflow
    await page.click('button:text("Start New Workflow")');

    // Verify workflow visualization appears
    await expect(page.locator('.workflow-visualizer')).toBeVisible();

    // Check that nodes are rendered
    await expect(page.locator('.node')).toHaveCount(7); // Based on SALES_ANALYSIS_WORKFLOW

    // Verify workflow progresses through steps
    await expect(page.locator('.node-running')).toBeVisible();

    // Wait for first step completion (with timeout)
    await expect(page.locator('.node-completed')).toBeVisible({ timeout: 10000 });

    // Verify audit log functionality
    await page.click('button:text("Show Audit Log")');
    await expect(page.locator('.audit-log')).toBeVisible();

    // Test node interaction
    await page.click('.node').first();
    await expect(page.locator('.step-detail')).toBeVisible();
  });

  test('handles workflow errors gracefully', async ({ page }) => {
    await page.goto('/dataprism-apps/mcp-analytics-workflow/');
    
    // Mock network error for MCP connection
    await page.route('**/mcp/**', route => route.abort());

    await page.click('button:text("Start New Workflow")');

    // Verify error state is displayed
    await expect(page.locator('.node-failed')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=MCP connection failed')).toBeVisible();
  });
});
```

### Phase 5: Deployment and Documentation (1 hour)

**Step 5.1: Build Configuration**
```json
{
  "name": "mcp-analytics-workflow",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "d3": "^7.8.5",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/d3": "^7.4.3",
    "@vitejs/plugin-react": "^4.1.0",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "vitest": "^0.34.6",
    "@playwright/test": "^1.40.0",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "eslint": "^8.53.0"
  }
}
```

**Step 5.2: GitHub Pages Deployment**
```yaml
# .github/workflows/deploy.yml
name: Deploy MCP Analytics Workflow

on:
  push:
    branches: [ main ]
    paths: [ 'apps/mcp-analytics-workflow/**' ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'apps/mcp-analytics-workflow/package-lock.json'
          
      - name: Install dependencies
        working-directory: apps/mcp-analytics-workflow
        run: npm ci
        
      - name: Run tests
        working-directory: apps/mcp-analytics-workflow
        run: |
          npm run test
          npm run type-check
          npm run lint
          
      - name: Build application
        working-directory: apps/mcp-analytics-workflow
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'apps/mcp-analytics-workflow/dist'
          
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

## Code Examples and Patterns

### WebAssembly-JavaScript Interop Patterns

```typescript
// DataPrism Core initialization with WASM
const engineInstance = new DataPrismEngine({
  maxMemoryMB: 512,
  enableWasmOptimizations: true,
  duckdb: {
    enableWasm: true,
    wasmPath: '/wasm/',
    maxMemoryMB: 256
  }
});

await engineInstance.initialize();

// Query execution with proper error handling
async function executeQuery(sql: string) {
  try {
    const result = await engineInstance.query(sql);
    return {
      data: result.data,
      rowCount: result.rowCount,
      executionTime: result.executionTime
    };
  } catch (error) {
    if (error.message.includes('WASM')) {
      // WASM-specific error handling
      await engineInstance.reinitialize();
      return executeQuery(sql); // Retry once
    }
    throw error;
  }
}
```

### MCP Integration Patterns

```typescript
// MCP connection with authentication
async function connectMCPServer(serverUrl: string) {
  const mcpPlugin = await pluginManager.loadPlugin('mcp-integration');
  
  const connection = await mcpPlugin.connectToMCPServer(serverUrl, {
    type: 'bearer',
    token: process.env.MCP_AUTH_TOKEN
  });
  
  // Discover available tools
  const tools = await mcpPlugin.discoverTools(connection);
  
  return { connection, tools };
}

// Tool invocation with timeout and retry
async function invokeMCPTool(toolName: string, params: any) {
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await mcpPlugin.invokeTool(connection, toolName, params);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw new Error(\`MCP tool invocation failed after \${maxRetries} attempts: \${lastError.message}\`);
}
```

### LangGraph Workflow Patterns

```typescript
// Workflow definition with conditional branching
const workflowDefinition = {
  nodes: [
    {
      id: 'data-validation',
      type: 'data-processor',
      configuration: {
        pluginId: 'csv-importer',
        operation: 'validate'
      }
    },
    {
      id: 'human-review',
      type: 'human-review',
      configuration: {
        condition: '{{data-validation.result.issues.length}} > 0',
        timeout: 3600000
      }
    }
  ],
  edges: [
    {
      from: 'data-validation',
      to: 'human-review',
      condition: 'result.issues.length > 0'
    },
    {
      from: 'data-validation', 
      to: 'processing',
      condition: 'result.issues.length === 0'
    }
  ]
};

// Workflow execution with step callbacks
await langGraphPlugin.executeWorkflow(workflowId, input, {
  onStepStart: (stepId) => updateUI({ currentStep: stepId }),
  onStepComplete: (stepId, result) => updateUI({ 
    completedSteps: [...completedSteps, stepId],
    results: { ...results, [stepId]: result }
  }),
  onStepError: (stepId, error) => updateUI({
    failedSteps: [...failedSteps, stepId],
    errors: { ...errors, [stepId]: error.message }
  })
});
```

### Error Handling Across Language Boundaries

```typescript
// Comprehensive error handling system
class DataPrismError extends Error {
  constructor(
    message: string,
    public code: string,
    public layer: 'wasm' | 'javascript' | 'network' | 'plugin',
    public details?: any
  ) {
    super(message);
    this.name = 'DataPrismError';
  }
}

// Error boundary for WASM operations
async function safeWasmOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.message.includes('unreachable')) {
      throw new DataPrismError(
        'WebAssembly execution failed',
        'WASM_UNREACHABLE',
        'wasm',
        { originalError: error.message }
      );
    }
    
    if (error.message.includes('out of memory')) {
      throw new DataPrismError(
        'Insufficient memory for operation',
        'MEMORY_ERROR',
        'wasm',
        { originalError: error.message }
      );
    }
    
    throw error;
  }
}

// Plugin error handling
async function safePluginOperation(pluginId: string, operation: string, params: any) {
  try {
    const plugin = pluginManager.getPlugin(pluginId);
    if (!plugin) {
      throw new DataPrismError(
        \`Plugin not found: \${pluginId}\`,
        'PLUGIN_NOT_FOUND',
        'plugin'
      );
    }
    
    return await plugin[operation](params);
  } catch (error) {
    if (error instanceof DataPrismError) {
      throw error;
    }
    
    throw new DataPrismError(
      \`Plugin operation failed: \${operation}\`,
      'PLUGIN_OPERATION_FAILED',
      'plugin',
      { pluginId, operation, params, originalError: error.message }
    );
  }
}
```

## Testing Strategy

### Unit Testing Framework

```typescript
// Test configuration with comprehensive mocking
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

// Mock setup for DataPrism dependencies
// src/test-setup.ts
import { vi } from 'vitest';

// Mock DataPrism CDN loader
vi.mock('@/utils/cdn-loader', () => ({
  loadDataPrismDependencies: vi.fn().mockResolvedValue({
    core: {
      DataPrismEngine: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue({ data: [], rowCount: 0 }),
        loadData: vi.fn().mockResolvedValue(undefined)
      }))
    },
    plugins: {
      PluginManager: vi.fn().mockImplementation(() => ({
        loadPlugin: vi.fn().mockResolvedValue({
          initialize: vi.fn().mockResolvedValue(true),
          connectToMCPServer: vi.fn().mockResolvedValue({
            serverUrl: 'mock-server',
            authenticated: true
          }),
          createWorkflow: vi.fn().mockResolvedValue({
            id: 'mock-workflow',
            status: 'created'
          })
        })
      }))
    }
  })
}));

// Mock D3 for visualization components
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({ remove: vi.fn() })),
    attr: vi.fn(() => ({})),
    append: vi.fn(() => ({})),
    call: vi.fn()
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn(() => ({ on: vi.fn() }))
  }))
}));
```

### Integration Testing

```typescript
// Integration test for full workflow execution
// src/__tests__/workflow-integration.test.tsx
describe('Workflow Integration', () => {
  it('executes complete sales analysis workflow', async () => {
    const mockFile = new File(['date,amount,region,product\\n2024-01-01,100,US,Widget'], 'sales.csv');
    
    render(
      <DataPrismMCPProvider>
        <App />
      </DataPrismMCPProvider>
    );
    
    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByText('Start New Workflow')).toBeInTheDocument();
    });
    
    // Start workflow
    fireEvent.click(screen.getByText('Start New Workflow'));
    
    // Upload file (mock file input)
    const fileInput = screen.getByLabelText('Upload CSV');
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Verify workflow progression
    await waitFor(() => {
      expect(screen.getByText('Data Upload & Validation')).toHaveClass('node-running');
    });
    
    await waitFor(() => {
      expect(screen.getByText('Data Upload & Validation')).toHaveClass('node-completed');
    }, { timeout: 5000 });
    
    // Continue through other steps...
    await waitFor(() => {
      expect(screen.getByText('Product Categorization (MCP)')).toHaveClass('node-running');
    });
  });
});
```

### Performance Testing

```typescript
// Performance benchmarks
// src/__tests__/performance.test.ts
describe('Performance Benchmarks', () => {
  it('initializes within performance targets', async () => {
    const startTime = performance.now();
    
    const { result } = renderHook(() => useDataPrismMCP(), {
      wrapper: DataPrismMCPProvider
    });
    
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });
    
    const initTime = performance.now() - startTime;
    expect(initTime).toBeLessThan(5000); // <5s initialization
  });
  
  it('handles large datasets within memory limits', async () => {
    const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      category: \`Category \${i % 10}\`
    }));
    
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Process large dataset
    await act(async () => {
      await result.current.engine.loadData(largeDataset, 'large_table');
    });
    
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    // Should not exceed 512MB for processing
    expect(memoryIncrease).toBeLessThan(512 * 1024 * 1024);
  });
});
```

## Success Criteria

### Functional Requirements Validation

**✅ MCP Plugin Integration**
- [ ] Successfully connects to at least one external MCP server
- [ ] Dynamically discovers and registers available tools
- [ ] Executes MCP tool invocations with proper error handling
- [ ] Displays available external tools in UI

**✅ LangGraph Plugin Orchestration**
- [ ] Creates graph-based workflows with multiple node types
- [ ] Executes workflows with proper state management
- [ ] Provides real-time workflow tracing and visualization
- [ ] Handles conditional branching and parallel execution

**✅ Demo App UX**
- [ ] Guided wizard interface for workflow execution
- [ ] Visual graph display with real-time status updates
- [ ] Comprehensive error handling and user feedback
- [ ] Interactive audit log with step-by-step traceability

**✅ Plugin Integration**
- [ ] CSV Importer processes files with validation
- [ ] IronCalc executes spreadsheet calculations
- [ ] Observable Charts generates visualizations
- [ ] Performance Monitor tracks execution metrics

### Performance Targets

**✅ Execution Performance**
- [ ] Complete workflow execution (100k-row CSV): <10 seconds per step
- [ ] Plugin loading time: <2 seconds
- [ ] Workflow visualization rendering: <500ms
- [ ] Memory usage stays below 512MB for complete workflow

**✅ User Experience**
- [ ] Application loads within 5 seconds
- [ ] Workflow visualization renders within 500ms
- [ ] Step transitions provide immediate visual feedback
- [ ] Error states clearly communicate issues and solutions

### Security Validation

**✅ MCP Security**
- [ ] All MCP connections use proper authentication
- [ ] External tool execution occurs in sandboxed environment
- [ ] No data leakage between workflow steps
- [ ] Permission-based access control for all operations

**✅ Plugin Security**
- [ ] Plugins operate within defined resource quotas
- [ ] Inter-plugin communication uses secure channels
- [ ] User data remains within controlled execution context
- [ ] External API calls include proper authentication

### Browser Compatibility

**✅ Cross-Browser Support**
- [ ] Chrome 90+: Full functionality including WebAssembly optimizations
- [ ] Firefox 88+: Complete feature set with performance monitoring
- [ ] Safari 14+: Core functionality with graceful degradation
- [ ] Edge 90+: Full compatibility with all features

### Documentation and Extensibility

**✅ Developer Resources**
- [ ] Complete README with setup and usage instructions
- [ ] API documentation for custom workflow creation
- [ ] Example configurations for different MCP servers
- [ ] Troubleshooting guide for common issues

## Validation Commands

### Build and Quality Checks
```bash
# Install dependencies
cd apps/mcp-analytics-workflow
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Verify bundle size
ls -la dist/ && du -sh dist/
```

### Testing Suite
```bash
# Unit tests with coverage
npm run test:coverage

# Integration tests
npm run test -- --reporter=verbose

# End-to-end tests
npm run test:e2e

# Performance benchmarks
npm run test:performance
```

### Development and Debugging
```bash
# Development server with hot reload
npm run dev

# Build preview
npm run preview

# Debug DataPrism CDN loading
npm run dev -- --debug

# Test plugin loading specifically
npm run test -- workflow-plugins
```

### Deployment Validation
```bash
# Build for GitHub Pages
npm run build

# Verify static assets
ls -la dist/assets/

# Check CDN connectivity
curl -I https://srnarasim.github.io/dataprism-plugins/dataprism-plugins.es.js

# Validate deployed application
npx playwright test --headed
```

## Quality Assurance Checklist

### Pre-Deployment Validation

**🔍 Code Quality**
- [ ] All TypeScript strict checks pass
- [ ] ESLint reports zero errors and warnings
- [ ] Test coverage exceeds 80% for critical paths
- [ ] No console errors in browser development tools

**🔍 Functionality Testing**
- [ ] Complete workflow executes successfully with sample data
- [ ] Error scenarios display appropriate user feedback
- [ ] MCP server connection handles authentication properly
- [ ] Workflow visualization updates reflect real-time status

**🔍 Performance Validation**
- [ ] Initial page load completes within 5 seconds
- [ ] Large dataset processing (100k rows) completes within targets
- [ ] Memory usage remains stable during extended execution
- [ ] CPU usage doesn't spike during workflow execution

**🔍 Security Assessment**
- [ ] No sensitive data logged to console
- [ ] MCP authentication tokens properly secured
- [ ] Plugin execution occurs within defined sandboxes
- [ ] Network requests include proper CORS headers

**🔍 Browser Compatibility**
- [ ] Core functionality works across all target browsers
- [ ] Progressive enhancement provides graceful degradation
- [ ] Mobile/tablet layouts render appropriately
- [ ] Accessibility standards met for screen readers

This comprehensive PRP provides a complete roadmap for implementing the MCP Analytics Workflow app, with detailed technical specifications, code examples, testing strategies, and validation criteria. The implementation follows DataPrism architectural patterns while showcasing the advanced capabilities of MCP and LangGraph integration.