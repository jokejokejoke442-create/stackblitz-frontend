export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  qualification: string;
  specialization: string;
  experience: number;
  dateJoined: string;
  salary: number;
  isClassTeacher: boolean;
  classId?: string;
  subjects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  qualification: string;
  specialization: string;
  experience: number;
  dateJoined: string;
  salary: number;
  isClassTeacher: boolean;
  classId?: string;
  subjects: string[];
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  isActive?: boolean;
}

export interface TeacherFilters {
  search?: string;
  subject?: string;
  status?: 'active' | 'inactive';
  isClassTeacher?: boolean;
  page?: number;
  limit?: number;
}
