# MCP Analytics Workflow

A sophisticated React-based analytics workflow application that demonstrates the DataPrism framework with MCP (Model Context Protocol) integration. This application provides an interactive interface for executing data analysis workflows with real-time visualization using React Flow.

![MCP Analytics Workflow](https://img.shields.io/badge/Version-3.0-blue) ![React](https://img.shields.io/badge/React-19.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-7.0-green)

## 🌟 Features

### Core Functionality
- **Interactive Workflow Execution**: Complete data analysis workflows with step-by-step execution
- **Professional React Flow Visualization**: Modern, interactive workflow diagrams with curved edges and real-time status updates
- **CSV Data Processing**: Upload and process CSV files with real-time progress tracking
- **AI-Powered Insights**: Generate intelligent insights from your data using LLM integration
- **Comprehensive Reporting**: Detailed workflow reports with export functionality
- **Performance Monitoring**: Built-in asset loading and performance tracking

### User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Status Updates**: Live workflow progress with visual indicators
- **Interactive Documentation**: Built-in technical documentation explaining the architecture
- **Audit Logging**: Complete audit trail of workflow executions
- **Dark/Light Theme Support**: Automatic theme adaptation

### Technical Features
- **DataPrism Framework Integration**: Hybrid WebAssembly + TypeScript architecture
- **MCP Protocol Support**: Model Context Protocol for LLM integration
- **CDN-Optimized Loading**: Fast asset delivery with fallback mechanisms
- **Modern React Patterns**: Hooks, Context API, and TypeScript throughout
- **Comprehensive Testing**: Unit tests with Vitest and E2E tests with Playwright

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dataprism-apps.git
   cd dataprism-apps/apps/mcp-analytics-workflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3001
   ```

### Using the Application

1. **Upload Data**: Click "📊 Choose CSV File" or download the sample CSV to get started
2. **Start Workflow**: Click "🚀 Start New Workflow" to begin analysis
3. **Monitor Progress**: Watch the React Flow visualization show real-time progress
4. **View Results**: Access detailed reports and insights after completion
5. **Export Data**: Download workflow reports in JSON format

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19.1 + TypeScript 5.8
- **Build Tool**: Vite 7.0 with optimized bundling
- **Styling**: Tailwind CSS v4 with CSS-first configuration
- **Visualization**: React Flow for interactive workflow diagrams
- **Data Processing**: Apache Arrow + DuckDB integration
- **Testing**: Vitest (unit) + Playwright (E2E)

### Project Structure
```
src/
├── components/           # React components
│   ├── workflow/        # Workflow-specific components
│   └── documentation/   # Technical documentation
├── contexts/            # React Context providers
├── utils/              # Utility functions and CDN loading
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── test/               # Test files
    ├── components/     # Component tests
    ├── contexts/       # Context tests
    ├── utils/         # Utility tests
    └── e2e/           # End-to-end tests
```

### DataPrism Integration
The application showcases the DataPrism framework's capabilities:

- **Hybrid Architecture**: Rust WebAssembly core with TypeScript orchestration
- **CDN Loading**: Optimized asset delivery with health monitoring
- **Performance Targets**: <2s query response, <6MB WASM modules, <5s initialization
- **Plugin Ecosystem**: Extensible architecture for data processing plugins

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:ui
```

### Integration Tests
```bash
# Run Playwright E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- workflow-execution.spec.ts
```

### Performance Tests
The application includes comprehensive performance tests covering:
- Application load times (<15s)
- Workflow execution performance (<60s)
- Memory usage stability
- UI responsiveness during operations

## 📦 Building and Deployment

### Development Build
```bash
npm run build
```

### Production Deployment
The application is configured for GitHub Pages deployment with automated CI/CD:

```bash
# Preview production build
npm run preview

# Deploy to GitHub Pages (automated via GitHub Actions)
git push origin main
```

### CI/CD Pipeline
- **Automated Testing**: Unit and E2E tests on every PR
- **Code Quality**: ESLint, TypeScript checking, security audits
- **Performance Monitoring**: Lighthouse CI integration
- **Dependency Management**: Automated dependency updates via Dependabot

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:
```env
VITE_DATAPRISM_CDN_BASE_URL=https://your-cdn-url.com
VITE_MCP_SERVER_URL=ws://localhost:8080
VITE_OPENAI_API_KEY=your-api-key-here
```

### Vite Configuration
The application uses optimized Vite configuration with:
- Code splitting for optimal loading
- CDN optimization for DataPrism assets
- Tree shaking for minimal bundle sizes
- Source maps for debugging

### Tailwind CSS
Using Tailwind CSS v4 with CSS-first configuration:
```css
@import "tailwindcss";
@theme {
  --color-primary: #1976d2;
  --animate-pulse-slow: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test && npm run test:e2e`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Create a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive type safety
- **ESLint**: Enforced code style and best practices
- **Testing**: Minimum 80% code coverage required
- **Documentation**: All public APIs must be documented

### Commit Convention
```
feat: add new workflow visualization
fix: resolve CSV parsing edge case
docs: update API documentation
test: add integration tests for workflow execution
```

## 📊 Performance Benchmarks

### Target Metrics
- **Initial Load**: <5 seconds (CDN-optimized)
- **Workflow Execution**: <60 seconds for typical datasets
- **Memory Usage**: <4GB for 1M row datasets
- **Bundle Size**: <6MB total (code-split)

### Browser Compatibility
- Chrome 90+ ✅
- Firefox 88+ ✅  
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Chrome/Safari ✅

## 🐛 Troubleshooting

### Common Issues

**Issue**: Application fails to load with WASM errors
```
Solution: Ensure your server supports WASM mime types and CORS headers
```

**Issue**: CSV upload fails
```
Solution: Check file size (<10MB) and format (valid CSV with headers)
```

**Issue**: Workflow gets stuck in "running" state
```
Solution: Check browser console for errors and refresh the application
```

### Performance Issues
If the application is running slowly:
1. Check Network tab for failed CDN requests
2. Verify adequate memory (>4GB recommended)
3. Try refreshing to clear any cached states
4. Check the audit log for detailed execution information

## 📚 Documentation

### Architecture Deep Dive
The application demonstrates advanced patterns:
- **React Flow Integration**: Professional workflow visualization
- **WebAssembly Performance**: Hybrid Rust/TypeScript architecture
- **Real-time Updates**: Efficient state management with React hooks
- **Error Boundaries**: Comprehensive error handling and recovery

### API Reference
Key components and their APIs:

- `DataPrismMCPProvider`: Main context provider for DataPrism integration
- `ReactFlowVisualizer`: Interactive workflow diagram component
- `WorkflowReport`: Comprehensive reporting with export functionality
- `CDNAssetLoader`: Optimized asset loading with fallback mechanisms

## 🔗 Related Projects

- [DataPrism Core](https://github.com/dataprism-ai/dataprism-core) - The underlying WebAssembly engine
- [DataPrism Plugins](https://github.com/dataprism-ai/dataprism-plugins) - Plugin ecosystem
- [MCP Specification](https://github.com/modelcontextprotocol/specification) - Model Context Protocol

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DataPrism Team** for the amazing WebAssembly framework
- **React Flow Team** for the excellent visualization library  
- **Tailwind CSS** for the utility-first CSS framework
- **Vite Team** for the lightning-fast build tool

---

**Built with ❤️ using DataPrism, React, and modern web technologies**

For more information, visit our [documentation site](https://dataprism.ai/docs) or join our [community Discord](https://discord.gg/dataprism).
