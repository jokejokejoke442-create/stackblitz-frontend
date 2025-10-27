import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types';
import { tenantManager } from '@/lib/tenant';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Set base URL based on tenant context
        config.baseURL = tenantManager.getApiBaseUrl();

        // Add subdomain header for tenant identification
        let subdomain = tenantManager.getSubdomain();
        // Check for tenantSubdomain in localStorage (set during login)
        const storedSubdomain = typeof window !== 'undefined' ? localStorage.getItem('tenantSubdomain') : null;
        if (storedSubdomain) {
          subdomain = storedSubdomain;
        }
        // In development, use default demo subdomain if none detected
        if (process.env.NODE_ENV === 'development' && !subdomain) {
          subdomain = 'demo';
        }
        if (subdomain) {
          config.headers['X-Tenant-Subdomain'] = subdomain;
        }

        // Add auth token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['Content-Type'] = 'application/json';
        (config as any).metadata = { startTime: new Date() };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.baseURL + (config.url || ''),
            headers: config.headers,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log request duration in development
        if (process.env.NODE_ENV === 'development') {
          const duration = new Date().getTime() - (response.config as any).metadata?.startTime?.getTime();
          console.log(`API: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        // Extract tenant info from response if available
        if (response.data?.data?.organization) {
          tenantManager.setTenantInfo(response.data.data.organization);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Log detailed error information
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle tenant not found (404 on tenant routes)
        if (error.response?.status === 404 && tenantManager.isTenantDomain()) {
          if (typeof window !== 'undefined') {
            window.location.href = '/tenant-not-found';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private setTokens(token: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${tenantManager.getApiBaseUrl()}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Subdomain': 'demo'
        }
      }
    );

    const { token, refreshToken: newRefreshToken } = response.data.data;
    this.setTokens(token, newRefreshToken);
  }

  private handleError(error: AxiosError): ApiError {
    const status = error.response?.status || 500;
    const response = error.response?.data as any;

    let message = 'An unexpected error occurred';

    // Handle different error formats
    if (response) {
      if (response.message) {
        message = response.message;
      } else if (response.error) {
        message = response.error;
      } else if (typeof response === 'string') {
        message = response;
      }
    } else if (error.message) {
      message = error.message;
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        message = message || 'Bad request. Please check your input.';
        break;
      case 401:
        message = message || 'Unauthorized. Please login again.';
        break;
      case 403:
        message =
          message ||
          'Forbidden. You do not have permission to perform this action.';
        break;
      case 404:
        message = message || 'Resource not found.';
        break;
      case 409:
        message = message || 'Conflict. The resource already exists.';
        break;
      case 422:
        message = message || 'Validation error. Please check your input.';
        break;
      case 429:
        message = message || 'Too many requests. Please try again later.';
        break;
      case 500:
        message = message || 'Internal server error. Please try again later.';
        break;
      case 502:
        message =
          message || 'Service temporarily unavailable. Please try again later.';
        break;
      case 503:
        message = message || 'Service unavailable. Please try again later.';
        break;
    }

    const errors = response?.errors;

    return {
      message,
      status,
      errors,
    };
  }

  // HTTP Methods with better error handling
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // File upload with progress tracking
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
        timeout: 60000, // Longer timeout for file uploads
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
        timeout: 60000, // Longer timeout for downloads
      });

      if (typeof window !== 'undefined') {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
