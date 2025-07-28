import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  getUserNotifications, 
  markNotificationAsRead,
  type UserNotification 
} from '../lib/missing-tables-api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Check, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Newspaper,
  Settings 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';

const getNotificationIcon = (type: UserNotification['notification_type']) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4" />;
    case 'success':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'news':
      return <Newspaper className="h-4 w-4" />;
    case 'system':
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: UserNotification['notification_type']) => {
  switch (type) {
    case 'info':
      return 'text-blue-500';
    case 'success':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    case 'news':
      return 'text-purple-500';
    case 'system':
      return 'text-gray-500';
    default:
      return 'text-blue-500';
  }
};

interface UserNotificationCenterProps {
  showUnreadOnly?: boolean;
  maxHeight?: string;
}

const UserNotificationCenter: React.FC<UserNotificationCenterProps> = ({
  showUnreadOnly = false,
  maxHeight = '400px'
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    }
  });

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['user-notifications', user?.id, filter],
    queryFn: () => {
      if (!user?.id) return [];
      return getUserNotifications(user.id, filter === 'unread');
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      toast({
        title: 'সফল',
        description: 'নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত',
      });
    },
    onError: () => {
      toast({
        title: 'ত্রুটি',
        description: 'নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BellOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">নোটিফিকেশন দেখতে লগইন করুন</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            নোটিফিকেশন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            নোটিফিকেশন
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              সব
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              না পড়া ({unreadCount})
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'কোনো নতুন নোটিফিকেশন নেই' 
                : 'কোনো নোটিফিকেশন নেই'
              }
            </p>
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 ${getNotificationColor(notification.notification_type)}`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          !notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: bn
                            })}
                          </span>
                          
                          {notification.action_url && notification.action_label && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-xs p-0 h-auto"
                              onClick={() => {
                                window.open(notification.action_url, '_blank');
                                if (!notification.is_read) {
                                  handleMarkAsRead(notification.id);
                                }
                              }}
                            >
                              {notification.action_label}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="flex-shrink-0 h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default UserNotificationCenter;