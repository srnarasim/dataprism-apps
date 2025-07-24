/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dataprism-apps/mcp-analytics-workflow/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'workflow-engine': ['./src/contexts/DataPrismMCPContext'],
          'visualization': ['./src/components/workflow/WorkflowVisualizer'],
          'd3-libs': ['d3']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['d3', 'react', 'react-dom']
  },
  server: {
    port: 3001,
    open: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'dist/',
        'coverage/'
      ]
    }
  }
})
