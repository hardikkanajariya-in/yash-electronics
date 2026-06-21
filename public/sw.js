const CACHE_NAME = 'ye-cache-v1';
const ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const url = new URL(e.request.url);
        // Cache static assets
        if (url.pathname.includes('/_astro/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.json')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
        });
      })
  );
});

// Push Event Listener (Wakes up service worker even when browser is closed)
self.addEventListener('push', (e) => {
  let data = { title: 'New Notification', body: 'Something happened on Yash Electronics.' };
  
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: 'New Notification', body: e.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/admin'
    },
    tag: 'ye-push-notification',
    renotify: true,
    actions: [
      { action: 'open', title: 'Open Admin' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Listener (Handles clicks on the push notifications)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  
  const targetUrl = new URL(e.notification.data?.url || '/admin', self.location.origin).toString();

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open with the target URL, focus it
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
