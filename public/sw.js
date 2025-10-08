// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('Push message received', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
      
      const options = {
        body: data.body || 'Tienes un nuevo mensaje',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'message-notification',
        requireInteraction: false,
        data: data.data || {},
        actions: [
          {
            action: 'view',
            title: 'Ver mensaje'
          },
          {
            action: 'close',
            title: 'Cerrar'
          }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'Nuevo mensaje', options)
      );
    } catch (error) {
      console.error('Error handling push event:', error);
      
      // Fallback notification
      event.waitUntil(
        self.registration.showNotification('Nuevo mensaje', {
          body: 'Tienes un mensaje nuevo',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/messages';
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if there's already a window open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed', event);
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});