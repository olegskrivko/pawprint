self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/public/stylesheets/style.css',
        '/public/javascripts/addServiceMap.js',
        '/public/javascripts/clusterMap.js',
        '/public/javascripts/formMap.js',
        '/public/javascripts/mobile-or-tablet.js',
        '/public/javascripts/servicePageMap.js',
        '/public/javascripts/showPageMap.js',
        '/public/javascripts/showPetShareButtons.js',
        '/public/javascripts/validateForms.js',
        '/public/images/icons/cat.png',
        '/public/images/icons/default-user-image.png',
        '/public/images/icons/dog.png',
        '/public/images/icons/paw.png',
        '/public/images/icons/user.png',
        '/public/images/pwaicons/icon-512.png',
        '/public/images/pwaicons/icon.png',
        '/public/images/sponsors/9.jpg',
        '/public/images/technologystack/bootstraplogo.png',
        '/public/images/technologystack/cloudinarylogo.png',
        '/public/images/technologystack/cycliclogo.png',
        '/public/images/technologystack/ejslogo.png',
        '/public/images/technologystack/expressjslogo.png',
        '/public/images/technologystack/monggodblogo.png',
        '/public/images/technologystack/nodejslogo.png',
        '/public/images/technologystack/tomtomlogo.png',
        '/public/images/404.png',
        '/public/images/placeholder.jpg',
      ]); // Cache all files within the "images" folder and its subfolders
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
