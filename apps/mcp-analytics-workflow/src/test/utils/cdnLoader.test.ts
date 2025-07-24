import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CDNAssetLoader } from '@/utils/cdnLoader';
import type { CDNConfig } from '@/config/cdn';

// Mock global window object
const mockGlobal = {
  DataPrism: {
    DuckDBManager: vi.fn(),
    DataPrismEngine: vi.fn()
  }
};

Object.defineProperty(global, 'window', {
  value: mockGlobal,
  writable: true
});

// Mock fetch
global.fetch = vi.fn();

describe('CDNAssetLoader', () => {
  const mockConfig: CDNConfig = {
    baseUrl: 'https://test-cdn.example.com',
    version: 'latest',
    fallback: {
      enabled: true,
      retries: 3,
      timeout: 5000
    }
  };

  let loader: CDNAssetLoader;

  beforeEach(() => {
    vi.clearAllMocks();
    loader = new CDNAssetLoader(mockConfig);
    
    // Reset window object
    delete (window as any).DataPrism;
    
    // Mock successful fetch response
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        files: {
          'dataprism-core.min.js': 'dataprism-core.min.js',
          'dataprism-arrow.min.js': 'dataprism-arrow.min.js'
        }
      })
    } as Response);
  });

  it('initializes with correct config', () => {
    expect(loader.config).toEqual(mockConfig);
  });

  it('loads manifest successfully', async () => {
    const manifest = await loader.loadManifest();
    
    expect(fetch).toHaveBeenCalledWith(
      'https://test-cdn.example.com/latest/manifest.json',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Accept': 'application/json'
        })
      })
    );

    expect(manifest).toEqual({
      files: {
        'dataprism-core.min.js': 'dataprism-core.min.js',
        'dataprism-arrow.min.js': 'dataprism-arrow.min.js'
      }
    });
  });

  it('handles manifest load failure with fallback', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    
    // Second call should succeed (fallback)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        files: { 'dataprism-core.min.js': 'dataprism-core.min.js' }
      })
    } as Response);

    const manifest = await loader.loadManifest();
    
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(manifest).toBeDefined();
  });

  it('injects script successfully', async () => {
    const mockScript = {
      src: '',
      onload: null as any,
      onerror: null as any,
      remove: vi.fn()
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockScript as any);
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockScript as any);

    const loadPromise = loader.loadScript('https://test-cdn.example.com/test.js');
    
    // Simulate successful script load
    setTimeout(() => {
      if (mockScript.onload) mockScript.onload(new Event('load'));
    }, 0);

    const result = await loadPromise;
    
    expect(result).toBe(true);
    expect(mockScript.src).toBe('https://test-cdn.example.com/test.js');
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(document.head.appendChild).toHaveBeenCalledWith(mockScript);
  });

  it('handles script load failure', async () => {
    const mockScript = {
      src: '',
      onload: null as any,
      onerror: null as any,
      remove: vi.fn()
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockScript as any);
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockScript as any);

    const loadPromise = loader.loadScript('https://test-cdn.example.com/test.js');
    
    // Simulate script load error
    setTimeout(() => {
      if (mockScript.onerror) mockScript.onerror(new Error('Script failed to load'));
    }, 0);

    await expect(loadPromise).rejects.toThrow('Script failed to load');
    expect(mockScript.remove).toHaveBeenCalled();
  });

  it('waits for global variable to be available', async () => {
    const waitPromise = loader.waitForGlobal('DataPrism', 1000);
    
    // Simulate DataPrism becoming available
    setTimeout(() => {
      (window as any).DataPrism = mockGlobal.DataPrism;
    }, 100);

    const result = await waitPromise;
    expect(result).toBe(mockGlobal.DataPrism);
  });

  it('times out when waiting for global variable', async () => {
    await expect(loader.waitForGlobal('NonExistentGlobal', 100))
      .rejects.toThrow('Timeout waiting for global variable: NonExistentGlobal');
  });

  it('loads core bundle successfully', async () => {
    // Mock successful script loading and global availability
    vi.spyOn(loader, 'loadScript').mockResolvedValue(true);
    vi.spyOn(loader, 'waitForGlobal').mockResolvedValue(mockGlobal.DataPrism);

    const result = await loader.loadCoreBundle();
    
    expect(result).toBe(mockGlobal.DataPrism);
    expect(loader.loadScript).toHaveBeenCalled();
    expect(loader.waitForGlobal).toHaveBeenCalledWith('DataPrism', expect.any(Number));
  });

  it('loads arrow bundle successfully', async () => {
    vi.spyOn(loader, 'loadScript').mockResolvedValue(true);
    
    const mockArrowModule = { Table: vi.fn(), RecordBatch: vi.fn() };
    vi.spyOn(loader, 'waitForGlobal').mockResolvedValue(mockArrowModule);

    const result = await loader.loadArrowBundle();
    
    expect(result).toBe(mockArrowModule);
    expect(loader.loadScript).toHaveBeenCalled();
    expect(loader.waitForGlobal).toHaveBeenCalledWith('Arrow', expect.any(Number));
  });

  it('initializes complete loading process', async () => {
    vi.spyOn(loader, 'loadManifest').mockResolvedValue({
      files: {
        'dataprism-core.min.js': 'dataprism-core.min.js',
        'dataprism-arrow.min.js': 'dataprism-arrow.min.js'
      }
    });
    vi.spyOn(loader, 'loadCoreBundle').mockResolvedValue(mockGlobal.DataPrism);
    vi.spyOn(loader, 'loadArrowBundle').mockResolvedValue({ Table: vi.fn() });

    await loader.initialize();
    
    expect(loader.loadManifest).toHaveBeenCalled();
    expect(loader.loadCoreBundle).toHaveBeenCalled();
    expect(loader.loadArrowBundle).toHaveBeenCalled();
  });

  it('handles initialization failure gracefully', async () => {
    vi.spyOn(loader, 'loadManifest').mockRejectedValue(new Error('Failed to load manifest'));

    await expect(loader.initialize()).rejects.toThrow('Failed to load manifest');
  });

  it('cleans up resources properly', () => {
    const cleanupSpy = vi.spyOn(loader, 'cleanup');
    
    loader.cleanup();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('handles retry logic correctly', async () => {
    // Mock first two calls to fail, third to succeed
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ files: {} })
      } as Response);

    const manifest = await loader.loadManifest();
    
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(manifest).toBeDefined();
  });

  it('respects timeout configuration', async () => {
    const shortTimeoutConfig: CDNConfig = {
      ...mockConfig,
      fallback: {
        enabled: true,
        retries: 1,
        timeout: 100
      }
    };

    const shortTimeoutLoader = new CDNAssetLoader(shortTimeoutConfig);
    
    // Mock a long delay that exceeds timeout
    vi.mocked(fetch).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    await expect(shortTimeoutLoader.loadManifest()).rejects.toThrow();
  });

  it('constructs asset URLs correctly', () => {
    const urls = loader.getAssetUrls();
    
    expect(urls.coreBundle).toBe('https://test-cdn.example.com/latest/dataprism-core.min.js');
    expect(urls.arrowBundle).toBe('https://test-cdn.example.com/latest/dataprism-arrow.min.js');
    expect(urls.manifest).toBe('https://test-cdn.example.com/latest/manifest.json');
  });
});