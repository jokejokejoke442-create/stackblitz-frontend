'use client';

import { useApi } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';

export const useSubjects = () => {
  const { data, loading, error, refetch } = useApi<any[]>(() => apiService.getSubjects());

  return {
    data: data || [],
    loading,
    error,
    refetch
  };
};