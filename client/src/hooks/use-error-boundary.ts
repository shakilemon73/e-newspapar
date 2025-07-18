import { useState, useCallback } from 'react';

export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    console.error('Error captured by boundary:', error);
    setError(error);
  }, []);

  return {
    error,
    resetError,
    captureError,
    hasError: !!error
  };
};

export default useErrorBoundary;