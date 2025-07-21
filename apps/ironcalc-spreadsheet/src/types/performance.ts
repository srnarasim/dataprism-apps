export interface PerformanceMetrics {
  // Formula evaluation metrics
  formulaEvaluations: {
    total: number;
    averageTime: number;
    p95Time: number;
    errorsCount: number;
  };
  
  // Memory usage
  memoryUsage: {
    totalMB: number;
    pluginMB: number;
    applicationMB: number;
  };
  
  // User interaction metrics
  interactions: {
    cellEdits: number;
    formulaCreations: number;
    fileOperations: number;
  };
  
  // Plugin performance
  pluginMetrics: {
    initializationTime: number;
    apiLatency: number;
    errorRate: number;
  };
}

export interface PerformanceEvent {
  type: 'formula_evaluation' | 'file_operation' | 'user_interaction';
  timestamp: number;
  duration: number;
  details: any;
}

export interface PerformanceTracker {
  startTracking(eventType: string, details?: any): string;
  endTracking(trackingId: string): number;
  getMetrics(): PerformanceMetrics;
  reset(): void;
}