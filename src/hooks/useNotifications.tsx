import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        // Register service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          return true;
        }
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: {
    body?: string;
    icon?: string;
    data?: any;
  }) => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker for better mobile support
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body: options?.body,
            icon: options?.icon || '/favicon.ico',
            badge: '/favicon.ico',
            data: options?.data || {}
          } as any); // Use 'as any' to bypass TypeScript restrictions for mobile features
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          body: options?.body,
          icon: options?.icon || '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const showMessageNotification = (senderName: string, message: string, conversationId: string) => {
    showNotification(`Nuevo mensaje de ${senderName}`, {
      body: message,
      data: { 
        type: 'message', 
        conversationId,
        url: `/chat/${conversationId}`
      }
    });
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showMessageNotification,
    hasPermission: permission === 'granted'
  };
};