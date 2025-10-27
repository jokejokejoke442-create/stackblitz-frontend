'use client';

import { useApi } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';
import type { Class } from '@/types/academic';

export const useClasses = () => {
  const { data, loading, error, refetch } = useApi<Class[]>(() => apiService.getClasses());

  return {
    data: data || [],
    loading,
    error,
    refetch
  };
};