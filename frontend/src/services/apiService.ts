import { apiClient } from "./apiClient"
import type { Student, Teacher, Class, ApiResponse } from "@/types"

/**
 * Type definition for creating a new student
 */
export type CreateStudentData = {
  name: string
  email: string
  dateOfBirth: string // ISO date string
  address?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  // Add other required fields for student creation
}

/**
 * Helper function to handle empty data responses consistently
 */
const handleEmptyData = async <T>(promise: Promise<ApiResponse<T>>, emptyMessage: string): Promise<ApiResponse<T>> => {
  try {
    const response = await promise
    return response
  } catch (error: any) {
    // Return empty array/object for empty data cases, not errors
    const lowerMessage = error.message?.toLowerCase() || '';
    if (lowerMessage.includes('no data') ||
        lowerMessage.includes('no classes') ||
        lowerMessage.includes('no attendance') ||
        lowerMessage.includes('no grades') ||
        lowerMessage.includes('no notifications') ||
        lowerMessage.includes('no payments') ||
        lowerMessage.includes('no invoices') ||
        lowerMessage.includes('no messages') ||
        lowerMessage.includes('no conversations') ||
        lowerMessage.includes('no subjects') ||
        lowerMessage.includes('no students') ||
        lowerMessage.includes('no teachers') ||
        (lowerMessage.startsWith('no ') && lowerMessage.includes('found'))) {
      return {
        success: true,
        message: emptyMessage,
        data: { students: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10, hasNext: false, hasPrev: false } } as any
      }
    }
    throw error
  }
}

export class ApiService {
  // Students API
  async getStudents(params?: {
    page?: number
    limit?: number
    search?: string
    classId?: string
  }): Promise<ApiResponse<{students: Student[], pagination: any}>> {
    return handleEmptyData(
      apiClient.get("/students", params),
      'No students found'
    )
  }

  async getStudent(id: string): Promise<ApiResponse<Student>> {
    return apiClient.get(`/students/${id}`)
  }

  async createStudent(data: CreateStudentData): Promise<ApiResponse<Student>> {
    return apiClient.post("/students", data)
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
    return apiClient.put(`/students/${id}`, data)
  }

  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/students/${id}`)
  }

  // Teachers API
  async getTeachers(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<{teachers: Teacher[], pagination: any}>> {
    return handleEmptyData(
      apiClient.get("/teachers", params),
      'No teachers found'
    )
  }

  async getTeacher(id: string): Promise<ApiResponse<Teacher>> {
    return apiClient.get(`/teachers/${id}`)
  }

  async createTeacher(data: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    return apiClient.post("/teachers", data)
  }

  async updateTeacher(id: string, data: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    return apiClient.put(`/teachers/${id}`, data)
  }

  async deleteTeacher(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/teachers/${id}`)
  }

  // Classes API
  async getClasses(): Promise<ApiResponse<any[]>> {
    return handleEmptyData(
      apiClient.get("/classes"),
      'No classes found'
    )
  }

  async getClass(id: string): Promise<ApiResponse<Class>> {
    return apiClient.get(`/classes/${id}`)
  }

  async createClass(data: Partial<Class>): Promise<ApiResponse<Class>> {
    return apiClient.post("/classes", data)
  }

  async updateClass(id: string, data: Partial<Class>): Promise<ApiResponse<Class>> {
    return apiClient.put(`/classes/${id}`, data)
  }

  async deleteClass(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/classes/${id}`)
  }

  async getSubjects(params?: { grade?: string }): Promise<ApiResponse<any[]>> {
    return handleEmptyData(
      apiClient.get("/subjects", params),
      'No subjects found'
    )
  }

  async getSubject(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/subjects/${id}`)
  }

  async createSubject(data: any): Promise<ApiResponse<any>> {
    return apiClient.post("/subjects", data)
  }

  async updateSubject(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/subjects/${id}`, data)
  }

  async deleteSubject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/subjects/${id}`)
  }

  // Dashboard API
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return apiClient.get("/dashboard/stats")
  }

  // Authentication API
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    return apiClient.post("/auth/login", credentials)
  }

  async register(data: any): Promise<ApiResponse<any>> {
    return apiClient.post("/auth/register", data)
  }

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post("/auth/logout")
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.get("/auth/me")
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.put("/auth/profile", data)
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return apiClient.post("/auth/change-password", data)
  }

  // Attendance API
  async getAttendance(params?: {
    date?: string
    classId?: string
  }): Promise<ApiResponse<{attendance: any[], pagination: any}>> {
    if (params?.date && params?.classId) {
      const encodedClassId = encodeURIComponent(params.classId);
      const encodedDate = encodeURIComponent(params.date);
      return handleEmptyData(
        apiClient.get(`/attendance/class/${encodedClassId}/date/${encodedDate}`),
        'No attendance records found'
      );
    }
    
    return handleEmptyData(
      apiClient.get("/attendance", params),
      'No attendance records found'
    );
  }

  async testClasses(): Promise<ApiResponse<any[]>> {
    return apiClient.get("/attendance/test-classes");
  }

  async markAttendance(data: {
    studentId: string
    date: string
    status: "present" | "absent" | "late"
  }): Promise<ApiResponse<any>> {
    return apiClient.post("/attendance", data)
  }

  async saveAttendanceBatch(data: {
    date: string
    classId: string
    attendance: Array<{ studentId: string; status: string }>
  }): Promise<ApiResponse<any>> {
    return apiClient.post("/attendance/batch", data)
  }

  // Grades API
  async getGrades(params?: {
    studentId?: string
    classId?: string
    subjectId?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{grades: any[], pagination: any}>> {
    return handleEmptyData(
      apiClient.get("/grades", params),
      'No grades found'
    )
  }

  async createGrade(data: {
    studentId: string
    subjectId: string
    classId: string
    score: number
    maxScore: number
    type: string
  }): Promise<ApiResponse<any>> {
    return apiClient.post("/grades", data)
  }

  async updateGrade(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/grades/${id}`, data)
  }

  async deleteGrade(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/grades/${id}`)
  }

  // Notifications API
  async getNotifications(): Promise<ApiResponse<{notifications: any[], pagination: any}>> {
    return handleEmptyData(
      apiClient.get("/notifications"),
      'No notifications found'
    )
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`/notifications/${id}/read`)
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notifications/${id}`)
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    return handleEmptyData(
      apiClient.get("/messages/conversations"),
      'No conversations found'
    )
  }

  async getMessages(participantId: string): Promise<ApiResponse<any[]>> {
    return handleEmptyData(
      apiClient.get(`/messages/${participantId}`),
      'No messages found'
    )
  }

  async sendMessage(recipientId: string, content: string): Promise<ApiResponse<any>> {
    return apiClient.post('/messages', { recipientId, content })
  }

  async getPayments(params?: { status?: string; search?: string }): Promise<ApiResponse<{payments: any[], pagination: any}>> {
    return handleEmptyData(
      apiClient.get("/payments", params),
      'No payments found'
    )
  }

  async getPayment(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/payments/${id}`)
  }

  async createPayment(data: {
    invoice_id: string
    amount: number
    payment_method: string
    payment_date: string
    transaction_id?: string
    status?: string
    notes?: string
  }): Promise<ApiResponse<any>> {
    return apiClient.post("/payments", data)
  }

  async deletePayment(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/payments/${id}`)
  }

  async downloadReceipt(id: string): Promise<Blob> {
    const response = await apiClient.get(`/payments/${id}/receipt`)
    return response.data as any
  }

  async getInvoices(params?: { status?: string; search?: string }): Promise<ApiResponse<{invoices: any[], pagination: any}>> {
    return handleEmptyData(
      apiClient.get("/invoices", params),
      'No invoices found'
    )
  }

  async getInvoice(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/invoices/${id}`)
  }

  async createInvoice(data: {
    student_id: string
    due_date: string
    items: Array<{
      description: string
      amount: number
    }>
    notes?: string
  }): Promise<ApiResponse<any>> {
    return apiClient.post("/invoices", data)
  }

  async updateInvoice(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/invoices/${id}`, data)
  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/invoices/${id}`)
  }

  async sendInvoice(id: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/invoices/${id}/send`)
  }

  async getSettings(): Promise<ApiResponse<any>> {
    return apiClient.get("/settings")
  }

  async updateSettings(data: any): Promise<ApiResponse<any>> {
    return apiClient.put("/settings", data)
  }

  // Billing API
  async getBillingInfo(): Promise<ApiResponse<any>> {
    return apiClient.get("/billing")
  }

  async getUsageStats(): Promise<ApiResponse<any>> {
    return apiClient.get("/billing/usage")
  }
}

export const apiService = new ApiService()
export default apiService