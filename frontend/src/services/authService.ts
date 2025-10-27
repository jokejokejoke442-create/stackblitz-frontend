import { apiClient } from './apiClient';
import { User, RegisterData } from '@/types';

// Auth service for handling authentication related operations
export const authService = {
  // Login user
  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await apiClient.post('/school/auth/login', { email, password });
    return response.data!;
  },

  // Register user
  async register(userData: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await apiClient.post('/school/auth/register', userData);
    return response.data!;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/school/auth/logout');
    } catch (error) {
      // Even if the logout API call fails, we still want to clear local tokens
      console.warn('Logout API call failed, but proceeding with local cleanup:', error);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/school/auth/me');
    return response.data!;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post('/school/auth/refresh', { refreshToken });
    return response.data!;
  }
};