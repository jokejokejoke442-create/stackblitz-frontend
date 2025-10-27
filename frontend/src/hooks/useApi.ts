'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { ApiResponse } from '@/types';

interface UseRealApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseRealApiResult<T> {
  data: T | null;
  loading: boolean;
  error: any | null;
  refetch: () => void;
}

export const useApi = <T>(apiCall: () => Promise<ApiResponse<T>>): UseRealApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any | null>(null);
  const [retry, setRetry] = useState<number>(0);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    // Prevent refetching if we've already determined there's no data
    if (!shouldRefetch) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data ?? null);
        // If we got data, allow future refetches
        setShouldRefetch(true);
      } else {
        // Handle empty data as non-error case
        if (response.message && (response.message.startsWith('No') || response.message.includes('No data'))) {
          setData(null);
          // If there's no data, don't keep refetching
          setShouldRefetch(false);
        } else {
          setError(new Error(response.message || 'Failed to fetch data'));
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [retry, shouldRefetch]); // Removed apiCall from dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    // Allow refetching when explicitly requested
    setShouldRefetch(true);
    setRetry(prev => prev + 1);
  };

  return { data, loading, error, refetch };
};