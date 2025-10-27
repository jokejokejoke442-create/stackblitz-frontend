export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Class interface aligned with database schema
// Note: classTeacherId is now a direct reference in the classes table
export interface Class {
  id: string;
  className: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId?: string;
  capacity: number;
  currentStrength: number;
  roomNumber?: string;
  subjects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: string;
  academicYear: string;
  assessmentType: 'exam' | 'assignment' | 'quiz' | 'project' | 'participation';
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  remarks?: string;
  gradedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string;
  endTime: string;
  roomNumber?: string;
  academicYear: string;
  term: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceFilters {
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  page?: number;
  limit?: number;
}

export interface GradeFilters {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  term?: string;
  academicYear?: string;
  assessmentType?: string;
  page?: number;
  limit?: number;
}
