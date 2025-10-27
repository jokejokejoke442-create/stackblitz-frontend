'use client';

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notificationStore';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const store = useNotificationStore();
  
  useEffect(() => {
    store.fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      store.fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
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
  );
}