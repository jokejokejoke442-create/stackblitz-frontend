export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipientId?: string;
  recipientRole?: 'admin' | 'teacher' | 'parent' | 'student' | 'all';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  messageType: 'individual' | 'broadcast' | 'announcement';
  isRead: boolean;
  hasAttachment: boolean;
  attachments?: MessageAttachment[];
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetAudience:
    | 'all'
    | 'admin'
    | 'teachers'
    | 'parents'
    | 'students'
    | 'specific_classes';
  targetClasses?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPublished: boolean;
  publishAt?: string;
  expiresAt?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface CreateMessageData {
  recipientId: string;
  subject: string;
  content: string;
  messageType?: 'individual' | 'broadcast' | 'announcement';
  replyTo?: string;
  attachments?: File[];
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  targetAudience:
    | 'all'
    | 'admin'
    | 'teachers'
    | 'parents'
    | 'students'
    | 'specific_classes';
  targetClasses?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishAt?: string;
  expiresAt?: string;
  attachments?: File[];
}

export interface NotificationFilters {
  type?: 'info' | 'warning' | 'error' | 'success';
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  page?: number;
  limit?: number;
}

export interface MessageFilters {
  messageType?: 'individual' | 'broadcast' | 'announcement';
  isRead?: boolean;
  hasAttachment?: boolean;
  senderId?: string;
  recipientId?: string;
  page?: number;
  limit?: number;
}

export interface AnnouncementFilters {
  targetAudience?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isPublished?: boolean;
  page?: number;
  limit?: number;
}
