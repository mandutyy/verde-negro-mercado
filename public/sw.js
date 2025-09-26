// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('Push message received', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
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
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    // Open the app and navigate to messages
    event.waitUntil(
      clients.openWindow('/messages')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed', event);
});