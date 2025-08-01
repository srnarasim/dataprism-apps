import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { DataPrismProvider } from "./contexts/DataPrismCDNContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

import "./index.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (
          error instanceof Error &&
          "status" in error &&
          typeof error.status === "number" &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// CDN configuration for DataPrism dependencies
const cdnConfig = {
  coreBaseUrl: 'https://srnarasim.github.io/dataprism-core',
  pluginsBaseUrl: 'https://srnarasim.github.io/dataprism-plugins',
  timeout: 30000,
  retries: 3,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <BrowserRouter basename={import.meta.env.PROD ? "/dataprism-apps/demo-analytics" : ""}>
            <ErrorBoundary>
              <ThemeProvider>
                <DataPrismProvider cdnConfig={cdnConfig}>
                  <ErrorBoundary>
                    <App />
                  </ErrorBoundary>
                </DataPrismProvider>
              </ThemeProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
