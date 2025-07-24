/**
 * Type definitions for DataPrism MCP Analytics validation system
 */

export interface AssetMetrics {
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  size?: number;
  status: 'loading' | 'success' | 'error';
  error?: string;
}