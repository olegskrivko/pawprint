// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open('app-cache').then((cache) => {
//       return cache.addAll(['/', '/stylesheets/style.css', '/path/to/your/script.js', '/path/to/other/assets']);
//     }),
//   );
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     }),
//   );
// });
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-cache').then((cache) => {
      return cache.addAll(['/', '/stylesheets/style.css', '/javascripts/addServiceMap.js', '/javascripts/clusterMap.js', '/javascripts/formMap.js', '/javascripts/mobile-or-tablet.js', '/javascripts/servicePageMap.js', '/javascripts/showPageMap.js', '/javascripts/showPetShareButtons.js', '/javascripts/validateForms.js', '/images/**/*']); // Cache all files within the "images" folder and its subfolders
    }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If the requested resource is in the cache, return it
      if (response) {
        return response;
      }

      // If the requested resource is not in the cache, fetch it from the network
      return fetch(event.request).then((response) => {
        // Clone the response to save a copy in the cache
        const clonedResponse = response.clone();

        // Open the cache and add the response to it
        caches.open('app-cache').then((cache) => {
          cache.put(event.request, clonedResponse);
        });

        // Return the response
        return response;
      });
    }),
  );
});
