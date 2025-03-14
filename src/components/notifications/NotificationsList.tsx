'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, Heart, Tag, AlertCircle, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  type: 'MESSAGE' | 'FAVORITE' | 'PRICE_CHANGE' | 'STATUS_UPDATE' | 'SYSTEM';
  title: string;
  content: string | null;
  isRead: boolean;
  createdAt: string;
  relatedId: number | null;
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Eroare la încărcarea notificărilor');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      toast.error('Nu am putut încărca notificările');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Eroare la marcarea notificărilor');
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      const event = new CustomEvent('notificationsUpdated');
      window.dispatchEvent(event);
      
      toast.success('Toate notificările au fost marcate ca citite');
    } catch (error) {
      toast.error('Nu am putut marca notificările ca citite');
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteReadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Eroare la ștergerea notificărilor');
      
      setNotifications(prev => 
        prev.filter(notif => !notif.isRead)
      );
      
      const event = new CustomEvent('notificationsUpdated');
      window.dispatchEvent(event);
      
      toast.success('Notificările citite au fost șterse');
    } catch (error) {
      toast.error('Nu am putut șterge notificările');
      console.error('Error deleting notifications:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!notifications.find(n => n.id === notificationId)?.isRead) {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isRead: true })
        });
        
        if (!response.ok) throw new Error('Eroare la marcarea notificării');
        
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true } 
              : notif
          )
        );
        
        const event = new CustomEvent('notificationsUpdated');
        window.dispatchEvent(event);
        
      } catch (error) {
        toast.error('Nu am putut marca notificarea ca citită');
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'FAVORITE':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'PRICE_CHANGE':
        return <Tag className="h-5 w-5 text-green-500" />;
      case 'STATUS_UPDATE':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Notificări</h2>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-full"
            title="Marchează toate ca citite"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={deleteReadNotifications}
            className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-full"
            title="Șterge notificările citite"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center text-gray-500"
            >
              Nu ai notificări
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    {notification.content && (
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.content}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ro
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full"
                      title="Marchează ca citită"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 