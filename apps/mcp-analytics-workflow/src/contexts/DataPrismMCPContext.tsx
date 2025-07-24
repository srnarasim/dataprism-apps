import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CDNAssetLoader } from '@/utils/cdnLoader';
import { getCDNConfig } from '@/config/cdn';
import { arrowLoader } from '@/utils/arrowLoader';
import type { 
  WorkflowState, 
  WorkflowDefinition, 
  MCPConnection, 
  MCPTool, 
  MCPAuth,
  WorkflowStep 
} from '@/types/workflow';

interface DataPrismMCPContextValue {
  // Core DataPrism
  engine: any | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: Error | null;
  
  // MCP Integration
  mcpConnections: MCPConnection[];
  connectToMCPServer: (serverUrl: string, auth?: MCPAuth) => Promise<MCPConnection>;
  disconnectFromMCPServer: (connectionId: string) => Promise<void>;
  invokeMCPTool: (connectionId: string, toolName: string, params: any) => Promise<any>;
  
  // LangGraph Integration
  workflows: WorkflowState[];
  createWorkflow: (definition: WorkflowDefinition) => Promise<WorkflowState>;
  executeWorkflow: (workflowId: string, input: any) => Promise<any>;
  getWorkflowState: (workflowId: string) => WorkflowState | null;
  
  // Plugin Operations
  loadPlugin: (pluginId: string) => Promise<any>;
  getPlugin: (pluginId: string) => any | null;
  
  // File operations
  uploadFile: (file: File) => Promise<any>;
  
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

interface DataPrismMCPProviderProps {
  children: React.ReactNode;
}

export function DataPrismMCPProvider({ children }: DataPrismMCPProviderProps) {
  const [engine, setEngine] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  
  const [mcpConnections, setMCPConnections] = useState<MCPConnection[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowState[]>([]);
  const [loadedPlugins, setLoadedPlugins] = useState<Map<string, any>>(new Map());

  // Initialize DataPrism with CDN loading
  useEffect(() => {
    async function initialize() {
      if (isInitializing || isInitialized) return;
      
      setIsInitializing(true);
      setInitializationError(null);
      
      try {
        console.log('🚀 Initializing DataPrism from CDN for MCP Analytics Workflow...');
        
        const cdnConfig = getCDNConfig();
        const loader = new CDNAssetLoader(cdnConfig);
        
        // Preload Apache Arrow locally before DataPrism initialization
        console.log('📦 Preloading Apache Arrow dependencies...');
        await arrowLoader.ensureArrowLoaded();
        console.log('✅ Apache Arrow preloaded successfully');
        
        // Preload assets for better performance
        await loader.preloadAssets();
        
        // Load DataPrism from CDN
        const DataPrism = await loader.loadCoreBundle();
        
        // Initialize engine
        const DataPrismEngine = DataPrism.DataPrismEngine || DataPrism;
        const engineInstance = new DataPrismEngine({
          maxMemoryMB: 512,
          enableWasmOptimizations: true,
          queryTimeoutMs: 30000,
          logLevel: 'info'
        });
        
        await engineInstance.initialize();
        setEngine(engineInstance);
        
        console.log('[MCP App] ✅ DataPrism initialized successfully');
        
        // Load required plugins
        await loadRequiredPlugins(DataPrism, engineInstance);
        
        setIsInitialized(true);
        
      } catch (error) {
        console.error('[MCP App] ❌ Initialization failed:', error);
        setInitializationError(error as Error);
      } finally {
        setIsInitializing(false);
      }
    }
    
    initialize();
  }, []);

  const loadRequiredPlugins = useCallback(async (DataPrism: any, engineInstance: any) => {
    // For demo purposes, we'll simulate plugin loading since the actual plugins might not be available
    const mockPlugins = [
      'csv-importer',
      'mcp-integration', 
      'langgraph-integration',
      'ironcalc-formula',
      'observable-charts',
      'performance-monitor'
    ];
    
    for (const pluginId of mockPlugins) {
      try {
        console.log(`[MCP App] Loading plugin: ${pluginId}`);
        
        // Create mock plugin implementations
        const mockPlugin = createMockPlugin(pluginId, engineInstance);
        setLoadedPlugins(prev => new Map(prev).set(pluginId, mockPlugin));
        
        console.log(`[MCP App] ✅ Plugin loaded: ${pluginId}`);
      } catch (error) {
        console.warn(`[MCP App] ⚠️ Failed to load plugin ${pluginId}:`, error);
      }
    }
  }, []);

  const createMockPlugin = (pluginId: string, engine: any) => {
    switch (pluginId) {
      case 'csv-importer':
        return {
          id: pluginId,
          name: 'CSV Importer',
          initialize: async () => true,
          import: async (file: File) => {
            // Mock CSV parsing
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const csv = e.target?.result as string;
                  const lines = csv.split('\n').filter(line => line.trim());
                  
                  if (lines.length < 2) {
                    throw new Error('CSV file must have at least a header and one data row');
                  }
                  
                  const headers = lines[0].split(',').map(h => h.trim());
                  const data = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const row: any = {};
                    headers.forEach((header, index) => {
                      let value = values[index]?.trim() || null;
                      if (value && !isNaN(Number(value))) {
                        value = Number(value) as any;
                      }
                      row[header] = value;
                    });
                    return row;
                  });
                  
                  resolve({
                    data,
                    meta: {
                      fields: headers,
                      rowCount: data.length,
                      columnCount: headers.length,
                      fileName: file.name
                    }
                  });
                } catch (error) {
                  reject(error);
                }
              };
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsText(file);
            });
          }
        };
        
      case 'mcp-integration':
        return {
          id: pluginId,
          name: 'MCP Integration',
          initialize: async () => true,
          connectToMCPServer: async (serverUrl: string, auth?: MCPAuth) => {
            // Mock MCP server connection
            await new Promise(resolve => setTimeout(resolve, 1000) as any);
            return {
              id: `mcp-${Date.now()}`,
              serverUrl,
              authenticated: !!auth,
              tools: [
                {
                  name: 'product-categorizer',
                  description: 'Categorizes products based on their names and attributes',
                  schema: { type: 'object', properties: { products: { type: 'array' } } },
                  connection: serverUrl
                }
              ],
              status: 'connected' as const
            };
          },
          invokeTool: async (connection: any, toolName: string, params: any) => {
            // Mock tool invocation
            await new Promise(resolve => setTimeout(resolve, 2000) as any);
            if (toolName === 'product-categorizer') {
              return {
                categories: [
                  { product: 'Widget A', category: 'Electronics', confidence: 0.95 },
                  { product: 'Widget B', category: 'Accessories', confidence: 0.87 }
                ],
                processingTime: 1542
              };
            }
            return { result: 'success', toolName, params };
          }
        };
        
      case 'langgraph-integration':
        return {
          id: pluginId,
          name: 'LangGraph Integration',
          initialize: async () => true,
          createWorkflow: async (definition: WorkflowDefinition) => {
            return {
              id: definition.id,
              status: 'created' as const,
              currentStep: null,
              steps: definition.nodes.map(node => ({
                id: node.id,
                name: node.name,
                type: node.type,
                status: 'pending' as const
              }))
            };
          },
          executeWorkflow: async (workflowId: string, input: any, callbacks?: any) => {
            // Mock workflow execution with step-by-step progression
            // Get the current workflows from the state
            const currentWorkflows = workflows.length > 0 ? workflows : [];
            let workflow = currentWorkflows.find(w => w.id === workflowId);
            
            // If workflow not found, try to get it by looking at all workflows in state
            if (!workflow) {
              console.log('[LangGraph Plugin] Available workflows:', currentWorkflows.map(w => w.id));
              throw new Error(`Workflow not found: ${workflowId}. Available: ${currentWorkflows.map(w => w.id).join(', ')}`);
            }
            
            for (const step of workflow.steps) {
              if (callbacks?.onStepStart) {
                callbacks.onStepStart(step.id);
              }
              
              // Simulate step execution
              await new Promise(resolve => setTimeout(resolve, 2000) as any);
              
              // Mock step results
              let stepResult;
              switch (step.type) {
                case 'data-input':
                  stepResult = { data: mockSalesData, rowCount: mockSalesData.length };
                  break;
                case 'mcp-tool':
                  stepResult = { categories: ['Electronics', 'Accessories'], enrichedCount: 50 };
                  break;
                case 'data-processor':
                  stepResult = { calculations: { total: 125000, average: 2500, max: 15000 } };
                  break;
                case 'llm-agent':
                  stepResult = { insights: 'Sales are trending upward with strong Q4 performance.' };
                  break;
                default:
                  stepResult = { status: 'completed' };
              }
              
              if (callbacks?.onStepComplete) {
                callbacks.onStepComplete(step.id, stepResult);
              }
            }
            
            return { workflowId, status: 'completed', summary: 'Workflow executed successfully' };
          }
        };
        
      default:
        return {
          id: pluginId,
          name: pluginId,
          initialize: async () => true,
          execute: async (params: any) => ({ result: 'success', params })
        };
    }
  };

  const connectToMCPServer = useCallback(async (serverUrl: string, auth?: MCPAuth): Promise<MCPConnection> => {
    const mcpPlugin = loadedPlugins.get('mcp-integration');
    if (!mcpPlugin) {
      throw new Error('MCP Integration plugin not loaded');
    }
    
    try {
      const connection = await mcpPlugin.connectToMCPServer(serverUrl, auth);
      setMCPConnections(prev => [...prev, connection]);
      return connection;
    } catch (error) {
      console.error('[MCP App] Failed to connect to MCP server:', error);
      throw error;
    }
  }, [loadedPlugins]);

  const createWorkflow = useCallback(async (definition: WorkflowDefinition): Promise<WorkflowState> => {
    const langGraphPlugin = loadedPlugins.get('langgraph-integration');
    if (!langGraphPlugin) {
      throw new Error('LangGraph Integration plugin not loaded');
    }
    
    try {
      const workflowState = await langGraphPlugin.createWorkflow(definition);
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
        ? { ...w, status: 'running', startTime: new Date() }
        : w
    ));
    
    try {
      // Wait a moment for workflow state to be updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Execute workflow directly - get current workflow from state
      let workflow: WorkflowState | undefined;
      
      // Try to get the workflow with a state callback
      await new Promise<void>((resolve) => {
        setWorkflows(prevWorkflows => {
          workflow = prevWorkflows.find(w => w.id === workflowId);
          if (!workflow) {
            console.log('[MCP App] Available workflows:', prevWorkflows.map(w => w.id));
          }
          resolve();
          return prevWorkflows;
        });
      });
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}. Make sure the workflow was created first.`);
      }
      
      // Execute workflow steps manually
      for (const step of workflow.steps) {
        // Update step to running
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId 
            ? { 
                ...w, 
                currentStep: step.id, 
                steps: w.steps.map(s => 
                  s.id === step.id ? { ...s, status: 'running', startTime: new Date() } : s
                )
              }
            : w
        ));
        
        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 2000) as any);
        
        // Mock step results with more comprehensive data
        let stepResult;
        switch (step.id) {
          case 'data-upload':
            stepResult = { 
              data: [], 
              rowCount: 50,
              columnCount: 4,
              validationErrors: 0,
              columns: ['date', 'amount', 'region', 'product']
            };
            break;
          case 'external-enrichment':
            stepResult = { 
              categories: ['Electronics', 'Accessories', 'Premium Widgets', 'Gadgets'], 
              enrichedCount: 50,
              apiCalls: 12,
              processingTime: 2.1,
              categoriesFound: {
                'Widget A': 'Electronics',
                'Widget B': 'Accessories', 
                'Premium Widget': 'Premium Widgets',
                'Gadget C': 'Gadgets'
              }
            };
            break;
          case 'calculations':
            stepResult = { 
              calculations: { 
                total: 125750, 
                average: 2515, 
                max: 15000,
                min: 890,
                median: 2200,
                count: 50
              },
              formulasExecuted: 6,
              executionTime: 0.156
            };
            break;
          case 'ai-insights':
            stepResult = { 
              insights: 'Based on the sales data analysis: Strong performance observed with total revenue of $125,750 across 50 transactions. Electronics category dominates sales volume. North region shows highest performance at 32% of total sales. Premium widgets have 40% higher margin than standard products. Recommendation: Expand premium widget inventory and focus marketing efforts on North region to maximize Q4 growth potential.',
              confidence: 0.94,
              keyMetrics: {
                growthRate: '25%',
                topCategory: 'Electronics',
                topRegion: 'North',
                recommendation: 'Focus on premium widgets and North region expansion',
                riskFactors: ['Seasonal demand variation', 'Supply chain dependency'],
                opportunities: ['Premium product line expansion', 'Regional market penetration']
              },
              generatedAt: new Date().toISOString(),
              processingTime: 3.2
            };
            break;
          case 'quality-assessment':
            stepResult = {
              qualityScore: 0.94,
              issuesFound: 2,
              recommendations: [
                'Consider data validation rules for amount field',
                'Standardize product naming convention'
              ],
              dataIntegrity: 'High'
            };
            break;
          case 'final-output':
            stepResult = {
              reportGenerated: true,
              exportFormats: ['JSON', 'CSV', 'PDF'],
              summaryStats: {
                totalRevenue: 125750,
                recordsProcessed: 50,
                categoriesIdentified: 4,
                insightsGenerated: 1
              }
            };
            break;
          default:
            stepResult = { status: 'completed' };
        }
        
        // Update step to completed
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId 
            ? { 
                ...w, 
                steps: w.steps.map(s => 
                  s.id === step.id ? { ...s, status: 'completed', endTime: new Date(), result: stepResult } : s
                )
              }
            : w
        ));
      }
      
      // Mark workflow as completed
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'completed', endTime: new Date(), currentStep: null }
          : w
      ));
      
      return { workflowId, status: 'completed', summary: 'Workflow executed successfully' };
    } catch (error) {
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error', endTime: new Date() }
          : w
      ));
      throw error;
    }
  }, [loadedPlugins, workflows]);

  const uploadFile = useCallback(async (file: File) => {
    const csvPlugin = loadedPlugins.get('csv-importer');
    if (!csvPlugin) {
      throw new Error('CSV Importer plugin not loaded');
    }
    
    try {
      const result = await csvPlugin.import(file);
      
      // Load data into engine if available
      if (engine && result.data) {
        await engine.loadData(result.data, 'uploaded_data');
      }
      
      return result;
    } catch (error) {
      console.error('[MCP App] Failed to upload file:', error);
      throw error;
    }
  }, [loadedPlugins, engine]);

  const retry = useCallback(async () => {
    setIsInitialized(false);
    setInitializationError(null);
    setEngine(null);
    setLoadedPlugins(new Map());
    // The useEffect will trigger re-initialization
  }, []);

  const value: DataPrismMCPContextValue = {
    engine,
    isInitialized,
    isInitializing,
    initializationError,
    mcpConnections,
    connectToMCPServer,
    disconnectFromMCPServer: async () => {}, // TODO: Implement
    invokeMCPTool: async () => {}, // TODO: Implement
    workflows,
    createWorkflow,
    executeWorkflow,
    getWorkflowState: (id) => workflows.find(w => w.id === id) || null,
    loadPlugin: async () => {}, // TODO: Implement
    getPlugin: (id) => loadedPlugins.get(id) || null,
    uploadFile,
    retry
  };

  return (
    <DataPrismMCPContext.Provider value={value}>
      {children}
    </DataPrismMCPContext.Provider>
  );
}

// Mock sales data for demonstration
const mockSalesData = [
  { date: '2024-01-01', amount: 1500, region: 'North', product: 'Widget A' },
  { date: '2024-01-02', amount: 2300, region: 'South', product: 'Widget B' },
  { date: '2024-01-03', amount: 1800, region: 'East', product: 'Widget A' },
  { date: '2024-01-04', amount: 2100, region: 'West', product: 'Widget C' },
  { date: '2024-01-05', amount: 2800, region: 'North', product: 'Widget B' },
  // Add more mock data as needed
];