import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  
  // Set base path for GitHub Pages deployment to /dataprism-apps/ironcalc/
  base: process.env.NODE_ENV === 'production' ? '/dataprism-apps/ironcalc/' : '/',

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@types": resolve(__dirname, "./src/types"),
      // Note: DataPrism dependencies are loaded from CDN at runtime
      // IronCalc plugin will be loaded via DataPrism plugin system
    },
  },

  // Required for WebAssembly and CDN loading
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    // Enhanced for WASM support
    fs: {
      allow: ['..']
    }
  },

  // Optimize deps - DataPrism packages loaded from CDN
  optimizeDeps: {
    include: [
      "react",
      "react-dom", 
      "react-router-dom",
      "react-window",
      "react-window-infinite-loader",
      "react-virtualized-auto-sizer",
      "@tanstack/react-query",
      "papaparse",
      "xlsx",
      "hotkeys-js"
    ],
  },

  // WebAssembly support for IronCalc
  assetsInclude: ['**/*.wasm'],

  build: {
    target: "es2020",
    sourcemap: true,
    rollupOptions: {
      // DataPrism dependencies are loaded from CDN at runtime
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          spreadsheet: [
            "react-window", 
            "react-window-infinite-loader",
            "react-virtualized-auto-sizer"
          ],
          fileHandling: ["papaparse", "xlsx", "react-dropzone"],
          ui: [
            "@tanstack/react-query",
            "lucide-react",
            "hotkeys-js"
          ],
        },
      },
    },
  },

  // Environment variables for the spreadsheet app
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __APP_NAME__: JSON.stringify("IronCalc Spreadsheet"),
  },
});