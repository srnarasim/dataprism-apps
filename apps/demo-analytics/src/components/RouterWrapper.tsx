import React from 'react';
import { useLocation } from 'react-router-dom';

interface RouterWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouterWrapper({ children, fallback = null }: RouterWrapperProps) {
  try {
    // Test if router context is available
    const location = useLocation();
    console.log('[RouterWrapper] Router context available, location:', location.pathname);
    return <>{children}</>;
  } catch (error) {
    console.error('[RouterWrapper] Router context not available:', error);
    return fallback ? <>{fallback}</> : <div>Loading router context...</div>;
  }
}