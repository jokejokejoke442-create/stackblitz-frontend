import { create } from 'zustand';
import { studentService } from '@/services';
import {
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentFilters,
} from '@/types';

interface StudentStore {
  students: Student[];
  currentStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  filters: StudentFilters;
  total: number;

  // Actions
  fetchStudents: (filters?: StudentFilters) => Promise<void>;
  fetchStudent: (id: string) => Promise<void>;
  createStudent: (data: CreateStudentData) => Promise<void>;
  updateStudent: (id: string, data: UpdateStudentData) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  setFilters: (filters: StudentFilters) => void;
  clearCurrentStudent: () => void;
  clearError: () => void;
  bulkImport: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<any>;
  exportStudents: (filters?: StudentFilters) => Promise<void>;
  promoteStudents: (studentIds: string[], newClassId: string) => Promise<void>;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
  students: [],
  currentStudent: null,
  isLoading: false,
  error: null,
  filters: {},
  total: 0,

  fetchStudents: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentService.getStudents(filters);
      set({
        students: response.students,
        total: response.total,
        filters: { ...get().filters, ...filters },
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch students',
        isLoading: false,
      });
    }
  },

  fetchStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const student = await studentService.getStudent(id);
      set({ currentStudent: student, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch student',
        isLoading: false,
      });
    }
  },

  createStudent: async (data: CreateStudentData) => {
    set({ isLoading: true, error: null });
    try {
      const newStudent = await studentService.createStudent(data);
      set((state) => ({
        students: [...state.students, newStudent],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create student',
        isLoading: false,
      });
    }
  },

  updateStudent: async (id: string, data: UpdateStudentData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStudent = await studentService.updateStudent(id, data);
      set((state) => ({
        students: state.students.map((student) =>
          student.id === id ? updatedStudent : student
        ),
        currentStudent:
          state.currentStudent?.id === id
            ? updatedStudent
            : state.currentStudent,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update student',
        isLoading: false,
      });
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.deleteStudent(id);
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        total: state.total - 1,
        currentStudent:
          state.currentStudent?.id === id ? null : state.currentStudent,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete student',
        isLoading: false,
      });
    }
  },

  setFilters: (filters: StudentFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearCurrentStudent: () => {
    set({ currentStudent: null });
  },

  clearError: () => {
    set({ error: null });
  },

  bulkImport: async (file: File, onProgress?: (progress: number) => void) => {
    set({ isLoading: true, error: null });
    try {
      const result = await studentService.bulkImport(file, onProgress);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to import students',
        isLoading: false,
      });
      throw error;
    }
  },

  exportStudents: async (filters?: StudentFilters) => {
    try {
      await studentService.exportStudents(filters || get().filters);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to export students',
      });
    }
  },

  promoteStudents: async (studentIds: string[], newClassId: string) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.promoteStudents({ studentIds, newClassId });
      // Refresh the students list
      await get().fetchStudents(get().filters);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to promote students',
        isLoading: false,
      });
    }
  },
}));
