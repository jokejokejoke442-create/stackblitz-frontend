import { apiClient } from './apiClient';

export const driverTrackingService = {
  // Update driver location
  async updateLocation(locationData: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
  }) {
    const response = await apiClient.post('/driver-tracking/location', locationData);
    return response.data;
  },

  // Get driver's current location
  async getCurrentLocation() {
    const response = await apiClient.get('/driver-tracking/location');
    return response.data;
  },

  // Start driver shift
  async startShift(startTime?: string) {
    const response = await apiClient.post('/driver-tracking/shift/start', { startTime });
    return response.data;
  },

  // End driver shift
  async endShift(endTime?: string) {
    const response = await apiClient.post('/driver-tracking/shift/end', { endTime });
    return response.data;
  }
};