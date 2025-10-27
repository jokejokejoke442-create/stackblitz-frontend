import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services';
import { AuthState, User, LoginCredentials, RegisterData } from '@/types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (requiredRole: string | string[]) => boolean;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isParent: () => boolean;
  isStudent: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials.email, credentials.password);
          const { user, token, refreshToken } = response;

          if (!token || !refreshToken) {
            throw new Error('Invalid login response: missing tokens');
          }

          // Store tokens in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Login error:', error);
          set({ isLoading: false });
          
          // Extract meaningful error message
          let errorMessage = 'Login failed. Please try again.';
          
          if (error?.message) {
            errorMessage = error.message;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // We still want to clear local state even if the API call fails
        } finally {
          // Clear tokens from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false
          });

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          const { user, token, refreshToken } = response;

          // Store tokens in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          const updatedUser = await authService.getCurrentUser();
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return;
        }

        try {
          const user = await authService.getCurrentUser();
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.warn('No refresh token available');
          get().logout();
          return;
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          const { token, refreshToken: newRefreshToken } = response;

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          set({ token });
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },

      hasPermission: (requiredRole: string | string[]) => {
        const { user } = get();
        if (!user) return false;

        if (Array.isArray(requiredRole)) {
          return requiredRole.includes(user.role);
        }

        return user.role === requiredRole;
      },

      isAdmin: () => get().user?.role === 'admin',
      isTeacher: () => get().user?.role === 'teacher',
      isParent: () => get().user?.role === 'parent',
      isStudent: () => get().user?.role === 'student',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);