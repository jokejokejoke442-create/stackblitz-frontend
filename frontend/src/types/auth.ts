export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'parent' | 'student' | 'driver';
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: string;
  // Driver-specific properties (optional as they only apply to drivers)
  driverId?: string;
  assignedBusId?: string;
  licenseNumber?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

// Adding the missing AuthContextType interface
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<any>;
  login: (credentials: { schoolName: string; email: string; password: string }) => Promise<any>;
  registerSchool: (data: {
    schoolName: string;
    subdomain: string;
    schoolLogo?: string;
    officialPhone?: string;
    whatsappNumber?: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
}