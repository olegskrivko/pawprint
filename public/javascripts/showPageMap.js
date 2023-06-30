let userLat = 56.946285;
let userLng = 24.105078;

if ('geolocation' in navigator) {
  // geolocation is available
  navigator.geolocation.getCurrentPosition((position) => {
    // Get user position
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;

    let map = tt.map({
      key: TOMTOMTOKEN,
      container: 'map',
      center: pet.features.location.coordinates,
      zoom: 13,
      scrollZoom: false, // disable scroll zoom initially
    });

    // Add the Fullscreen and Navigation controls
    map.addControl(new tt.FullscreenControl());
    map.addControl(new tt.NavigationControl());

    // ADD USER POINT START
    // Get a reference to the button element
    const togglePointBtn = document.getElementById('togglePointBtn');
    let geoBtnSign = document.querySelector('.geo-btn-sign');
    let commentlng = document.querySelector('#commentlng');
    let commentlat = document.querySelector('#commentlat');

    let petPoints = petcomments.features;

    // Add markers for each point
    petPoints.forEach((point) => {
      // Check if coordinates are defined
      if (point.location.coordinates) {
        const iconElement3 = document.createElement('i');
        iconElement3.className = 'bi bi-geo-fill';
        iconElement3.style.fontSize = '2rem';
        iconElement3.style.color = '#0E86D4';

        const commentCoords = point.location.coordinates;
        const commentMarker = new tt.Marker({ element: iconElement3, draggable: false }).setLngLat(commentCoords).addTo(map);
        // Customize the marker as needed
        // commentMarker.setPopup(new tt.Popup().setHTML('Marker popup content'));
        // ...
      }
    });

    let pointMarker = null;

    // Create custom marker icon
    const iconElement2 = document.createElement('i');
    iconElement2.className = 'bi bi-geo-fill';
    iconElement2.style.fontSize = '2rem';
    iconElement2.style.color = '#BA0F30';

    // Event listener for the button click
    togglePointBtn.addEventListener('click', () => {
      event.preventDefault(); // Prevent the default form submission behavior
      console.log('you clicked the button');
      if (pointMarker) {
        // Remove the point marker from the map
        pointMarker.remove();
        pointMarker = null;
        geoBtnSign.innerHTML = '</i><small class="geo-btn-sign" style="pointer-events: none">+</small>';
      } else {
        const mapCenter = map.getCenter(); // Get the current center of the map
        const userLat = mapCenter.lat;
        const userLng = mapCenter.lng;
        console.log(commentlng);
        console.log(commentlat);
        commentlng.value = userLng;
        commentlat.value = userLat;
        geoBtnSign.innerHTML = '</i><small class="geo-btn-sign" style="pointer-events: none">-</small>';

        // Add a new point marker to the map
        pointMarker = new tt.Marker({ element: iconElement2, draggable: true }).setLngLat([userLng, userLat]).addTo(map);
      }

      // Event listener for dragend event on the point marker
      pointMarker.on('dragend', (e) => {
        const lngLat = pointMarker.getLngLat();
        commentlng.value = lngLat.lng;
        commentlat.value = lngLat.lat;
      });
    });

    // ADD USER POINT END
    //let showPetLoc = document.querySelector('.show-pet-loc');
    let petButtonZoomAll = document.querySelectorAll('.petButtonZoom');
    petButtonZoomAll.forEach((item) => {
      item.addEventListener('click', (e) => {
        // Get a reference to the target div
        const targetDiv = document.getElementById('map');

        // Scroll to the target div
        targetDiv.scrollIntoView({
          behavior: 'smooth', // Add smooth scrolling animation
        });

        // window.scrollTo({
        //   top: 0,
        //   behavior: 'smooth', // Add smooth scrolling animation
        // });

        //console.log(e);
        //var attributeValue = element.getAttribute("data-myattribute");

        e.preventDefault();
        console.log(e);
        let coords = e.target.dataset.petcommentcoords;

        console.log('coords', coords);
        let coordsArray = coords.split(',');

        map.easeTo({
          center: coordsArray,
          zoom: 12,
        });
      });
    });
    // TO DO: Create control btn to go current location and/or to marker

    // Create custom marker icon
    const iconElement = document.createElement('i');
    iconElement.className = 'bi bi-geo-alt-fill';
    iconElement.style.fontSize = '2rem';
    iconElement.style.color = '#9b59b6';

    function setCoordinates() {
      let lngLat = marker.getLngLat();
      document.querySelector('.pet-longitude').value = lngLat.lng.toFixed(6);
      document.querySelector('.pet-latitude').value = lngLat.lat.toFixed(6);
    }

    // Create a marker
    let marker = new tt.Marker({ element: iconElement, draggable: false })
      //.setLngLat([userLng, userLat])
      .setLngLat(pet.features.location.coordinates)
      .addTo(map);
    // Get initial coords
    setCoordinates();

    // // Add marker on click
    // map.on("click", function (event) {
    //   marker.setLngLat(event.lngLat);
    //   // Get coords on click
    //   setCoordinates();
    // });

    // // Get coords on dragend
    // marker.on("dragend", function (event) {
    //   setCoordinates();
    // });

    // // Enable scroll zoom when Ctrl key is pressed
    // document.addEventListener("keydown", function (event) {
    //   if (event.ctrlKey) {
    //     map.scrollZoom.enable();
    //   }
    // });

    // // Disable scroll zoom when Ctrl key is released
    // document.addEventListener("keyup", function (event) {
    //   if (!event.ctrlKey) {
    //     map.scrollZoom.disable();
    //   }
    // });
  }, handleLocationError);
} else {
  /* geolocation IS NOT available */
  alert('Geolocation IS NOT available!');
}

function handleLocationError(error) {
  // Handle geolocation error
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
