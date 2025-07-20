# DataPrism Apps Architecture

## Overview

DataPrism Apps serves as the documentation, examples, and demonstration platform for the DataPrism ecosystem. It provides comprehensive guides, interactive demos, and real-world usage patterns to help developers understand and implement DataPrism solutions effectively.

## Repository Structure

```
dataprism-apps/
├── apps/
│   ├── demo-analytics/         # Interactive demo application
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── contexts/       # DataPrism integration contexts
│   │   │   ├── pages/          # Demo application pages
│   │   │   └── utils/          # Utility functions
│   │   ├── public/             # Static assets and WASM files
│   │   └── dist/               # Build output
│   └── docs/                   # Documentation site
│       ├── api/                # API reference documentation
│       ├── guide/              # User guides and tutorials
│       ├── examples/           # Code examples
│       └── plugins/            # Plugin documentation
├── examples/                   # Standalone examples
│   └── basic-usage.html        # Simple HTML examples
├── tests/                      # End-to-end and integration tests
└── scripts/                    # Build and validation scripts
```

## Core Architecture Patterns

### 1. Documentation-as-Code Architecture

#### **Structured Documentation Approach**
```markdown
docs/
├── api/                    # API Reference
│   ├── core.md            # DataPrism Core API
│   ├── orchestration.md   # Orchestration layer API
│   └── plugins.md         # Plugin framework API
├── guide/                 # User Guides
│   ├── getting-started.md # Quick start guide
│   ├── architecture.md    # Architecture overview
│   ├── performance.md     # Performance optimization
│   └── troubleshooting.md # Common issues and solutions
├── examples/              # Code Examples
│   ├── basic.md          # Basic usage patterns
│   ├── advanced.md       # Advanced patterns
│   └── plugins.md        # Plugin development examples
└── plugins/               # Plugin Documentation
    ├── out-of-box/        # Pre-built plugin docs
    ├── development.md     # Plugin development guide
    └── api.md            # Plugin API reference
```

#### **Live Documentation Patterns**
- **Interactive Examples**: Code examples that can be executed in-browser
- **API Playground**: Live API testing interface
- **Performance Benchmarks**: Real-time performance demonstrations
- **Plugin Gallery**: Visual showcase of available plugins

### 2. Demo Application Architecture

#### **React-Based Demonstration Platform**
```typescript
// Main application structure
src/
├── components/
│   ├── CDNLoadingScreen.tsx      # CDN loading visualization
│   ├── ErrorBoundary.tsx        # Error handling component
│   └── Layout.tsx               # Application layout
├── contexts/
│   ├── DataPrismCDNContext.tsx  # CDN-based DataPrism integration
│   ├── DataPrismContext.tsx     # Standard DataPrism integration
│   └── ThemeContext.tsx         # UI theme management
├── pages/
│   ├── HomePage.tsx             # Landing page
│   ├── DataExplorerPage.tsx     # Data exploration demo
│   ├── QueryLabPage.tsx         # SQL query interface
│   ├── VisualizationPage.tsx    # Data visualization demos
│   └── PluginsDemoPage.tsx      # Plugin showcase
└── utils/
    ├── cdn-loader.ts            # CDN loading utilities
    └── cn.ts                    # CSS class utilities
```

#### **DataPrism Integration Patterns**

**CDN-Based Loading** (Primary Pattern):
```typescript
// DataPrismCDNContext.tsx
export const DataPrismCDNProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  
  useEffect(() => {
    async function initializeDataPrism() {
      try {
        // Load dependencies from CDN
        await loadDataPrismFromCDN();
        
        // Initialize engine with demo configuration
        const engineInstance = new DataPrismEngine({
          maxMemoryMB: 512,
          enableWasmOptimizations: true,
          queryTimeoutMs: 30000,
          logLevel: import.meta.env.DEV ? "debug" : "info",
        });
        
        await engineInstance.initialize();
        setEngine(engineInstance);
        setLoadingState('ready');
      } catch (error) {
        setLoadingState('error');
        console.error('DataPrism initialization failed:', error);
      }
    }
    
    initializeDataPrism();
  }, []);
  
  return (
    <DataPrismContext.Provider value={{ engine, loadingState }}>
      {children}
    </DataPrismContext.Provider>
  );
};
```

**Local Development Pattern**:
```typescript
// DataPrismContext.tsx - for development with local builds
export const DataPrismProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Similar structure but loads from local builds
  // Used during development and testing
};
```

### 3. Example and Tutorial Patterns

#### **Progressive Complexity Structure**
```typescript
// Basic usage example
const basicExample = {
  title: "Simple Query Execution",
  code: `
    import { DataPrismEngine } from 'https://srnarasim.github.io/dataprism-core/dataprism-core.min.js';
    
    const engine = new DataPrismEngine();
    await engine.initialize();
    
    const result = await engine.query('SELECT * FROM data LIMIT 10');
    console.log(result.data);
  `,
  description: "Execute a simple SQL query using DataPrism Core"
};

// Advanced usage example
const advancedExample = {
  title: "Plugin Integration with Custom Processing",
  code: `
    // Load and configure plugins
    const csvPlugin = await engine.loadPlugin('csv-processor');
    const chartPlugin = await engine.loadPlugin('observable-charts');
    
    // Process data through plugin pipeline
    const rawData = await csvPlugin.import(csvFile);
    const processedData = await csvPlugin.process(rawData);
    const visualization = await chartPlugin.render(processedData, {
      type: 'scatter',
      x: 'value1',
      y: 'value2'
    });
  `,
  description: "Demonstrate plugin integration and data processing pipeline"
};
```

#### **Interactive Tutorial Components**
```typescript
// Interactive code playground
interface CodePlaygroundProps {
  initialCode: string;
  title: string;
  description: string;
  expectedOutput?: any;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode,
  title,
  description,
  expectedOutput
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const executeCode = async () => {
    setIsRunning(true);
    try {
      // Execute code in sandbox environment
      const result = await sandboxedExecution(code);
      setOutput(result);
    } catch (error) {
      setOutput({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="code-playground">
      <CodeEditor value={code} onChange={setCode} />
      <button onClick={executeCode} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Execute'}
      </button>
      <OutputDisplay output={output} expected={expectedOutput} />
    </div>
  );
};
```

### 4. Performance Demonstration Patterns

#### **Benchmark Visualization Components**
```typescript
// Performance benchmark display
interface BenchmarkDisplayProps {
  benchmarks: PerformanceBenchmark[];
  realTime?: boolean;
}

export const BenchmarkDisplay: React.FC<BenchmarkDisplayProps> = ({
  benchmarks,
  realTime = false
}) => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  
  useEffect(() => {
    if (realTime) {
      const interval = setInterval(() => {
        runBenchmarks(benchmarks).then(setResults);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [benchmarks, realTime]);
  
  return (
    <div className="benchmark-display">
      {results.map(result => (
        <BenchmarkCard
          key={result.name}
          name={result.name}
          duration={result.duration}
          memoryUsage={result.memoryUsage}
          target={result.target}
          status={result.status}
        />
      ))}
    </div>
  );
};
```

#### **Real-Time Metrics Collection**
```typescript
// Performance monitoring hook
export const usePerformanceMetrics = (engine: DataPrismEngine | null) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    if (!engine) return;
    
    const updateMetrics = () => {
      const currentMetrics = engine.getMetrics();
      setMetrics(currentMetrics);
    };
    
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [engine]);
  
  return metrics;
};
```

### 5. Plugin Documentation Patterns

#### **Plugin Gallery Structure**
```typescript
// Plugin showcase component
interface PluginGalleryProps {
  category?: 'processing' | 'visualization' | 'integration' | 'utility';
  featured?: boolean;
}

export const PluginGallery: React.FC<PluginGalleryProps> = ({
  category,
  featured = false
}) => {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  
  useEffect(() => {
    loadPluginRegistry()
      .then(registry => {
        let filteredPlugins = registry.plugins;
        
        if (category) {
          filteredPlugins = filteredPlugins.filter(p => p.category === category);
        }
        
        if (featured) {
          filteredPlugins = filteredPlugins.filter(p => p.featured);
        }
        
        setPlugins(filteredPlugins);
      });
  }, [category, featured]);
  
  return (
    <div className="plugin-gallery">
      {plugins.map(plugin => (
        <PluginCard
          key={plugin.name}
          plugin={plugin}
          onInstall={() => installPlugin(plugin)}
          onDemo={() => openPluginDemo(plugin)}
        />
      ))}
    </div>
  );
};
```

#### **Interactive Plugin Demos**
```typescript
// Plugin demonstration component
interface PluginDemoProps {
  pluginName: string;
  demoConfig: PluginDemoConfig;
}

export const PluginDemo: React.FC<PluginDemoProps> = ({
  pluginName,
  demoConfig
}) => {
  const { engine } = useDataPrism();
  const [plugin, setPlugin] = useState<IPlugin | null>(null);
  const [demoState, setDemoState] = useState<DemoState>('loading');
  
  useEffect(() => {
    async function loadPlugin() {
      if (!engine) return;
      
      try {
        const loadedPlugin = await engine.loadPlugin(pluginName);
        setPlugin(loadedPlugin);
        setDemoState('ready');
      } catch (error) {
        setDemoState('error');
        console.error(`Failed to load plugin ${pluginName}:`, error);
      }
    }
    
    loadPlugin();
  }, [engine, pluginName]);
  
  if (demoState === 'loading') return <LoadingSpinner />;
  if (demoState === 'error') return <ErrorMessage />;
  
  return (
    <div className="plugin-demo">
      <PluginInterface plugin={plugin} config={demoConfig} />
      <PluginOutput plugin={plugin} />
      <PluginMetrics plugin={plugin} />
    </div>
  );
};
```

### 6. Build and Deployment Patterns

#### **Multi-Target Build Strategy**
```typescript
// Vite configuration for demo application
export default defineConfig({
  base: import.meta.env.PROD ? '/dataprism-apps/demo/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate DataPrism code for better caching
          dataprism: ['@dataprism/core', '@dataprism/plugins'],
          // UI framework chunks
          react: ['react', 'react-dom'],
          // Chart libraries
          charts: ['d3', 'observable-plot']
        }
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle heavy dependencies
    include: ['@dataprism/core', '@dataprism/plugins']
  }
});
```

#### **Documentation Site Generation**
```typescript
// Documentation build pipeline
export const buildDocs = async () => {
  // Generate API documentation from TypeScript definitions
  const apiDocs = await generateAPIDocumentation([
    'packages/core/src/types.ts',
    'packages/plugins/src/interfaces/'
  ]);
  
  // Process markdown files with live examples
  const guides = await processGuideMarkdown('docs/guide/');
  
  // Generate plugin documentation from manifests
  const pluginDocs = await generatePluginDocs('plugins/');
  
  // Build complete documentation site
  await buildDocumentationSite({
    api: apiDocs,
    guides: guides,
    plugins: pluginDocs,
    examples: await processExamples('examples/')
  });
};
```

### 7. Testing and Validation Patterns

#### **End-to-End Testing Strategy**
```typescript
// Playwright tests for demo application
describe('DataPrism Demo Application', () => {
  test('should load and initialize DataPrism engine', async ({ page }) => {
    await page.goto('/');
    
    // Wait for DataPrism to initialize
    await page.waitForSelector('[data-testid="engine-ready"]');
    
    // Verify engine status
    const status = await page.textContent('[data-testid="engine-status"]');
    expect(status).toBe('Ready');
  });
  
  test('should execute queries and display results', async ({ page }) => {
    await page.goto('/query-lab');
    
    // Enter SQL query
    await page.fill('[data-testid="sql-input"]', 'SELECT 1 as test');
    await page.click('[data-testid="execute-button"]');
    
    // Verify results
    await page.waitForSelector('[data-testid="query-results"]');
    const results = await page.textContent('[data-testid="query-results"]');
    expect(results).toContain('test: 1');
  });
  
  test('should load and demonstrate plugins', async ({ page }) => {
    await page.goto('/plugins');
    
    // Load CSV processor plugin
    await page.click('[data-testid="load-csv-plugin"]');
    await page.waitForSelector('[data-testid="csv-plugin-loaded"]');
    
    // Upload test file and process
    await page.setInputFiles('[data-testid="file-input"]', 'test-data.csv');
    await page.click('[data-testid="process-button"]');
    
    // Verify processing results
    await page.waitForSelector('[data-testid="processing-complete"]');
  });
});
```

#### **Documentation Validation**
```typescript
// Validate documentation examples
export const validateDocumentationExamples = async () => {
  const exampleFiles = await glob('docs/**/*.md');
  const errors: ValidationError[] = [];
  
  for (const file of exampleFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const codeBlocks = extractCodeBlocks(content);
    
    for (const block of codeBlocks) {
      if (block.language === 'javascript' || block.language === 'typescript') {
        try {
          await validateCodeExample(block.code);
        } catch (error) {
          errors.push({
            file,
            line: block.line,
            error: error.message
          });
        }
      }
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Documentation validation failed: ${errors.length} errors found`);
  }
};
```

## Future Architecture Considerations

### 1. Interactive Learning Platform
- Guided tutorials with step-by-step progression
- Interactive coding challenges and exercises
- Real-time collaboration features for learning
- Progress tracking and certification system

### 2. Community Integration
- User-generated examples and tutorials
- Plugin marketplace with ratings and reviews
- Community support forums integration
- Contribution guidelines and review processes

### 3. Advanced Demonstration Capabilities
- WebRTC-based real-time collaboration demos
- Cloud integration for large-scale data processing
- Mobile-responsive demonstrations
- Accessibility features for inclusive documentation

This architecture provides a comprehensive platform for showcasing DataPrism capabilities while serving as an educational resource for developers at all skill levels.