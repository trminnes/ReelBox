jsconst CACHE_VERSION = 'reelbox-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './reelbox-icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap',
];

// Install: cache core assets and skip waiting immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting()) // 👈 activate new SW immediately, don't wait
  );
});

// Activate: delete ALL old caches, then take control of all tabs immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim()) // 👈 take control of all open tabs now
  );
});

// Message listener: allow the app to trigger a cache clear + reload
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

// Fetch: network-first for HTML/JS/CSS (so updates always come through),
//        cache-first for images (posters load fast)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network for TMDB API, Plex, and GitHub
  if (url.hostname.includes('themoviedb.org') ||
      url.hostname.includes('tmdb.org') ||
      url.hostname.includes('api.github.com') ||
      url.hostname.includes('anthropic.com') ||
      url.port === '32400') {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Cache-first for images (movie posters) — they rarely change
  if (e.request.destination === 'image') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // 👇 Network-first for app shell (HTML, JS, CSS, JSON)
  // This means updates always come through — cache is just the fallback
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => {
      // Offline fallback — serve from cache
      return caches.match(e.request).then(cached => {
        if (cached) return cached;
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 503 });
      });
    })
  );
});
      });
    })
  );
});
