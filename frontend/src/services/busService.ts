import { apiClient } from './apiClient';
import { Bus, BusLocation, BusRoute, StudentBusAssignment } from '@/types';
import { ApiResponse } from '@/types/api';

/**
 * Helper function to handle empty data responses consistently
 */
const handleEmptyData = async <T>(promise: Promise<any>, emptyMessage: string): Promise<any> => {
  try {
    const response = await promise;
    return response;
  } catch (error: any) {
    // Return empty array/object for empty data cases, not errors
    const lowerMessage = (error.message || '').toLowerCase();
    if (lowerMessage.includes('no data') ||
        lowerMessage.includes('no buses') ||
        lowerMessage.includes('no locations') ||
        lowerMessage.includes('no routes') ||
        lowerMessage.includes('no assignments') ||
        (lowerMessage.startsWith('no ') && lowerMessage.includes('found'))) {
      return {
        success: true,
        message: emptyMessage,
        data: []
      };
    }
    throw error;
  }
};

export const busService = {
  // Get all buses (admin only)
  async getBuses(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ 
    data: Bus[]; 
    pagination: { 
      page: number; 
      limit: number; 
      total: number; 
      pages: number; 
    } 
  }>> {
    try {
      const response = await handleEmptyData(
        apiClient.get("/buses", params),
        'No buses found'
      );
      
      // Handle case where response.data is the actual data, not wrapped
      if (response.data && !response.data.data) {
        return {
          success: true,
          data: {
            data: response.data,
            pagination: {
              page: 1,
              limit: 10,
              total: response.data.length || 0,
              pages: 1
            }
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching buses:', error);
      // Return empty data instead of throwing error
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      };
    }
  },

  // Get a specific bus by ID (admin only)
  async getBusById(id: string): Promise<ApiResponse<Bus>> {
    try {
      const response = await apiClient.get<Bus>(`/buses/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching bus:', error);
      throw error;
    }
  },

  // Create a new bus (admin only)
  async createBus(busData: Partial<Bus>): Promise<ApiResponse<Bus>> {
    try {
      const response = await apiClient.post<Bus>('/buses', busData);
      return response;
    } catch (error) {
      console.error('Error creating bus:', error);
      throw error;
    }
  },

  // Update a bus (admin only)
  async updateBus(id: string, busData: Partial<Bus>): Promise<ApiResponse<Bus>> {
    try {
      const response = await apiClient.put<Bus>(`/buses/${id}`, busData);
      return response;
    } catch (error) {
      console.error('Error updating bus:', error);
      throw error;
    }
  },

  // Delete a bus (admin only)
  async deleteBus(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/buses/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting bus:', error);
      throw error;
    }
  },

  // Get real-time bus locations (accessible to admins, parents, and students)
  async getBusLocations(busId?: string): Promise<BusLocation[]> {
    try {
      const params = busId ? { busId } : undefined;
      const response = await handleEmptyData(
        apiClient.get<BusLocation[]>("/buses/locations", params),
        'No bus locations found'
      );
      
      // Handle case where response.data is the actual data, not wrapped
      if (response.data && !response.data.data) {
        return response.data;
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching bus locations:', error);
      // Return empty array instead of throwing error
      return [];
    }
  },

  // Update bus location (for real-time tracking) (admin only)
  async updateBusLocation(locationData: {
    busId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
  }): Promise<ApiResponse<BusLocation>> {
    try {
      const response = await apiClient.post<BusLocation>('/buses/locations', locationData);
      return response;
    } catch (error) {
      console.error('Error updating bus location:', error);
      throw error;
    }
  },

  // Get bus routes (admin only)
  async getBusRoutes(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ 
    data: BusRoute[]; 
    pagination: { 
      page: number; 
      limit: number; 
      total: number; 
      pages: number; 
    } 
  }>> {
    try {
      const response = await handleEmptyData(
        apiClient.get("/buses/routes", params),
        'No bus routes found'
      );
      
      // Handle case where response.data is the actual data, not wrapped
      if (response.data && !response.data.data) {
        return {
          success: true,
          data: {
            data: response.data,
            pagination: {
              page: 1,
              limit: 10,
              total: response.data.length || 0,
              pages: 1
            }
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching bus routes:', error);
      // Return empty data instead of throwing error
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      };
    }
  },

  // Get student bus assignments (accessible to admins, parents, and students)
  async getStudentBusAssignments(params?: { 
    page?: number; 
    limit?: number; 
    studentId?: string 
  }): Promise<ApiResponse<{ 
    data: StudentBusAssignment[]; 
    pagination: { 
      page: number; 
      limit: number; 
      total: number; 
      pages: number; 
    } 
  }>> {
    try {
      const response = await handleEmptyData(
        apiClient.get("/buses/assignments", params),
        'No student bus assignments found'
      );
      
      // Handle case where response.data is the actual data, not wrapped
      if (response.data && !response.data.data) {
        return {
          success: true,
          data: {
            data: response.data,
            pagination: {
              page: 1,
              limit: 10,
              total: response.data.length || 0,
              pages: 1
            }
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching student bus assignments:', error);
      // Return empty data instead of throwing error
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      };
    }
  }
};