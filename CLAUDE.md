# DataPrism Applications - Context Engineering Guide

## Project Overview
DataPrism Applications contains demo applications, documentation portal, plugin marketplace, and usage examples for the DataPrism ecosystem.

## Architecture Context
- **Demo Application**: React-based analytics demo showcasing capabilities
- **Documentation Portal**: VitePress-based unified documentation
- **Plugin Marketplace**: Registry and discovery for plugins
- **Examples**: Usage examples and tutorials

## Development Patterns
- Use React for interactive applications
- Follow responsive design principles
- Implement proper error boundaries
- Optimize for user experience and accessibility

## Testing Requirements
- React component testing
- E2E testing for user flows
- Documentation link validation
- Marketplace API testing

## Build Commands
```bash
# Build demo application
npm run build:demo

# Build documentation
npm run build:docs

# Build marketplace
npm run build:marketplace

# Run tests
npm run test:demo && npm run test:docs
```
