import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { 
  loadDataPrismDependencies, 
  isCDNSupported,
  type LoadedDependencies 
} from "@utils/cdn-loader";
import type { FormulaResult, BulkFormulaRequest } from '../types/cell';
import type { PerformanceMetrics } from '../types/performance';

export interface FunctionDocumentation {
  name: string;
  category: string;
  description: string;
  syntax: string;
  example: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
}

export interface IronCalcContextValue {
  // Plugin state
  plugin: any | null;
  isPluginLoaded: boolean;
  pluginError: Error | null;
  
  // Core operations
  evaluateFormula: (formula: string, cellRef: string) => Promise<FormulaResult>;
  bulkEvaluate: (requests: BulkFormulaRequest[]) => Promise<FormulaResult[]>;
  
  // Function library
  getFunctionHelp: (functionName: string) => FunctionDocumentation | null;
  getFunctions: () => FunctionDocumentation[];
  
  // Performance metrics
  getPerformanceMetrics: () => PerformanceMetrics;
  
  // Utilities
  retry: () => Promise<void>;
  reloadPlugin: () => Promise<void>;
}

const IronCalcContext = createContext<IronCalcContextValue | null>(null);

export function useIronCalc() {
  const context = useContext(IronCalcContext);
  if (!context) {
    throw new Error("useIronCalc must be used within an IronCalcProvider");
  }
  return context;
}

interface IronCalcProviderProps {
  children: React.ReactNode;
}

export function IronCalcProvider({ children }: IronCalcProviderProps) {
  // Plugin state
  const [plugin, setPlugin] = useState<any | null>(null);
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);
  const [pluginError, setPluginError] = useState<Error | null>(null);
  
  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    formulaEvaluations: {
      total: 0,
      averageTime: 0,
      p95Time: 0,
      errorsCount: 0,
    },
    memoryUsage: {
      totalMB: 0,
      pluginMB: 0,
      applicationMB: 0,
    },
    interactions: {
      cellEdits: 0,
      formulaCreations: 0,
      fileOperations: 0,
    },
    pluginMetrics: {
      initializationTime: 0,
      apiLatency: 0,
      errorRate: 0,
    },
  });

  // Load IronCalc plugin
  const loadPlugin = useCallback(async () => {
    if (!isCDNSupported()) {
      const error = new Error('Browser does not support dynamic imports for plugin loading');
      setPluginError(error);
      console.error('[IronCalc] CDN not supported:', error);
      return;
    }

    setPluginError(null);
    const startTime = performance.now();

    try {
      console.log('[IronCalc] 🌐 Loading DataPrism dependencies with IronCalc plugin...');
      const dependencies = await loadDataPrismDependencies();
      
      console.log('[IronCalc] 🔌 Initializing IronCalc plugin...');
      const pluginManager = new dependencies.plugins.PluginManager();
      const ironCalcPlugin = pluginManager.getPlugin('ironcalc-formula');
      
      if (!ironCalcPlugin) {
        throw new Error('IronCalc plugin not found in plugin manager');
      }
      
      setPlugin(ironCalcPlugin);
      setIsPluginLoaded(true);
      
      const initTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        pluginMetrics: {
          ...prev.pluginMetrics,
          initializationTime: initTime,
        }
      }));
      
      console.log('[IronCalc] ✅ Plugin loaded successfully');
      console.log('[IronCalc] Available functions:', ironCalcPlugin.getFunctions?.()?.length || 0);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown plugin loading error');
      console.error('[IronCalc] ❌ Failed to load plugin:', err);
      setPluginError(err);
      setIsPluginLoaded(false);
    }
  }, []);

  // Initialize plugin on mount
  useEffect(() => {
    loadPlugin();
  }, [loadPlugin]);

  // Evaluate single formula
  const evaluateFormula = useCallback(async (
    formula: string, 
    cellRef: string
  ): Promise<FormulaResult> => {
    if (!plugin) {
      throw new Error('IronCalc plugin not loaded');
    }
    
    const startTime = performance.now();
    
    try {
      const result = await plugin.execute('evaluateFormula', {
        formula,
        sheet: 'Sheet1', // Default sheet
        row: parseInt(cellRef.match(/\d+/)?.[0] || '1') - 1,
        col: cellRef.match(/[A-Z]+/)?.[0] || 'A'
      });
      
      const executionTime = performance.now() - startTime;
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        formulaEvaluations: {
          total: prev.formulaEvaluations.total + 1,
          averageTime: (prev.formulaEvaluations.averageTime * prev.formulaEvaluations.total + executionTime) / (prev.formulaEvaluations.total + 1),
          p95Time: Math.max(prev.formulaEvaluations.p95Time, executionTime),
          errorsCount: prev.formulaEvaluations.errorsCount,
        }
      }));
      
      return {
        value: result.value,
        error: result.error,
        dependencies: result.dependencies,
        execution_time_ms: executionTime,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      // Update error count
      setPerformanceMetrics(prev => ({
        ...prev,
        formulaEvaluations: {
          ...prev.formulaEvaluations,
          total: prev.formulaEvaluations.total + 1,
          errorsCount: prev.formulaEvaluations.errorsCount + 1,
        }
      }));
      
      console.error('[IronCalc] Formula evaluation error:', error);
      throw error;
    }
  }, [plugin]);

  // Bulk evaluate formulas
  const bulkEvaluate = useCallback(async (
    requests: BulkFormulaRequest[]
  ): Promise<FormulaResult[]> => {
    if (!plugin) {
      throw new Error('IronCalc plugin not loaded');
    }
    
    const startTime = performance.now();
    
    try {
      const results = await Promise.all(
        requests.map(request => 
          evaluateFormula(request.formula, request.address)
        )
      );
      
      const executionTime = performance.now() - startTime;
      console.log('[IronCalc] Bulk evaluation completed:', requests.length, 'formulas in', executionTime, 'ms');
      
      return results;
    } catch (error) {
      console.error('[IronCalc] Bulk evaluation error:', error);
      throw error;
    }
  }, [plugin, evaluateFormula]);

  // Get function help
  const getFunctionHelp = useCallback((functionName: string): FunctionDocumentation | null => {
    if (!plugin || !plugin.getFunctionHelp) {
      return null;
    }
    
    try {
      return plugin.getFunctionHelp(functionName);
    } catch (error) {
      console.warn('[IronCalc] Failed to get function help for:', functionName, error);
      return null;
    }
  }, [plugin]);

  // Get all available functions
  const getFunctions = useCallback((): FunctionDocumentation[] => {
    if (!plugin || !plugin.getFunctions) {
      return [];
    }
    
    try {
      return plugin.getFunctions();
    } catch (error) {
      console.warn('[IronCalc] Failed to get function list:', error);
      return [];
    }
  }, [plugin]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    return performanceMetrics;
  }, [performanceMetrics]);

  // Retry plugin loading
  const retry = useCallback(async () => {
    setPlugin(null);
    setIsPluginLoaded(false);
    setPluginError(null);
    await loadPlugin();
  }, [loadPlugin]);

  // Reload plugin
  const reloadPlugin = useCallback(async () => {
    setPlugin(null);
    setIsPluginLoaded(false);
    setPluginError(null);
    
    // Reset performance metrics
    setPerformanceMetrics({
      formulaEvaluations: {
        total: 0,
        averageTime: 0,
        p95Time: 0,
        errorsCount: 0,
      },
      memoryUsage: {
        totalMB: 0,
        pluginMB: 0,
        applicationMB: 0,
      },
      interactions: {
        cellEdits: 0,
        formulaCreations: 0,
        fileOperations: 0,
      },
      pluginMetrics: {
        initializationTime: 0,
        apiLatency: 0,
        errorRate: 0,
      },
    });
    
    await loadPlugin();
  }, [loadPlugin]);

  const value: IronCalcContextValue = {
    // Plugin state
    plugin,
    isPluginLoaded,
    pluginError,
    
    // Core operations
    evaluateFormula,
    bulkEvaluate,
    
    // Function library
    getFunctionHelp,
    getFunctions,
    
    // Performance metrics
    getPerformanceMetrics,
    
    // Utilities
    retry,
    reloadPlugin,
  };

  return (
    <IronCalcContext.Provider value={value}>
      {children}
    </IronCalcContext.Provider>
  );
}