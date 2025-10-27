export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: 'parent' | 'guardian' | 'sibling' | 'other';
  occupation?: string;
  address: string;
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface Class {
  capacity: number;
  currentStrength: number;
  id: string;
  className: string;
  grade: string;
  section: string;
  academicYear: string;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  guardian: Guardian;
  class: Class;
  admissionDate: string;
  academicYear: string;
  medicalInfo: MedicalInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  guardian: Omit<Guardian, 'id'>;
  classId: string;
  admissionDate: string;
  medicalInfo: MedicalInfo;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  isActive?: boolean;
}

export interface StudentFilters {
  search?: string;
  class?: string;
  grade?: string;
  status?: 'active' | 'inactive';
  academicYear?: string;
  page?: number;
  limit?: number;
}

export interface BulkImportResult {
  success: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}
