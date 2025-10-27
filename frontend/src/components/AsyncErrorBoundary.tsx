'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback,
  loadingFallback
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate async initialization
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return loadingFallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

export default AsyncErrorBoundary;