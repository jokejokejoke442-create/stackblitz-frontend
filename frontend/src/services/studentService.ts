import { apiClient } from './apiClient';
import {
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentFilters,
  BulkImportResult,
} from '@/types';

export const studentService = {
  // Get all students with filters
  async getStudents(
    filters: StudentFilters = {}
  ): Promise<{ students: Student[]; total: number }> {
    const response = await apiClient.get<{
      students: Student[];
      total: number;
    }>('/students', { params: filters });
    return response.data!;
  },

  // Get student by ID
  async getStudent(id: string): Promise<Student> {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data!;
  },

  // Create new student
  async createStudent(data: CreateStudentData): Promise<Student> {
    const response = await apiClient.post<Student>('/students', data);
    return response.data!;
  },

  // Update student
  async updateStudent(id: string, data: UpdateStudentData): Promise<Student> {
    const response = await apiClient.put<Student>(`/students/${id}`, data);
    return response.data!;
  },

  // Delete student (soft delete)
  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },

  // Get student's academic history
  async getAcademicHistory(studentId: string): Promise<any> {
    const response = await apiClient.get(
      `/students/${studentId}/academic-history`
    );
    return response.data!;
  },

  // Get student's attendance records
  async getStudentAttendance(studentId: string, filters?: any): Promise<any> {
    const response = await apiClient.get(`/students/${studentId}/attendance`, {
      params: filters,
    });
    return response.data!;
  },

  // Get student's grades
  async getStudentGrades(studentId: string, filters?: any): Promise<any> {
    const response = await apiClient.get(`/students/${studentId}/grades`, {
      params: filters,
    });
    return response.data!;
  },

  // Get student's invoices
  async getStudentInvoices(studentId: string, filters?: any): Promise<any> {
    const response = await apiClient.get(`/students/${studentId}/invoices`, {
      params: filters,
    });
    return response.data!;
  },

  // Bulk import students
  async bulkImport(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<BulkImportResult> {
    const response = await apiClient.upload<BulkImportResult>(
      '/students/bulk-import',
      file,
      onProgress
    );
    return response.data!;
  },

  // Export students
  async exportStudents(filters: StudentFilters = {}): Promise<void> {
    await apiClient.download('/students/export', 'students.xlsx');
  },

  // Promote students to next grade
  async promoteStudents(data: {
    studentIds: string[];
    newClassId: string;
  }): Promise<void> {
    await apiClient.post('/students/promote', data);
  },

  // Get student statistics
  async getStudentStatistics(filters?: any): Promise<any> {
    const response = await apiClient.get('/students/statistics', {
      params: filters,
    });
    return response.data!;
  },
};
