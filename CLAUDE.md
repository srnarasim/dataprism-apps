# DataPrism Apps - Context Engineering Guide

## Project Overview

DataPrism Apps serves as the documentation, examples, and demonstration platform for the DataPrism ecosystem. It provides comprehensive guides, interactive demos, and real-world usage patterns to help developers understand and implement DataPrism solutions effectively.

## Architecture Context

DataPrism Apps implements a documentation-as-code architecture with interactive demonstration capabilities:

### Core Architecture Patterns
- **Documentation-as-Code**: Structured documentation with live examples
- **React Demo Platform**: Interactive demonstrations of DataPrism capabilities
- **Progressive Examples**: From basic usage to advanced integration patterns
- **CDN Integration**: Seamless loading of DataPrism from CDN

### Application Components
- **Demo Analytics App**: Interactive React application showcasing DataPrism
- **Documentation Site**: Comprehensive guides and API reference
- **Plugin Gallery**: Visual showcase of available plugins
- **Code Playground**: Live, executable code examples

### Repository Structure
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

## Core Technologies

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **DataPrism Integration**: CDN-based loading with fallbacks
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Documentation**: Markdown with live code examples

## Development Principles

### Documentation-as-Code

- Live, executable code examples
- Progressive complexity from basic to advanced
- Interactive tutorials and guided learning
- Real-time performance demonstrations

### User Experience Focus

- Responsive design for all screen sizes
- Accessible interfaces following WCAG guidelines
- Progressive enhancement for various browser capabilities
- Graceful error handling and user feedback

### Performance Optimization

- Code splitting and lazy loading
- CDN optimization for fast global access
- Bundle size optimization
- Efficient DataPrism initialization patterns

### Developer Experience

- Clear, well-documented code examples
- Copy-paste ready implementations
- Multiple integration approaches (CDN, npm, local)
- Troubleshooting guides and common patterns

## Context Engineering Rules

### Demo Application Development

- Always use CDN-based DataPrism loading for production demos
- Implement proper loading states and error boundaries
- Follow React best practices for component organization
- Use TypeScript for type safety and better DX

### Documentation Standards

- Every API must have working code examples
- Include both simple and complex usage patterns
- Validate all code examples automatically
- Provide performance benchmarks where relevant

### Examples and Tutorials

- Start with minimal, focused examples
- Build complexity progressively
- Include error handling and edge cases
- Test all examples in isolation

## Common Patterns to Follow

### DataPrism CDN Integration

```typescript
// DataPrismCDNContext.tsx - Primary integration pattern
export const DataPrismCDNProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  
  useEffect(() => {
    async function initializeDataPrism() {
      try {
        await loadDataPrismFromCDN();
        
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

### Interactive Code Playground

```typescript
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

### Plugin Gallery Component

```typescript
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

## Build and Testing Context

```bash
# Development servers
npm run dev:demo              # Demo application with hot reload
npm run dev:docs              # Documentation site development

# Production builds
npm run build:demo             # Build demo application
npm run build:docs             # Build documentation site
npm run build:examples         # Process examples

# Testing
npm run test:unit              # Unit tests for components
npm run test:e2e               # End-to-end tests with Playwright
npm run test:docs              # Validate documentation links
npm run validate:examples      # Validate all code examples

# Deployment
npm run deploy                 # Deploy to GitHub Pages
```

## Vite Configuration Patterns

```typescript
// Optimized build configuration
export default defineConfig({
  base: import.meta.env.PROD ? '/dataprism-apps/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          dataprism: ['@dataprism/core', '@dataprism/plugins'],
          react: ['react', 'react-dom'],
          charts: ['d3', 'observable-plot']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@dataprism/core', '@dataprism/plugins']
  }
});
```

## Testing Strategy

### Component Testing
- React component unit tests with Vitest
- DataPrism integration testing
- Error boundary validation
- Performance metrics collection

### End-to-End Testing
- Complete user flows with Playwright
- Cross-browser compatibility testing
- Performance benchmarking
- Plugin loading and execution

### Documentation Testing
- Automated link validation
- Code example execution
- API documentation accuracy
- Tutorial completeness verification

## Performance Considerations

### Bundle Optimization
- Code splitting for lazy loading
- Tree shaking for minimal bundles
- CDN-optimized asset delivery
- Service worker for offline capability

### User Experience
- Progressive loading indicators
- Graceful degradation for slower connections
- Responsive design for all devices
- Accessibility compliance

## Communication Style

- Focus on practical examples and real-world usage patterns
- Provide both simple quick-start and comprehensive integration guides
- Emphasize best practices for performance and user experience
- Include troubleshooting sections for common issues
