import { create } from 'zustand';
import { notificationService } from '@/services';
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

interface NotificationStore {
  notifications: Notification[];
  messages: Message[];
  announcements: Announcement[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  total: number;

  // Notification actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (
    data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>
  ) => Promise<void>;
  addNotification: (notification: Notification) => void;

  // Message actions
  fetchMessages: (filters?: MessageFilters) => Promise<void>;
  fetchMessage: (id: string) => Promise<void>;
  sendMessage: (data: CreateMessageData) => Promise<void>;
  replyToMessage: (messageId: string, content: string) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  fetchSentMessages: (filters?: MessageFilters) => Promise<void>;
  fetchReceivedMessages: (filters?: MessageFilters) => Promise<void>;

  // Announcement actions
  fetchAnnouncements: (filters?: AnnouncementFilters) => Promise<void>;
  fetchAnnouncement: (id: string) => Promise<void>;
  createAnnouncement: (data: CreateAnnouncementData) => Promise<void>;
  updateAnnouncement: (
    id: string,
    data: Partial<CreateAnnouncementData>
  ) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  publishAnnouncement: (id: string) => Promise<void>;
  unpublishAnnouncement: (id: string) => Promise<void>;

  // Broadcast actions
  sendBroadcast: (data: {
    title: string;
    message: string;
    targetAudience: string[];
    targetClasses?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => Promise<void>;

  // Utility actions
  clearError: () => void;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  messages: [],
  announcements: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  total: 0,

  // Notification actions
  fetchNotifications: async (filters: NotificationFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const result = await notificationService.getNotifications(filters);
      set({
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        total: result.notifications.length,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch notifications',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark notification as read',
      });
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark all notifications as read',
      });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        total: state.total - 1,
        unreadCount: state.notifications.find((n) => n.id === id)?.isRead
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete notification',
      });
    }
  },

  createNotification: async (
    data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>
  ) => {
    try {
      const notification = await notificationService.createNotification(data);
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        total: state.total + 1,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create notification',
      });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      total: state.total + 1,
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Message actions
  fetchMessages: async (filters: MessageFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const result = await notificationService.getMessages(filters);
      set({
        messages: result.messages,
        total: result.messages.length,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch messages',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessage: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const message = await notificationService.getMessage(id);
      set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? message : m)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch message',
        isLoading: false,
      });
    }
  },

  sendMessage: async (data: CreateMessageData) => {
    set({ isLoading: true, error: null });
    try {
      const message = await notificationService.sendMessage(data);
      set((state) => ({
        messages: [message, ...state.messages],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to send message',
        isLoading: false,
      });
    }
  },

  replyToMessage: async (messageId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const reply = await notificationService.replyToMessage(
        messageId,
        content
      );
      set((state) => ({
        messages: [reply, ...state.messages],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to reply to message',
        isLoading: false,
      });
    }
  },

  markMessageAsRead: async (id: string) => {
    try {
      await notificationService.markMessageAsRead(id);
      set((state) => ({
        messages: state.messages.map((message) =>
          message.id === id ? { ...message, isRead: true } : message
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark message as read',
      });
    }
  },

  deleteMessage: async (id: string) => {
    try {
      await notificationService.deleteMessage(id);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
        total: state.total - 1,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete message',
      });
    }
  },

  fetchSentMessages: async (filters: MessageFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.getSentMessages(filters);
      set({
        messages: response.messages,
        total: response.total,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch sent messages',
        isLoading: false,
      });
    }
  },

  fetchReceivedMessages: async (filters: MessageFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.getReceivedMessages(filters);
      set({
        messages: response.messages,
        total: response.total,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch received messages',
        isLoading: false,
      });
    }
  },

  // Announcement actions
  fetchAnnouncements: async (filters: AnnouncementFilters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const result = await notificationService.getAnnouncements(filters);
      set({
        announcements: result.announcements,
        total: result.announcements.length,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch announcements',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAnnouncement: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const announcement = await notificationService.getAnnouncement(id);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? announcement : a
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch announcement',
        isLoading: false,
      });
    }
  },

  createAnnouncement: async (data: CreateAnnouncementData) => {
    set({ isLoading: true, error: null });
    try {
      const announcement = await notificationService.createAnnouncement(data);
      set((state) => ({
        announcements: [announcement, ...state.announcements],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create announcement',
        isLoading: false,
      });
    }
  },

  updateAnnouncement: async (
    id: string,
    data: Partial<CreateAnnouncementData>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAnnouncement = await notificationService.updateAnnouncement(
        id,
        data
      );
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? updatedAnnouncement : a
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update announcement',
        isLoading: false,
      });
    }
  },

  deleteAnnouncement: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.deleteAnnouncement(id);
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete announcement',
        isLoading: false,
      });
    }
  },

  publishAnnouncement: async (id: string) => {
    try {
      const updatedAnnouncement = await notificationService.publishAnnouncement(
        id
      );
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? updatedAnnouncement : a
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to publish announcement',
      });
    }
  },

  unpublishAnnouncement: async (id: string) => {
    try {
      const updatedAnnouncement =
        await notificationService.unpublishAnnouncement(id);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? updatedAnnouncement : a
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to unpublish announcement',
      });
    }
  },

  // Broadcast actions
  sendBroadcast: async (data: {
    title: string;
    message: string;
    targetAudience: string[];
    targetClasses?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    try {
      await notificationService.sendBroadcast(data);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to send broadcast',
      });
    }
  },

  // Utility actions
  clearError: () => {
    set({ error: null });
  },

  refreshUnreadCount: async () => {
    try {
      const response = await notificationService.getNotifications();
      set({ unreadCount: response.unreadCount });
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  },
}));
