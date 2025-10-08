import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BKX6dJZ5z6b9qX_k5_9Y7f9gQ0JQX5s5_9Y7f9gQ0JQX5s5_9Y7f9gQ0JQX5s5_9Y7f9gQ0JQX5s5_9Y7f9gQ0JQX5s';

// Convert base64 string to Uint8Array for VAPID key
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return false;
    }

    if (!user) {
      console.log('User not logged in');
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
          
          // Subscribe to push notifications
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Save subscription to database
            const subscriptionData = subscription.toJSON();
            
            const { error } = await supabase
              .from('push_subscriptions')
              .upsert({
                user_id: user.id,
                endpoint: subscriptionData.endpoint!,
                p256dh: subscriptionData.keys!.p256dh,
                auth: subscriptionData.keys!.auth
              }, {
                onConflict: 'user_id,endpoint'
              });

            if (error) {
              console.error('Error saving push subscription:', error);
              return false;
            }

            console.log('Push subscription saved successfully');
            return true;
          } catch (subscribeError) {
            console.error('Error subscribing to push notifications:', subscribeError);
            return false;
          }
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