import '@testing-library/jest-dom';
import { beforeAll, afterAll, vi } from 'vitest';

// Mock console methods to reduce noise in tests
beforeAll(() => {
  // Mock console methods if needed for specific tests
  global.console = {
    ...console,
    // Uncomment and modify as needed
    // warn: vi.fn(),
    // error: vi.fn(),
  };
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock Web APIs that might not be available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));