// Function to initialize the map
function initializeMap(userLng, userLat) {
  const map = tt.map({
    key: TOMTOMTOKEN,
    container: 'map',
    center: [userLng, userLat],
    zoom: 12,
    scrollZoom: false,
  });

  map.addControl(new tt.FullscreenControl());
  map.addControl(new tt.NavigationControl());

  return map;
}

// Function to create a custom marker with coordinates
function createMarker(userLng, userLat) {
  const iconElement = document.createElement('i');
  iconElement.className = 'bi bi-geo-alt-fill';
  iconElement.style.fontSize = '2rem';
  iconElement.style.color = '#9b59b6';

  const marker = new tt.Marker({ element: iconElement, draggable: true }).setLngLat([userLng, userLat]);

  return marker;
}

// Function to set the coordinates in input fields
function setCoordinates(marker) {
  const lngLat = marker.getLngLat();
  document.querySelector('#longitude').value = lngLat.lng.toFixed(6);
  document.querySelector('#latitude').value = lngLat.lat.toFixed(6);
}

// Function to handle map click event
function handleMapClick(marker) {
  marker.on('dragend', function (event) {
    setCoordinates(marker);
  });
}

// Function to handle geolocation errors
function handleLocationError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert('User denied the request for Geolocation.');
      break;
    case error.POSITION_UNAVAILABLE:
      alert('Location information is unavailable.');
      break;
    case error.TIMEOUT:
      alert('The request to get user location timed out.');
      break;
    case error.UNKNOWN_ERROR:
      alert('An unknown error occurred.');
      break;
  }
}

// Function to get the user's location and initialize the map
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        resolve({ userLat, userLng });
      }, reject);
    } else {
      reject(new Error('Geolocation is not available!'));
    }
  });
}

// Main function to run the code
function main() {
  getUserLocation()
    .then(({ userLat, userLng }) => {
      const map = initializeMap(userLng, userLat);
      const marker = createMarker(userLng, userLat);
      marker.addTo(map);
      setCoordinates(marker);
      handleMapClick(marker);
    })
    .catch(handleLocationError);
}

// Call the main function to run the code
main();
