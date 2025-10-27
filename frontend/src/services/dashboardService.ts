import { ReactNode } from 'react';
import { apiClient } from './apiClient';

export interface DashboardStats {
  studentChange: number;
  teacherChange: number;
  totalClasses: any;
  classChange: number;
  monthlyRevenue: any;
  revenueChange: number;
  totalStudents: number;
  totalTeachers: number;
  revenue: number;
  pendingTasks: number;
  studentsGrowth: string;
  teachersGrowth: string;
  revenueGrowth: string;
}

export interface Activity {
  title: ReactNode;
  description: ReactNode;
  time: ReactNode;
  id: string;
  type: 'registration' | 'payment' | 'assignment' | 'general';
  message: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface TeacherStats {
  myClasses: number;
  totalStudents: number;
  todayClasses: number;
  completedClasses: number;
  pendingGrades: number;
}

export interface ParentStats {
  children: number;
  pendingFees: number;
  unreadMessages: number;
}

export interface StudentStats {
  attendance: number;
  averageGrade: string;
  completedAssignments: number;
  totalAssignments: number;
  classRank: number;
  totalClassmates: number;
}

export const dashboardService = {
  // Get admin dashboard stats
  async getAdminStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/admin-stats');
    return response.data!;
  },

  // Get recent activities
  async getRecentActivities(): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>('/dashboard/activities');
    return response.data!;
  },

  // Get teacher dashboard stats
  async getTeacherStats(): Promise<TeacherStats> {
    const response = await apiClient.get<TeacherStats>('/dashboard/teacher-stats');
    return response.data!;
  },

  // Get parent dashboard stats
  async getParentStats(): Promise<ParentStats> {
    const response = await apiClient.get<ParentStats>('/dashboard/parent-stats');
    return response.data!;
  },

  // Get student dashboard stats
  async getStudentStats(): Promise<StudentStats> {
    const response = await apiClient.get<StudentStats>('/dashboard/student-stats');
    return response.data!;
  },
};