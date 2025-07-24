import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock matchMedia for tests that use media queries
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

// Mock ResizeObserver for React Flow
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock DOMRect for React Flow positioning
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  })),
});

// Mock URL.createObjectURL for CSV download tests
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn().mockImplementation(() => 'mock-object-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Only mock console.error for React warnings we can't control
  console.error = vi.fn((message) => {
    if (typeof message === 'string' && message.includes('Warning:')) {
      return;
    }
    originalConsoleError(message);
  });
  
  console.warn = vi.fn((message) => {
    if (typeof message === 'string' && (
      message.includes('ReactFlow') || 
      message.includes('React Flow')
    )) {
      return;
    }
    originalConsoleWarn(message);
  });
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});