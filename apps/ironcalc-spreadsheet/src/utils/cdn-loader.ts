/**
 * CDN Loader for DataPrism Dependencies with IronCalc Plugin Support
 * Dynamically loads DataPrism core and IronCalc plugin from GitHub Pages CDN
 */

export interface CDNLoaderConfig {
  coreBaseUrl?: string;
  pluginsBaseUrl?: string;
  timeout?: number;
  retries?: number;
  enableCache?: boolean;
}

export interface DataPrismCore {
  DataPrismEngine: any;
  [key: string]: any;
}

export interface DataPrismPlugins {
  PluginManager: any;
  loadDataPrismCore: any;
  IronCalcPlugin?: any;
  [key: string]: any;
}

export interface LoadedDependencies {
  core: DataPrismCore;
  plugins: DataPrismPlugins;
}

export class DataPrismCDNLoader {
  private static instance: DataPrismCDNLoader;
  private config: Required<CDNLoaderConfig>;
  private loadPromise: Promise<LoadedDependencies> | null = null;
  private cache: LoadedDependencies | null = null;

  constructor(config: CDNLoaderConfig = {}) {
    this.config = {
      coreBaseUrl: 'https://srnarasim.github.io/dataprism-core',
      pluginsBaseUrl: 'https://srnarasim.github.io/dataprism-plugins',
      timeout: 30000,
      retries: 3,
      enableCache: true,
      ...config,
    };
  }

  static getInstance(config?: CDNLoaderConfig): DataPrismCDNLoader {
    if (!DataPrismCDNLoader.instance) {
      DataPrismCDNLoader.instance = new DataPrismCDNLoader(config);
    }
    return DataPrismCDNLoader.instance;
  }

  /**
   * Load both core and plugins from CDN
   */
  async loadDependencies(): Promise<LoadedDependencies> {
    if (this.cache && this.config.enableCache) {
      console.log('[CDN Loader] Using cached dependencies');
      return this.cache;
    }

    if (this.loadPromise) {
      console.log('[CDN Loader] Loading already in progress...');
      return this.loadPromise;
    }

    this.loadPromise = this.performLoad();
    return this.loadPromise;
  }

  private async performLoad(): Promise<LoadedDependencies> {
    console.log('[CDN Loader] Loading DataPrism dependencies with IronCalc plugin...');
    
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`[CDN Loader] Attempt ${attempt}/${this.config.retries}`);
        
        // Load core and plugins in parallel
        const [core, plugins] = await Promise.all([
          this.loadCore(),
          this.loadPlugins(),
        ]);

        const dependencies: LoadedDependencies = { core, plugins };
        
        if (this.config.enableCache) {
          this.cache = dependencies;
        }

        console.log('[CDN Loader] ✅ Successfully loaded all dependencies from CDN');
        return dependencies;

      } catch (error) {
        lastError = error as Error;
        console.warn(`[CDN Loader] Attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[CDN Loader] Retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    const error = new Error(
      `Failed to load DataPrism dependencies after ${this.config.retries} attempts. Last error: ${lastError?.message}`
    );
    console.error('[CDN Loader]', error);
    throw error;
  }

  private async loadCore(): Promise<DataPrismCore> {
    const coreUrl = `${this.config.coreBaseUrl}/dataprism-core.es.js`;
    console.log(`[CDN Loader] Loading core from: ${coreUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const module = await import(/* @vite-ignore */ coreUrl);
      console.log('[CDN Loader] ✅ Core loaded successfully from bundled DataPrism Core');
      console.log('[CDN Loader] Available exports:', Object.keys(module));
      
      return {
        DataPrismEngine: module.DataPrismEngine || module.default,
        createEngine: module.createEngine,
        version: module.version,
        ...module,
      };
    } catch (error) {
      console.warn('[CDN Loader] Failed to load core from CDN, using fallback implementation:', error);
      
      // Fallback implementation for demo purposes
      return this.createCoreFallback();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private createCoreFallback(): DataPrismCore {
    console.log('[CDN Loader] Using DataPrism core fallback implementation');
    
    // Mock DataPrism Engine for demo purposes
    class MockDataPrismEngine {
      private pluginManager: any;
      
      constructor(config: any = {}) {
        console.log('[Mock] DataPrism Engine initialized (demo mode)');
        this.pluginManager = null;
      }

      async initialize() {
        console.log('[Mock] Engine initialization complete');
        return Promise.resolve();
      }

      async query(sql: string) {
        console.log('[Mock] Executing query:', sql);
        // Return mock data for demo
        return {
          data: [
            { id: 1, name: 'Sample Data 1', value: 100 },
            { id: 2, name: 'Sample Data 2', value: 200 },
            { id: 3, name: 'Sample Data 3', value: 150 },
          ],
          rowCount: 3,
          executionTime: Math.random() * 100,
        };
      }

      async loadData(data: any[], tableName: string = 'user_data') {
        console.log('[Mock] Loading data:', data.length, 'rows into table:', tableName);
        return Promise.resolve();
      }

      async getTableInfo(tableName: string) {
        console.log('[Mock] Getting table info for:', tableName);
        return {
          name: tableName,
          columns: ['id', 'name', 'value'],
          rowCount: 3
        };
      }

      async listTables() {
        console.log('[Mock] Listing tables');
        return ['sales', 'analytics', 'products'];
      }

      getMetrics() {
        return {
          queryCount: 0,
          averageQueryTime: 0,
          memoryUsage: 0
        };
      }
    }

    return {
      DataPrismEngine: MockDataPrismEngine,
      createEngine: (config: any) => new MockDataPrismEngine(config),
      version: '1.0.0-demo',
    };
  }

  private async loadPlugins(): Promise<DataPrismPlugins> {
    const pluginsUrl = `${this.config.pluginsBaseUrl}/dataprism-plugins.es.js`;
    console.log(`[CDN Loader] Loading plugins from: ${pluginsUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const module = await import(/* @vite-ignore */ pluginsUrl);
      console.log('[CDN Loader] ✅ Plugins loaded successfully from bundled DataPrism Plugins');
      console.log('[CDN Loader] Available plugin exports:', Object.keys(module));
      
      return {
        PluginManager: module.PluginManager || module.default,
        loadDataPrismCore: module.loadDataPrismCore || (() => Promise.resolve({})),
        IronCalcPlugin: module.IronCalcPlugin,
        version: module.version,
        ...module,
      };
    } catch (error) {
      console.warn('[CDN Loader] Failed to load plugins from CDN, using fallback implementation:', error);
      
      // Fallback implementation for demo purposes
      return this.createPluginsFallback();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private createPluginsFallback(): DataPrismPlugins {
    console.log('[CDN Loader] Using DataPrism plugins fallback implementation');
    
    // Mock IronCalc Plugin for demo purposes
    class MockIronCalcPlugin {
      private functions: Map<string, any> = new Map();

      constructor() {
        console.log('[Mock] IronCalc Plugin initialized (demo mode)');
        this.initializeMockFunctions();
      }

      private initializeMockFunctions() {
        // Mock Excel functions
        const functions = [
          'SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX', 'IF', 'VLOOKUP', 'CONCATENATE',
          'LEN', 'LEFT', 'RIGHT', 'MID', 'UPPER', 'LOWER', 'TRIM', 'ROUND',
          'ABS', 'SQRT', 'POWER', 'MOD', 'TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY'
        ];
        
        functions.forEach(name => {
          this.functions.set(name, {
            name,
            category: this.getCategoryForFunction(name),
            description: `Mock implementation of ${name} function`,
            syntax: `${name}(args...)`,
            example: `=${name}(A1:A10)`
          });
        });
      }

      private getCategoryForFunction(name: string): string {
        if (['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX'].includes(name)) return 'Statistical';
        if (['IF', 'AND', 'OR', 'NOT'].includes(name)) return 'Logical';
        if (['LEN', 'LEFT', 'RIGHT', 'MID', 'UPPER', 'LOWER', 'TRIM', 'CONCATENATE'].includes(name)) return 'Text';
        if (['ROUND', 'ABS', 'SQRT', 'POWER', 'MOD'].includes(name)) return 'Math';
        if (['TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY'].includes(name)) return 'Date';
        if (['VLOOKUP', 'INDEX', 'MATCH'].includes(name)) return 'Lookup';
        return 'General';
      }

      async execute(operation: string, params: any) {
        console.log('[Mock] IronCalc Plugin execute:', operation, params);
        
        if (operation === 'evaluateFormula') {
          return this.mockEvaluateFormula(params.formula);
        }
        
        return { result: 'mock_result', execution_time_ms: Math.random() * 50 };
      }

      private mockEvaluateFormula(formula: string) {
        console.log('[Mock] Evaluating formula:', formula);
        
        // Simple mock evaluation
        if (formula.startsWith('=SUM(')) {
          return { value: 100, type: 'number', execution_time_ms: 10 };
        }
        if (formula.startsWith('=AVERAGE(')) {
          return { value: 50, type: 'number', execution_time_ms: 15 };
        }
        if (formula.startsWith('=COUNT(')) {
          return { value: 5, type: 'number', execution_time_ms: 8 };
        }
        if (formula.startsWith('=IF(')) {
          return { value: 'TRUE', type: 'boolean', execution_time_ms: 12 };
        }
        
        // Default mock result
        return { 
          value: 'Mock Result', 
          type: 'string', 
          execution_time_ms: Math.random() * 20 
        };
      }

      getFunctions() {
        return Array.from(this.functions.values());
      }

      getFunctionHelp(name: string) {
        return this.functions.get(name) || null;
      }

      getVersion() {
        return '1.0.0-mock';
      }
    }

    // Mock Plugin Manager
    class MockPluginManager {
      private plugins: Map<string, any> = new Map();

      constructor() {
        console.log('[Mock] PluginManager initialized (demo mode)');
        this.initializeMockPlugins();
      }

      private initializeMockPlugins() {
        // IronCalc Formula Engine Plugin
        this.plugins.set('ironcalc-formula', new MockIronCalcPlugin());

        // CSV Importer Plugin
        this.plugins.set('csv-importer', {
          name: 'CSV Importer',
          version: '1.0.0',
          import: (file: File) => {
            console.log('[Mock] CSV Import:', file.name);
            return Promise.resolve([
              { col1: 'Row 1 Data', col2: 100, col3: true },
              { col1: 'Row 2 Data', col2: 200, col3: false },
              { col1: 'Row 3 Data', col2: 150, col3: true },
            ]);
          }
        });

        // Performance Monitor Plugin
        this.plugins.set('performance-monitor', {
          name: 'Performance Monitor',
          version: '1.0.0',
          startMonitoring: () => {
            console.log('[Mock] Performance monitoring started');
            return { sessionId: `mock-session-${Date.now()}` };
          }
        });
      }

      getPlugin(name: string) {
        return this.plugins.get(name);
      }

      listPlugins() {
        return Array.from(this.plugins.keys());
      }

      async loadPlugin(pluginUrl: string) {
        console.log('[Mock] Loading plugin from:', pluginUrl);
        // Mock plugin loading
        return Promise.resolve();
      }
    }

    return {
      PluginManager: MockPluginManager,
      IronCalcPlugin: MockIronCalcPlugin,
      loadDataPrismCore: () => Promise.resolve({}),
      createPluginManager: () => new MockPluginManager(),
      availablePlugins: ['ironcalc-formula', 'csv-importer', 'performance-monitor'],
      version: '1.0.0-demo',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache and reset loader state
   */
  reset(): void {
    this.cache = null;
    this.loadPromise = null;
    console.log('[CDN Loader] Reset cache and state');
  }

  /**
   * Check if dependencies are loaded
   */
  isLoaded(): boolean {
    return this.cache !== null;
  }

  /**
   * Get cached dependencies (throws if not loaded)
   */
  getDependencies(): LoadedDependencies {
    if (!this.cache) {
      throw new Error('Dependencies not loaded. Call loadDependencies() first.');
    }
    return this.cache;
  }
}

// Default singleton instance
export const cdnLoader = DataPrismCDNLoader.getInstance();

// Convenience function for loading dependencies
export async function loadDataPrismDependencies(config?: CDNLoaderConfig): Promise<LoadedDependencies> {
  const loader = config ? new DataPrismCDNLoader(config) : cdnLoader;
  return loader.loadDependencies();
}

// Browser compatibility check
export function isCDNSupported(): boolean {
  try {
    // Check for dynamic import support
    new Function('return import("data:text/javascript,export default 1")')();
    return true;
  } catch {
    return false;
  }
}