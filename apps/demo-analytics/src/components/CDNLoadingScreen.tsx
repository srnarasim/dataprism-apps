import React from 'react';
import { Loader2, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { useDataPrism } from '@contexts/DataPrismCDNContext';

export function CDNLoadingScreen() {
  const {
    isLoadingDependencies,
    dependencyError,
    isInitializing,
    initializationError,
    isInitialized,
    retry,
    reloadDependencies,
  } = useDataPrism();

  // Show success state briefly before content loads
  if (isInitialized && !isLoadingDependencies && !isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">DataPrism Ready!</h1>
          <p className="text-gray-600">Launching analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (dependencyError || initializationError) {
    const error = dependencyError || initializationError;
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {dependencyError ? 'CDN Loading Failed' : 'Initialization Failed'}
          </h1>
          
          <p className="text-gray-600 mb-4">{error?.message}</p>
          
          <div className="space-y-3">
            <button
              onClick={retry}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Initialization
            </button>
            
            <button
              onClick={reloadDependencies}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Reload from CDN
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify GitHub Pages CDN is accessible</li>
              <li>• Try disabling browser extensions</li>
              <li>• Check browser console for detailed errors</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Main loading indicator */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        
        {/* Status text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DataPrism</h1>
        <p className="text-lg text-gray-600 mb-8">
          {isLoadingDependencies && 'Loading from CDN...'}
          {isInitializing && 'Initializing engine...'}
          {!isLoadingDependencies && !isInitializing && 'Starting up...'}
        </p>
        
        {/* Progress steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isLoadingDependencies 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {isLoadingDependencies ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </div>
              <span className="text-gray-700">Loading core dependencies</span>
            </div>
            {!isLoadingDependencies && (
              <span className="text-green-600 text-sm">✓</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isInitializing
                  ? 'bg-blue-600 text-white' 
                  : isLoadingDependencies
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {isInitializing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs">🚀</span>
                )}
              </div>
              <span className={`${
                isLoadingDependencies ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Initializing analytics engine
              </span>
            </div>
            {!isInitializing && !isLoadingDependencies && (
              <span className="text-green-600 text-sm">✓</span>
            )}
          </div>
        </div>
        
        {/* CDN info */}
        <div className="mt-8 p-4 bg-white rounded-lg border text-left">
          <h3 className="font-semibold text-gray-900 mb-2">CDN Loading</h3>
          <p className="text-sm text-gray-600 mb-2">
            Loading DataPrism from GitHub Pages CDN for the latest features and performance.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Core: srnarasim.github.io/dataprism-core</div>
            <div>Plugins: srnarasim.github.io/dataprism-plugins</div>
          </div>
        </div>
        
        {/* Tips */}
        <div className="mt-4 text-xs text-gray-500">
          First load may take a few seconds while downloading from CDN
        </div>
      </div>
    </div>
  );
}