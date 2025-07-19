import { describe, it, expect } from 'vitest';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('should be a React component', () => {
    expect(ErrorBoundary).toBeDefined();
    expect(typeof ErrorBoundary).toBe('function');
  });

  it('should have static getDerivedStateFromError method', () => {
    expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    expect(typeof ErrorBoundary.getDerivedStateFromError).toBe('function');
  });

  it('should return error state when getDerivedStateFromError is called', () => {
    const error = new Error('Test error');
    const state = ErrorBoundary.getDerivedStateFromError(error);
    expect(state).toEqual({ hasError: true, error });
  });
});