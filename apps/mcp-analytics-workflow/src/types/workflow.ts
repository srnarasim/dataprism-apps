// Workflow definition types
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

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface WorkflowState {
  id: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  currentStep: string | null;
  steps: WorkflowStep[];
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

// MCP types
export interface MCPConnection {
  id: string;
  serverUrl: string;
  authenticated: boolean;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}

export interface MCPTool {
  name: string;
  description: string;
  schema: any;
  connection: string;
  metadata?: {
    version: string;
    category: string;
    tags: string[];
  };
}

export interface MCPAuth {
  type: 'bearer' | 'basic' | 'oauth2';
  token?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
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
      position: { x: 350, y: 100 },
      configuration: {
        server: 'mock-enrichment-server',
        tool: 'product-categorizer',
        inputMapping: {
          products: '{{data-upload.result.data}}'
        },
        auth: {
          type: 'bearer',
          token: 'demo-token'
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
      position: { x: 600, y: 100 },
      configuration: {
        pluginId: 'ironcalc-formula',
        formulas: [
          { field: 'monthly_total', formula: 'SUM(amount)' },
          { field: 'average_amount', formula: 'AVERAGE(amount)' },
          { field: 'max_amount', formula: 'MAX(amount)' }
        ]
      }
    },
    {
      id: 'visualization',
      name: 'Chart Generation',
      type: 'data-processor',
      position: { x: 850, y: 100 },
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
            y: 'amount',
            title: 'Sales Trend'
          }
        ]
      }
    },
    {
      id: 'ai-insights',
      name: 'Business Insights Generation',
      type: 'llm-agent',
      position: { x: 1100, y: 100 },
      configuration: {
        agent: 'insight-generator',
        model: 'mock-llm',
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
      id: 'final-output',
      name: 'Generate Report',
      type: 'output',
      position: { x: 1350, y: 100 },
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
    { id: 'e5', from: 'ai-insights', to: 'final-output', label: 'AI insights' }
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