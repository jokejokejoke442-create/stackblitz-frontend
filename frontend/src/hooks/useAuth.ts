'use client';

import React, { useState, useContext, createContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import { AuthContextType, User } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { schoolName: string; email: string; password: string }) => {
    try {
      setLoading(true);
      // Set tenant subdomain in localStorage so apiClient can use it
      if (credentials.schoolName) {
        localStorage.setItem('tenantSubdomain', credentials.schoolName);
      }
      
      const response = await apiClient.post('/auth/login', credentials);
      
      const { token, refreshToken, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const registerSchool = async (data: {
    schoolName: string;
    subdomain: string;
    schoolLogo?: string;
    officialPhone?: string;
    whatsappNumber?: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
  }) => {
    try {
      const response = await apiClient.post('/platform/register-school', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'parent' | 'student';
    phone?: string;
  }) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/register', data);
      const { token, refreshToken, user } = response.data as any;

      if (token && refreshToken && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantSubdomain');
      
      // Reset state
      setToken(null);
      setUser(null);
      
      // Redirect to login
      router.push('/auth/login');
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    registerSchool,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// Add the missing useAuth hook function
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}