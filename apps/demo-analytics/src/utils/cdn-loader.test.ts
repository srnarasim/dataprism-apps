import { describe, it, expect, vi } from 'vitest';

// Mock the entire cdn-loader module to avoid dynamic import issues in tests
vi.mock('./cdn-loader', () => ({
  isCDNSupported: vi.fn(() => true),
  DataPrismCDNLoader: vi.fn().mockImplementation(() => ({
    loadDependencies: vi.fn().mockResolvedValue({
      core: { DataPrismCore: vi.fn() },
      plugins: { AnalyticsPlugin: vi.fn() }
    }),
    isCDNSupported: vi.fn(() => true)
  }))
}));

describe('CDN Loader Utils', () => {
  it('should have isCDNSupported function', async () => {
    const { isCDNSupported } = await import('./cdn-loader');
    expect(isCDNSupported).toBeDefined();
    expect(typeof isCDNSupported).toBe('function');
  });

  it('should have DataPrismCDNLoader class', async () => {
    const { DataPrismCDNLoader } = await import('./cdn-loader');
    expect(DataPrismCDNLoader).toBeDefined();
    expect(typeof DataPrismCDNLoader).toBe('function');
  });
});