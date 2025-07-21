import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  
  // Set base path for GitHub Pages deployment to /dataprism-apps/demo-analytics/
  base: process.env.NODE_ENV === 'production' ? '/dataprism-apps/demo-analytics/' : '/',

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      // Note: DataPrism dependencies are now loaded from CDN at runtime
      // No local aliases needed - see src/utils/cdn-loader.ts
    },
  },

  // Required for WebAssembly and CDN loading
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    // No longer need local file system access - using CDN
  },

  // Optimize deps - DataPrism packages loaded from CDN
  optimizeDeps: {
    include: [
      "react",
      "react-dom", 
      "react-router-dom",
      "@tanstack/react-query",
      "@tanstack/react-table",
    ],
  },

  // WebAssembly support
  assetsInclude: ['**/*.wasm'],

  build: {
    target: "es2020",
    sourcemap: true,
    rollupOptions: {
      // DataPrism dependencies are loaded from CDN at runtime
      // No external dependencies needed in build
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["d3", "chart.js", "react-chartjs-2", "recharts"],
          ui: [
            "@tanstack/react-query",
            "@tanstack/react-table",
            "lucide-react",
          ],
        },
      },
    },
  },

  // Environment variables for the demo
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
