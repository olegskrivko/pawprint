let userLat = 56.946285;
let userLng = 24.105078;

if ("geolocation" in navigator) {
  // geolocation is available
  navigator.geolocation.getCurrentPosition((position) => {
    // Get user position
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;

    let map = tt.map({
      key: TOMTOMTOKEN,
      container: "map",
      center: [userLng, userLat],
      zoom: 13,
      scrollZoom: false, // disable scroll zoom initially
    });

    // Add the Fullscreen and Navigation controls
    map.addControl(new tt.FullscreenControl());
    map.addControl(new tt.NavigationControl());

    // TO DO: Create control btn to go current location and/or to marker

    // Create custom marker icon
    const iconElement = document.createElement("i");
    iconElement.className = "bi bi-geo-alt-fill";
    iconElement.style.fontSize = "2rem";
    iconElement.style.color = "#9b59b6";

    function setCoordinates() {
      let lngLat = marker.getLngLat();
      document.querySelector("#longitude").value = lngLat.lng.toFixed(6);
      document.querySelector("#latitude").value = lngLat.lat.toFixed(6);
    }

    // Create a marker
    let marker = new tt.Marker({ element: iconElement, draggable: true })
      .setLngLat([userLng, userLat])
      .addTo(map);
    // Get initial coords
    setCoordinates();

    // Add marker on click
    map.on("click", function (event) {
      marker.setLngLat(event.lngLat);
      // Get coords on click
      setCoordinates();
    });

    // Get coords on dragend
    marker.on("dragend", function (event) {
      setCoordinates();
    });

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
  alert("Geolocation IS NOT available!");
}

function handleLocationError(error) {
  // Handle geolocation error
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}
