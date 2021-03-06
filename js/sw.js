var cacheHash = "0a8cb71";

// The first line of this file is automatically replaced whenever the bundle is compiled

var cacheName = "statcastr-" + cacheHash;

// During the installation phase, you'll usually want to cache static assets.
self.addEventListener('install', function (e) {
    // Once the service worker is installed, go ahead and fetch the resources to make this work offline.
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll([
                './?standalone=true',
                './bundle.all.css',
                './bundle.all.js',
                './favicon.ico'
            ]).then(function () {
                self.skipWaiting();
            });
        })
    );
});

// when the browser fetches a URL…
self.addEventListener('fetch', function (event) {
    // … either respond with the cached object or go ahead and fetch the actual URL
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                // retrieve from cache
                return response;
            }
            // fetch as normal
            return fetch(event.request);
        })
    );
});

// On version update, remove old cached files
self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (key) {
            return key.startsWith("statcastr-") && !key.endsWith(cacheHash);
        }).map(function (key) {
            return caches.delete(key);
        }));
    }).then(function () {
        self.skipWaiting();
        self.clients.claim();
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => client.postMessage('reload-window'));
        });
    }));
});
