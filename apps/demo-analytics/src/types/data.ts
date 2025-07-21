/**
 * Data types and interfaces for the DataPrism Analytics Demo
 */

export interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullable: boolean;
  unique?: boolean;
  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  nullCount?: number;
  uniqueCount?: number;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  rowCount: number;
  primaryKey?: string[];
  foreignKeys?: ForeignKeyDefinition[];
  indexes?: IndexDefinition[];
  memoryUsage?: number;
  createdAt: Date;
}

export interface ForeignKeyDefinition {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface DataQualityMetrics {
  completeness: number; // Percentage of non-null values
  uniqueness: number;   // Percentage of unique values
  validity: number;     // Percentage of valid values
  consistency: number;  // Data consistency score
  warnings: string[];
  recommendations: string[];
}

export interface UploadProgress {
  stage: 'reading' | 'parsing' | 'validating' | 'importing' | 'complete';
  progress: number; // 0-100
  message: string;
  rowsProcessed?: number;
  totalRows?: number;
  errors?: string[];
}

export interface UploadResult {
  success: boolean;
  tableName: string;
  schema: TableSchema;
  sampleData: any[];
  importDuration: number;
  warnings?: string[];
  error?: string;
}

export interface SampleDataSet {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'financial' | 'scientific' | 'demo';
  size: string;
  columns: number;
  rows: number;
  tags: string[];
  previewData: any[];
  generator: () => Promise<any[]>;
}

export interface ColumnFilter {
  column: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  operator: FilterOperator;
  value: any;
  active: boolean;
}

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'starts_with' 
  | 'ends_with'
  | 'greater_than' 
  | 'less_than' 
  | 'between' 
  | 'in' 
  | 'not_in'
  | 'is_null' 
  | 'is_not_null';

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'parquet';
  includeHeaders: boolean;
  dateFormat?: string;
  numberFormat?: string;
  maxRows?: number;
  selectedColumns?: string[];
}

export interface QueryResult {
  data: any[];
  metadata: QueryMetadata;
  executionPlan?: QueryPlan;
  performance: PerformanceMetrics;
  warnings?: string[];
  error?: string;
}

export interface QueryMetadata {
  rowCount: number;
  columnCount: number;
  executionTime: number;
  memoryUsage: number;
  columns: ColumnDefinition[];
  queryId: string;
  timestamp: Date;
}

export interface QueryPlan {
  steps: QueryStep[];
  estimatedCost: number;
  actualCost?: number;
}

export interface QueryStep {
  operation: string;
  table?: string;
  estimatedRows: number;
  actualRows?: number;
  cost: number;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryPeak: number;
  memoryAverage: number;
  cpuTime: number;
  ioOperations: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface ChartConfiguration {
  id: string;
  name: string;
  type: ChartType;
  data: any[];
  dimensions: ChartDimensions;
  styling: ChartStyle;
  interactions: InteractionConfig;
  plugins: ChartPlugin[];
}

export interface ChartType {
  id: string;
  name: string;
  library: 'chartjs' | 'd3' | 'observable' | 'recharts';
  category: 'basic' | 'statistical' | 'advanced';
  supportedDataTypes: ('categorical' | 'numerical' | 'temporal')[];
  requiredDimensions: string[];
  optionalDimensions: string[];
}

export interface ChartDimensions {
  x: string;
  y: string | string[];
  group?: string;
  size?: string;
  color?: string;
  facet?: string;
}

export interface ChartStyle {
  theme: 'light' | 'dark' | 'auto';
  colors: string[];
  width?: number;
  height?: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface InteractionConfig {
  zoom: boolean;
  pan: boolean;
  hover: boolean;
  select: boolean;
  brush: boolean;
}

export interface ChartPlugin {
  name: string;
  version: string;
  enhance: (chart: any, config: any) => void;
  cleanup?: (chart: any) => void;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  charts: ChartConfiguration[];
  filters: GlobalFilter[];
  refreshRate?: number;
  created: Date;
  modified: Date;
}

export interface DashboardLayout {
  type: 'grid' | 'free';
  columns: number;
  gap: number;
  items: LayoutItem[];
}

export interface LayoutItem {
  id: string;
  chartId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GlobalFilter {
  id: string;
  name: string;
  column: string;
  type: 'select' | 'range' | 'date_range' | 'search';
  options?: string[];
  defaultValue?: any;
  applies_to: string[]; // Chart IDs
}

export interface ParseOptions {
  format?: 'csv' | 'tsv' | 'json' | 'parquet';
  delimiter?: string;
  encoding?: string;
  hasHeaders?: boolean;
  skipLines?: number;
  maxRows?: number;
  dateFormat?: string;
  decimalSeparator?: string;
  typeInference?: boolean;
}