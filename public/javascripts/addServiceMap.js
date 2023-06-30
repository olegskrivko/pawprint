// Function to initialize the map
function initializeMap(userLat, userLng) {
  let map = tt.map({
    key: TOMTOMTOKEN,
    container: 'map',
    center: [userLng, userLat],
    zoom: 13,
    scrollZoom: false,
  });

  // Add the Fullscreen and Navigation controls
  map.addControl(new tt.FullscreenControl());
  map.addControl(new tt.NavigationControl());

  // TO DO: Create control btn to go current location and/or to marker

  // Create custom marker icon
  const iconElement = document.createElement('i');
  iconElement.className = 'bi bi-geo-alt-fill';
  iconElement.style.fontSize = '2rem';
  iconElement.style.color = '#9b59b6';

  // Function to set the marker coordinates
  function setCoordinates() {
    let lngLat = marker.getLngLat();
    document.querySelector('#longitude').value = lngLat.lng.toFixed(6);
    document.querySelector('#latitude').value = lngLat.lat.toFixed(6);
  }

  // Create a marker
  let marker = new tt.Marker({ element: iconElement, draggable: true }).setLngLat([userLng, userLat]).addTo(map);
  // Get initial coords
  setCoordinates();

  // Add marker on click
  map.on('click', function (event) {
    marker.setLngLat(event.lngLat);
    // Get coords on click
    setCoordinates();
  });

  // Get coords on dragend
  marker.on('dragend', function (event) {
    setCoordinates();
  });
}

// Function to handle geolocation error
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

// Check if geolocation is available
if ('geolocation' in navigator) {
  // Geolocation is available
  navigator.geolocation.getCurrentPosition(function (position) {
    // Get user position
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    initializeMap(userLat, userLng);
  }, handleLocationError);
} else {
  // Geolocation is not available
  alert('Geolocation IS NOT available!');
}
