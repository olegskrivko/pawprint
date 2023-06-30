// Function to initialize the map
function initializeMap() {
  const map = tt.map({
    key: TOMTOMTOKEN,
    container: 'map',
    center: pet.features.location.coordinates,
    zoom: 12,
    scrollZoom: false,
  });

  map.addControl(new tt.FullscreenControl());
  map.addControl(new tt.NavigationControl());

  return map;
}

// Function to add pet comment markers to the map
function addPetCommentMarkers(map) {
  const petPoints = petcomments.features;

  petPoints.forEach((point) => {
    if (point.location.coordinates) {
      const iconElement = document.createElement('i');
      iconElement.className = 'bi bi-geo-fill';
      iconElement.style.fontSize = '2rem';
      iconElement.style.color = '#0E86D4';

      const commentCoords = point.location.coordinates;
      const commentMarker = new tt.Marker({ element: iconElement, draggable: false }).setLngLat(commentCoords).addTo(map);
    }
  });
}

// Function to handle the toggle point button
function handleTogglePointButton(map) {
  const togglePointBtn = document.getElementById('togglePointBtn');
  const geoBtnSign = document.querySelector('.geo-btn-sign');
  const commentlng = document.querySelector('#commentlng');
  const commentlat = document.querySelector('#commentlat');

  let pointMarker = null;

  const iconElement = document.createElement('i');
  iconElement.className = 'bi bi-geo-fill';
  iconElement.style.fontSize = '2rem';
  iconElement.style.color = '#BA0F30';

  togglePointBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (pointMarker) {
      pointMarker.remove();
      pointMarker = null;
      geoBtnSign.innerHTML = '</i><small class="geo-btn-sign" style="pointer-events: none">+</small>';
    } else {
      const mapCenter = map.getCenter();
      const userLat = mapCenter.lat;
      const userLng = mapCenter.lng;
      commentlng.value = userLng;
      commentlat.value = userLat;
      geoBtnSign.innerHTML = '</i><small class="geo-btn-sign" style="pointer-events: none">-</small>';

      pointMarker = new tt.Marker({ element: iconElement, draggable: true }).setLngLat([userLng, userLat]).addTo(map);

      pointMarker.on('dragend', (e) => {
        const lngLat = pointMarker.getLngLat();
        commentlng.value = lngLat.lng;
        commentlat.value = lngLat.lat;
      });
    }
  });
}

// Function to handle zooming to pet comment locations
function handleZoomToPetComments(map) {
  const petButtonZoomAll = document.querySelectorAll('.petButtonZoom');
  petButtonZoomAll.forEach((item) => {
    item.addEventListener('click', (e) => {
      const targetDiv = document.getElementById('map');

      targetDiv.scrollIntoView({
        behavior: 'smooth',
      });

      e.preventDefault();
      const coords = e.target.dataset.petcommentcoords;
      const coordsArray = coords.split(',');

      map.easeTo({
        center: coordsArray,
        zoom: 16,
      });
    });
  });
}

// Function to add the pet marker to the map
function addPetMarker(map) {
  const iconElement = document.createElement('i');
  iconElement.className = 'bi bi-geo-alt-fill';
  iconElement.style.fontSize = '2rem';
  iconElement.style.color = '#9b59b6';

  // Set the initial coordinates for the pet marker
  function setCoordinates() {
    const lngLat = marker.getLngLat();
    document.querySelector('.pet-longitude').value = lngLat.lng.toFixed(6);
    document.querySelector('.pet-latitude').value = lngLat.lat.toFixed(6);
  }

  // Add a pet marker to the map
  const marker = new tt.Marker({ element: iconElement, draggable: false }).setLngLat(pet.features.location.coordinates).addTo(map);
  setCoordinates();
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

// Main function to run the code
function main() {
  let userLat = 56.946285;
  let userLng = 24.105078;

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;

      const map = initializeMap();
      addPetCommentMarkers(map);
      handleTogglePointButton(map);
      handleZoomToPetComments(map);
      addPetMarker(map);
    }, handleLocationError);
  } else {
    alert('Geolocation is not available!');
  }
}

// Call the main function to run the code
main();
