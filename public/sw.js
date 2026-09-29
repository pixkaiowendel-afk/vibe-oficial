const CACHE_NAME = 'vibe-conversas-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptador de requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não interceptar requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Não interceptar requisições para a API (/api/*) ou Firebase ou Firestore
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('firestore') || 
    url.hostname.includes('firebase')
  ) {
    return;
  }

  // Ignorar outros schemas além de http e https (como chrome-extension, devtools, data)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna a resposta em cache e tenta atualizar em segundo plano silenciosamente
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => { /* ignora falhas de rede em segundo plano */ });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Salva cópia de requisições GET válidas de assets estáticos
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          networkResponse.type === 'basic' &&
          (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2|woff|ttf|html)$/) || url.pathname === '/')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Evento de clique na notificação para foco ou abertura do aplicativo PWA
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Garante o redirecionamento ou foco da janela
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já possui uma janela ou aba instalada aberta, foca nela
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abre o aplicativo na raiz
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Listener de Push nativo para receber notificações em segundo plano / fora do aplicativo
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Vibe • Nova Mensagem';
    const options = {
      body: data.body || 'Você recebeu um alerta.',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      vibrate: data.vibrate || [200, 100, 200],
      tag: data.tag || 'vibe-notification',
      renotify: data.renotify !== false,
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Erro ao processar evento de Push no Service Worker:', err);
  }
});

