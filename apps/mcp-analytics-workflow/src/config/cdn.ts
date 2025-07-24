/**
 * CDN Configuration for DataPrism MCP Analytics Workflow
 * Handles version-controlled CDN consumption with fallback strategies
 */

export interface CDNConfig {
  baseUrl: string;
  version: string;
  integrity?: {
    core?: string;
    orchestration?: string;
    plugins?: Record<string, string>;
  };
  fallback?: {
    enabled: boolean;
    retries: number;
    timeout: number;
  };
}

export const defaultCDNConfig: CDNConfig = {
  baseUrl: 'https://srnarasim.github.io/DataPrism',
  version: 'latest',
  fallback: {
    enabled: true,
    retries: 5,
    timeout: 30000
  }
};

// Environment-based configuration
export const getCDNConfig = (): CDNConfig => {
  return {
    ...defaultCDNConfig,
    baseUrl: import.meta.env.VITE_DATAPRISM_CDN_URL || defaultCDNConfig.baseUrl,
    version: import.meta.env.VITE_DATAPRISM_VERSION || defaultCDNConfig.version,
  };
};

// CDN Asset URLs for Hybrid Architecture
export const getCDNAssetUrls = (config: CDNConfig = getCDNConfig()) => {
  const baseUrl = config.baseUrl;
  
  return {
    manifest: `${baseUrl}/manifest.json`,
    coreBundle: `${baseUrl}/dataprism.umd.js`, // ~29KB with hybrid loading
    coreESModule: `${baseUrl}/dataprism.min.js`, // ~36KB with hybrid loading
    wasmAssets: `${baseUrl}/assets/`, // Auto-detects CDN base URL
    plugins: `${baseUrl}/plugins/manifest.json`,
    workers: `${baseUrl}/workers/` // DuckDB workers (~3MB)
  };
};

// Performance configuration for Hybrid Architecture
export const CDN_PERFORMANCE_CONFIG = {
  maxLoadTime: 8000,
  maxRetries: 5,
  retryDelay: 1000,
  cacheDuration: 3600000, // 1 hour
  hybridLoadingTimeout: 30000,
  workerLoadTimeout: 10000,
  dependencyTimeout: 30000,
  progressTracking: true,
} as const;