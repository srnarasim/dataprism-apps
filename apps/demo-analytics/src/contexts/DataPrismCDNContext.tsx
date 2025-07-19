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

interface DataPrismContextValue {
  // CDN Loading state
  dependencies: LoadedDependencies | null;
  isLoadingDependencies: boolean;
  dependencyError: Error | null;
  
  // Engine state
  engine: any | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: Error | null;

  // Core operations
  query: (sql: string) => Promise<any>;
  loadData: (data: any[], tableName?: string) => Promise<void>;
  getTableInfo: (tableName: string) => Promise<any>;
  listTables: () => Promise<string[]>;

  // Performance monitoring
  getPerformanceMetrics: () => Promise<any>;

  // Plugin operations
  loadPlugin: (pluginUrl: string) => Promise<void>;
  listLoadedPlugins: () => string[];

  // Utilities
  retry: () => Promise<void>;
  reloadDependencies: () => Promise<void>;
}

const DataPrismContext = createContext<DataPrismContextValue | null>(null);

export function useDataPrism() {
  const context = useContext(DataPrismContext);
  if (!context) {
    throw new Error("useDataPrism must be used within a DataPrismProvider");
  }
  return context;
}

interface DataPrismProviderProps {
  children: React.ReactNode;
  cdnConfig?: {
    coreBaseUrl?: string;
    pluginsBaseUrl?: string;
    timeout?: number;
    retries?: number;
  };
}

export function DataPrismProvider({ children, cdnConfig }: DataPrismProviderProps) {
  // CDN Loading state
  const [dependencies, setDependencies] = useState<LoadedDependencies | null>(null);
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);
  const [dependencyError, setDependencyError] = useState<Error | null>(null);

  // Engine state
  const [engine, setEngine] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  // Plugin state
  const [loadedPlugins, setLoadedPlugins] = useState<string[]>([]);

  // Load dependencies from CDN
  const loadDependencies = useCallback(async () => {
    if (isLoadingDependencies || dependencies) return;

    if (!isCDNSupported()) {
      const error = new Error('Browser does not support dynamic imports for CDN loading');
      setDependencyError(error);
      console.error('[DataPrism] CDN not supported:', error);
      return;
    }

    setIsLoadingDependencies(true);
    setDependencyError(null);

    try {
      console.log('[DataPrism] 🌐 Loading dependencies from CDN...');
      const deps = await loadDataPrismDependencies(cdnConfig);
      
      setDependencies(deps);
      console.log('[DataPrism] ✅ Dependencies loaded from CDN successfully');
      
      // Auto-initialize engine after dependencies are loaded
      await initializeEngine(deps);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown dependency loading error');
      console.error('[DataPrism] ❌ Failed to load dependencies:', err);
      setDependencyError(err);
    } finally {
      setIsLoadingDependencies(false);
    }
  }, [isLoadingDependencies, dependencies, cdnConfig]);

  // Initialize DataPrism engine
  const initializeEngine = useCallback(async (deps?: LoadedDependencies) => {
    const currentDeps = deps || dependencies;
    if (!currentDeps) {
      throw new Error('Dependencies not loaded');
    }

    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    setInitializationError(null);

    try {
      console.log('[DataPrism] 🚀 Initializing DataPrism Core engine...');

      const { DataPrismEngine } = currentDeps.core;
      
      if (!DataPrismEngine) {
        throw new Error('DataPrismEngine not found in loaded CDN modules');
      }
      
      // Initialize the engine with CDN-loaded types
      const engineInstance = new DataPrismEngine({
        maxMemoryMB: 512,
        enableWasmOptimizations: true,
        queryTimeoutMs: 30000,
        logLevel: import.meta.env.DEV ? "debug" : "info",
      });

      await engineInstance.initialize();
      console.log('[DataPrism] ✅ Engine initialized successfully');

      setEngine(engineInstance);
      setIsInitialized(true);

      // Load sample datasets
      await loadSampleData(engineInstance);
      
      // Initialize plugin manager
      await initializePluginManager(currentDeps, engineInstance);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown initialization error');
      console.error('[DataPrism] ❌ Failed to initialize engine:', err);
      setInitializationError(err);
    } finally {
      setIsInitializing(false);
    }
  }, [dependencies, isInitializing, isInitialized, cdnConfig]);

  // Initialize plugin manager
  const initializePluginManager = useCallback(async (deps: LoadedDependencies, engineInstance: any) => {
    try {
      const { PluginManager } = deps.plugins;
      const pluginManager = new PluginManager();
      
      // Store plugin manager on engine for easy access
      engineInstance._pluginManager = pluginManager;
      
      console.log('[DataPrism] 🔌 Plugin manager initialized');
    } catch (error) {
      console.warn('[DataPrism] ⚠️ Failed to initialize plugin manager:', error);
    }
  }, []);

  // Load sample data into engine
  const loadSampleData = async (engineInstance: any) => {
    try {
      // Sample sales data
      const salesData = generateSalesData(1000);
      await engineInstance.loadData(salesData, "sales");
      console.log('[DataPrism] 📊 Loaded sample sales data (1000 records)');

      // Sample user analytics data
      const analyticsData = generateAnalyticsData(5000);
      await engineInstance.loadData(analyticsData, "analytics");
      console.log('[DataPrism] 📈 Loaded sample analytics data (5000 records)');

      // Sample product data
      const productData = generateProductData(200);
      await engineInstance.loadData(productData, "products");
      console.log('[DataPrism] 🛍️ Loaded sample product data (200 records)');
    } catch (error) {
      console.warn('[DataPrism] ⚠️ Failed to load sample data:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  // Context methods
  const query = useCallback(
    async (sql: string) => {
      if (!engine) throw new Error("DataPrism engine not initialized");
      return await engine.query(sql);
    },
    [engine],
  );

  const loadData = useCallback(
    async (data: any[], tableName = "user_data") => {
      if (!engine) throw new Error("DataPrism engine not initialized");
      return await engine.loadData(data, tableName);
    },
    [engine],
  );

  const getTableInfo = useCallback(
    async (tableName: string) => {
      if (!engine) throw new Error("DataPrism engine not initialized");
      return await engine.getTableInfo(tableName);
    },
    [engine],
  );

  const listTables = useCallback(async () => {
    if (!engine) throw new Error("DataPrism engine not initialized");
    return await engine.listTables();
  }, [engine]);

  const getPerformanceMetrics = useCallback(async () => {
    if (!engine) throw new Error("DataPrism engine not initialized");
    return engine.getMetrics();
  }, [engine]);

  const loadPlugin = useCallback(async (pluginUrl: string) => {
    if (!engine?._pluginManager) {
      throw new Error("Plugin manager not available");
    }
    
    try {
      await engine._pluginManager.loadPlugin(pluginUrl);
      setLoadedPlugins(prev => [...prev, pluginUrl]);
      console.log(`[DataPrism] 🔌 Plugin loaded: ${pluginUrl}`);
    } catch (error) {
      console.error('[DataPrism] Failed to load plugin:', error);
      throw error;
    }
  }, [engine]);

  const listLoadedPlugins = useCallback(() => {
    return loadedPlugins;
  }, [loadedPlugins]);

  const retry = useCallback(async () => {
    setIsInitialized(false);
    setInitializationError(null);
    if (dependencies) {
      await initializeEngine();
    } else {
      await loadDependencies();
    }
  }, [dependencies, initializeEngine, loadDependencies]);

  const reloadDependencies = useCallback(async () => {
    setDependencies(null);
    setEngine(null);
    setIsInitialized(false);
    setLoadedPlugins([]);
    await loadDependencies();
  }, [loadDependencies]);

  const value: DataPrismContextValue = {
    // CDN state
    dependencies,
    isLoadingDependencies,
    dependencyError,
    
    // Engine state
    engine,
    isInitialized,
    isInitializing,
    initializationError,
    
    // Methods
    query,
    loadData,
    getTableInfo,
    listTables,
    getPerformanceMetrics,
    loadPlugin,
    listLoadedPlugins,
    retry,
    reloadDependencies,
  };

  return (
    <DataPrismContext.Provider value={value}>
      {children}
    </DataPrismContext.Provider>
  );
}

// Sample data generators (same as before)
function generateSalesData(count: number) {
  const regions = ["North", "South", "East", "West"];
  const products = ["Widget A", "Widget B", "Gadget X", "Gadget Y", "Tool Z"];
  const salespeople = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    date: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    )
      .toISOString()
      .split("T")[0],
    region: regions[Math.floor(Math.random() * regions.length)],
    product: products[Math.floor(Math.random() * products.length)],
    salesperson: salespeople[Math.floor(Math.random() * salespeople.length)],
    quantity: Math.floor(Math.random() * 100) + 1,
    unit_price: Math.round((Math.random() * 1000 + 50) * 100) / 100,
    total: 0,
  })).map((row) => ({
    ...row,
    total: Math.round(row.quantity * row.unit_price * 100) / 100,
  }));
}

function generateAnalyticsData(count: number) {
  const sources = [
    "google",
    "facebook", 
    "twitter",
    "linkedin",
    "direct",
    "email",
  ];
  const pages = ["/", "/products", "/about", "/contact", "/blog", "/pricing"];
  const devices = ["desktop", "mobile", "tablet"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
    session_id: `session_${Math.floor(Math.random() * 2000) + 1}`,
    source: sources[Math.floor(Math.random() * sources.length)],
    page: pages[Math.floor(Math.random() * pages.length)],
    device: devices[Math.floor(Math.random() * devices.length)],
    duration: Math.floor(Math.random() * 600) + 10,
    bounce: Math.random() < 0.4,
    conversion: Math.random() < 0.1,
  }));
}

function generateProductData(count: number) {
  const categories = [
    "Electronics",
    "Clothing", 
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
  ];
  const brands = ["BrandA", "BrandB", "BrandC", "BrandD", "BrandE"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    brand: brands[Math.floor(Math.random() * brands.length)],
    price: Math.round((Math.random() * 500 + 10) * 100) / 100,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    reviews_count: Math.floor(Math.random() * 1000),
    in_stock: Math.random() < 0.9,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  }));
}