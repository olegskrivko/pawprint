self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-cache').then((cache) => {
      return cache.addAll(['/', '/public/stylesheets/style.css', '/public/javascripts/addServiceMap.js', '/public/javascripts/clusterMap.js', '/public/javascripts/formMap.js', '/public/javascripts/mobile-or-tablet.js', '/public/javascripts/servicePageMap.js', '/public/javascripts/showPageMap.js', '/public/javascripts/showPetShareButtons.js', '/public/javascripts/validateForms.js', '/public/images/**/*']); // Cache all files within the "images" folder and its subfolders
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
