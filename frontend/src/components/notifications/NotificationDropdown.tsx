'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X, Check, Clock, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const store = useNotificationStore();
  
  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);
  
  // Setup WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  const connectWebSocket = () => {
    try {
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // In a real implementation, you would get these from auth context
      const userId = localStorage.getItem('userId') || 'test-user';
      const organizationId = localStorage.getItem('organizationId') || 'test-org';
      
      const ws = new WebSocket(`ws://localhost:5000?userId=${userId}&organizationId=${organizationId}`);
      websocketRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            // Add new notification to store
            store.addNotification(data.data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.reason);
        // Attempt to reconnect after 5 seconds, but only if not manually closed
        if (event.code !== 1000) { // 1000 is normal closure
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    }
  };
  
  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Call fetchNotifications with proper parameters if needed
      await store.fetchNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      // Update the notification in the store after successfully marking as read
      store.markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      // Update all notifications in the store after successfully marking as read
      store.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      // Remove the notification from the store after successful deletion
      store.deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getNotificationLink = (notification: any) => {
    // Generate link based on notification data
    if (notification.data?.eventType === 'attendance_marked' && notification.data?.classId) {
      const today = new Date().toISOString().split('T')[0];
      return `/attendance?classId=${notification.data.classId}&date=${today}`;
    }
    
    if (notification.data?.eventType === 'grade_added' && notification.data?.studentId) {
      return `/grades?studentId=${notification.data.studentId}`;
    }
    
    if (notification.data?.eventType === 'payment_received' && notification.data?.invoiceId) {
      return `/payments?invoiceId=${notification.data.invoiceId}`;
    }
    
    if (notification.data?.eventType === 'invoice_created' && notification.data?.invoiceId) {
      return `/invoices/${notification.data.invoiceId}`;
    }
    
    if (notification.data?.studentId) {
      return `/students/${notification.data.studentId}`;
    }
    
    // Default to notifications page
    return '/notifications';
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {store.unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {store.unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {store.unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : store.notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {store.notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-muted/30' : ''
                  }`}
                >
                  <Link href={getNotificationLink(notification)} className="block">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight">
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={getNotificationVariant(notification.type)} className="text-xs">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            markAsRead(notification.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}