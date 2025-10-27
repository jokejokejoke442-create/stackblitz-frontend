'use client';

import { useApi } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';

export const useTeachers = () => {
  const { data, loading, error, refetch } = useApi<any>(() => apiService.getTeachers({ limit: 100 }));

  // Normalize into a simple camelCase array the UI can consume
  const rawList = (data as any)?.teachers ?? (data as any) ?? [];
  const list = Array.isArray(rawList)
    ? rawList.map((t: any) => ({
        // Use teachers.id to match backend subjectController validation
        id: t.id || t.teacher_id || t.user_id || t.uuid,
        firstName: t.firstName || t.first_name || t.name?.split(' ')[0] || '',
        lastName: t.lastName || t.last_name || (t.name ? t.name.split(' ').slice(1).join(' ') : ''),
        email: t.email || t.user?.email || t.users?.email || '',
      }))
    : [];

  return {
    data: list,
    loading,
    error,
    refetch,
  };
};