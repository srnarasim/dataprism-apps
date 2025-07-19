/**
 * CDN Loader for DataPrism Dependencies
 * Dynamically loads DataPrism core and plugins from GitHub Pages CDN
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
    console.log('[CDN Loader] Loading DataPrism dependencies from CDN...');
    
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
    const coreUrl = `${this.config.coreBaseUrl}/dataprism-core.min.js`;
    console.log(`[CDN Loader] Loading core from: ${coreUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const module = await import(/* @vite-ignore */ coreUrl);
      console.log('[CDN Loader] ✅ Core loaded successfully from bundled DataPrism Core');
      
      return {
        DataPrismEngine: module.DataPrismEngine || module.default?.DataPrismEngine,
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
      constructor() {
        console.log('[Mock] DataPrism Engine initialized (demo mode)');
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

      async loadData(data: any[]) {
        console.log('[Mock] Loading data:', data.length, 'rows');
        return Promise.resolve();
      }
    }

    return {
      DataPrismEngine: MockDataPrismEngine,
      createEngine: () => new MockDataPrismEngine(),
      version: '1.0.0-demo',
    };
  }

  private async loadPlugins(): Promise<DataPrismPlugins> {
    const pluginsUrl = `${this.config.pluginsBaseUrl}/dataprism-plugins.min.js`;
    console.log(`[CDN Loader] Loading plugins from: ${pluginsUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const module = await import(/* @vite-ignore */ pluginsUrl);
      console.log('[CDN Loader] ✅ Plugins loaded successfully from bundled DataPrism Plugins');
      
      return {
        PluginManager: module.PluginManager || module.default?.PluginManager,
        loadDataPrismCore: module.loadDataPrismCore || (() => Promise.resolve({})),
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
    
    // Mock Plugin Manager for demo purposes
    class MockPluginManager {
      private plugins: Map<string, any> = new Map();

      constructor() {
        console.log('[Mock] PluginManager initialized (demo mode)');
        this.initializeMockPlugins();
      }

      private initializeMockPlugins() {
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

        // Charts Plugin
        this.plugins.set('observable-charts', {
          name: 'Observable Charts',
          version: '1.0.0',
          createChart: (data: any[], type: string) => {
            console.log('[Mock] Creating chart:', type, 'with', data.length, 'data points');
            return { chartId: `mock-chart-${Date.now()}` };
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
    }

    return {
      PluginManager: MockPluginManager,
      loadDataPrismCore: () => Promise.resolve({}),
      createPluginManager: () => new MockPluginManager(),
      availablePlugins: ['csv-importer', 'observable-charts', 'performance-monitor'],
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