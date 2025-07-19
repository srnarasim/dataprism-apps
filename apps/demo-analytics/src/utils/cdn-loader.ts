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
    const coreUrl = `${this.config.coreBaseUrl}/orchestration/index.js`;
    console.log(`[CDN Loader] Loading core from: ${coreUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const module = await import(/* @vite-ignore */ coreUrl);
      console.log('[CDN Loader] ✅ Core loaded successfully');
      
      return {
        DataPrismEngine: module.DataPrismEngine || class DataPrismEngine {},
        ...module,
      };
    } catch (error) {
      console.error('[CDN Loader] Failed to load core:', error);
      throw new Error(`Failed to load DataPrism core: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async loadPlugins(): Promise<DataPrismPlugins> {
    const pluginsUrl = `${this.config.pluginsBaseUrl}/plugins/index.js`;
    console.log(`[CDN Loader] Loading plugins from: ${pluginsUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const module = await import(/* @vite-ignore */ pluginsUrl);
      console.log('[CDN Loader] ✅ Plugins loaded successfully');
      
      return {
        PluginManager: module.PluginManager || class PluginManager {},
        loadDataPrismCore: module.loadDataPrismCore || (() => Promise.resolve({})),
        ...module,
      };
    } catch (error) {
      console.error('[CDN Loader] Failed to load plugins:', error);
      throw new Error(`Failed to load DataPrism plugins: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
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