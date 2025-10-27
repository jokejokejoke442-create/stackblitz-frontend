import { apiClient } from './apiClient';
import {
  Notification,
  Message,
  Announcement,
  CreateMessageData,
  CreateAnnouncementData,
  NotificationFilters,
  MessageFilters,
  AnnouncementFilters,
} from '@/types';

export const notificationService = {
  // Notifications
  async getNotifications(
    filters: NotificationFilters = {}
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const response = await apiClient.get<{
      notifications: Notification[];
      unreadCount: number;
    }>('/notifications', { params: filters });
    return response.data!;
  },

  async getNotification(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data!;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch('/notifications/mark-all-read');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async createNotification(
    data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>
  ): Promise<Notification> {
    const response = await apiClient.post<Notification>('/notifications', data);
    return response.data!;
  },

  // Messages
  async getMessages(
    filters: MessageFilters = {}
  ): Promise<{ messages: Message[]; total: number }> {
    const response = await apiClient.get<{
      messages: Message[];
      total: number;
    }>('/messages', { params: filters });
    return response.data!;
  },

  async getMessage(id: string): Promise<Message> {
    const response = await apiClient.get<Message>(`/messages/${id}`);
    return response.data!;
  },

  async sendMessage(data: CreateMessageData): Promise<Message> {
    const response = await apiClient.post<Message>('/messages', data);
    return response.data!;
  },

  async replyToMessage(messageId: string, content: string): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/messages/${messageId}/reply`,
      { content }
    );
    return response.data!;
  },

  async markMessageAsRead(id: string): Promise<void> {
    await apiClient.patch(`/messages/${id}/read`);
  },

  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`/messages/${id}`);
  },

  async getSentMessages(
    filters?: MessageFilters
  ): Promise<{ messages: Message[]; total: number }> {
    const response = await apiClient.get<{
      messages: Message[];
      total: number;
    }>('/messages/sent', { params: filters });
    return response.data!;
  },

  async getReceivedMessages(
    filters?: MessageFilters
  ): Promise<{ messages: Message[]; total: number }> {
    const response = await apiClient.get<{
      messages: Message[];
      total: number;
    }>('/messages/received', { params: filters });
    return response.data!;
  },

  // Announcements
  async getAnnouncements(
    filters: AnnouncementFilters = {}
  ): Promise<{ announcements: Announcement[]; total: number }> {
    const response = await apiClient.get<{
      announcements: Announcement[];
      total: number;
    }>('/announcements', { params: filters });
    return response.data!;
  },

  async getAnnouncement(id: string): Promise<Announcement> {
    const response = await apiClient.get<Announcement>(`/announcements/${id}`);
    return response.data!;
  },

  async createAnnouncement(
    data: CreateAnnouncementData
  ): Promise<Announcement> {
    const response = await apiClient.post<Announcement>('/announcements', data);
    return response.data!;
  },

  async updateAnnouncement(
    id: string,
    data: Partial<CreateAnnouncementData>
  ): Promise<Announcement> {
    const response = await apiClient.put<Announcement>(
      `/announcements/${id}`,
      data
    );
    return response.data!;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await apiClient.delete(`/announcements/${id}`);
  },

  async publishAnnouncement(id: string): Promise<Announcement> {
    const response = await apiClient.patch<Announcement>(
      `/announcements/${id}/publish`
    );
    return response.data!;
  },

  async unpublishAnnouncement(id: string): Promise<Announcement> {
    const response = await apiClient.patch<Announcement>(
      `/announcements/${id}/unpublish`
    );
    return response.data!;
  },

  // Broadcast
  async sendBroadcast(data: {
    title: string;
    message: string;
    targetAudience: string[];
    targetClasses?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<void> {
    await apiClient.post('/notifications/broadcast', data);
  },

  // Email notifications
  async sendEmailNotification(data: {
    to: string[];
    subject: string;
    message: string;
    attachments?: File[];
  }): Promise<void> {
    const formData = new FormData();
    formData.append('to', JSON.stringify(data.to));
    formData.append('subject', data.subject);
    formData.append('message', data.message);

    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    await apiClient.post('/notifications/email', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // SMS notifications
  async sendSMSNotification(data: {
    to: string[];
    message: string;
  }): Promise<void> {
    await apiClient.post('/notifications/sms', data);
  },

  // Get notification statistics
  async getNotificationStatistics(filters?: any): Promise<any> {
    const response = await apiClient.get('/notifications/statistics', {
      params: filters,
    });
    return response.data!;
  },
};
