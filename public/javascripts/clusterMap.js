var map = tt.map({
  key: TOMTOMTOKEN,
  container: "map",
  center: [24.105078, 56.946285],
  zoom: 6,
  // dragPan: !isMobileOrTablet()
});

// Set coordinates which cover the Baltic States and some surrounding areas
var southwest = new tt.LngLat(18.059, 52.129);
var northeast = new tt.LngLat(30.425, 61.259);
var bounds = new tt.LngLatBounds(southwest, northeast);

map.on("load", function () {
  map.setMaxBounds(bounds);
});

map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());

var markersOnTheMap = {};
var eventListenersAdded = false;

//console.log(pets);
//console.log(selectedPolygonCoordinates.features);
map.on("load", function () {
  map.addLayer({
    id: "overlay",
    type: "fill",
    source: {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [selectedPolygonCoordinates.features],
        },
      },
    },
    layout: {},
    paint: {
      "fill-color": "#8A2BE2",
      "fill-opacity": 0.5,
      "fill-outline-color": "#4B0082",
    },
  });
});
console.log(pets);
var points = pets.features.map(function (point, index) {
  return {
    coordinates: [point.longitude, point.latitude],

    // properties: { id: index, name: `Point ${index}` },
    properties: {
      id: index,
      name: point.title,
      img: point.images[0].url,
      petId: point._id,
      lostDate: point.lostdate,
      species: point.species,
    },
  };
});

var geoJson = {
  type: "FeatureCollection",
  features: points.map(function (point) {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: point.coordinates,
      },
      properties: point.properties,
    };
  }),
};

let petButtonZoomAll = document.querySelectorAll(".petButtonZoom");
petButtonZoomAll.forEach((item) => {
  item.addEventListener("click", (e) => {
    // Get a reference to the target div
    const targetDiv = document.getElementById("map");

    // Scroll to the target div
    // targetDiv.scrollIntoView({
    //   behavior: "smooth", // Add smooth scrolling animation
    // });

    window.scrollTo({
      top: 0,
      behavior: "smooth", // Add smooth scrolling animation
    });

    //console.log(e);
    //var attributeValue = element.getAttribute("data-myattribute");

    let coords = e.target.dataset.petcoords;
    console.log("coords", coords);
    let coordsArray = coords.split(",");

    map.easeTo({
      center: coordsArray,
      zoom: 12,
    });
  });
});

function refreshMarkers() {
  Object.keys(markersOnTheMap).forEach(function (id) {
    markersOnTheMap[id].remove();
    delete markersOnTheMap[id];
  });
  //https://api.tomtom.com/maps-sdk-for-web/cdn/static/accident.colors-white.png
  map.querySourceFeatures("point-source").forEach(function (feature) {
    if (feature.properties && !feature.properties.cluster) {
      var id = parseInt(feature.properties.id, 10);
      if (!markersOnTheMap[id]) {
        // // Create a custom icon
        // var markerIcon = new tt.Icon({
        //   iconUrl: "images/paw.png",
        //   iconSize: [50, 50], // size of the icon
        //   iconAnchor: [25, 50], // position of the icon relative to its anchor point
        // });
        // function createMarker(icon, position, color, popupText) {
        var markerElement = document.createElement("div");
        markerElement.className = "marker";

        var markerContentElement = document.createElement("div");
        markerContentElement.className = "marker-content";
        markerContentElement.style.backgroundColor = "#FF0000";
        markerElement.appendChild(markerContentElement);

        var iconElement = document.createElement("div");
        if (feature.properties.species === "Dog") {
          iconElement.className = "marker-icon";
          iconElement.style.backgroundImage = "url(images/icons/dog.png)";
          markerContentElement.appendChild(iconElement);
        } else if (feature.properties.species === "Cat") {
          iconElement.className = "marker-icon";
          iconElement.style.backgroundImage = "url(images/icons/cat.png)";
          markerContentElement.appendChild(iconElement);
        }
        // add others species in the future.

        //"url(images/paw.png";
        // var popup = new tt.Popup({ offset: 30 }).setText(popupText);
        // add marker to map
        //   new tt.Marker({ element: markerElement, anchor: "bottom" })
        //     .setLngLat(position)
        //     .setPopup(popup)
        //     .addTo(map);
        // }

        var newMarker = new tt.Marker({
          element: markerElement, // pass the custom icon to the marker
          anchor: "bottom", // set the anchor point for the marker
          draggable: false, // enable dragging of the marker
          color: "#FF0000", // set the color of the marker
        }).setLngLat(feature.geometry.coordinates);

        //console.log(feature.geometry.coordinates);
        newMarker.addTo(map);
        newMarker.setPopup(
          // new tt.Popup({ offset: 30 }).setText(feature.properties.name)
          new tt.Popup({ offset: 30, closeButton: false }).setHTML(
            `<div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden;">
              <a href='/pets/${feature.properties.petId}'>
                <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid white;
                background-image: url(${feature.properties.img});
                background-size: cover;
                background-position: center;">
                </div>
              </a>
            </div>`
          )
        );

        markersOnTheMap[id] = newMarker;
        //newMarker.togglePopup();
      }
    }
  });
}

map.on("load", function () {
  map.addSource("point-source", {
    type: "geojson",
    data: geoJson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "point-source",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#EC619F",
        4,
        "#008D8D",
        7,
        "#004B7F",
      ],
      "circle-radius": ["step", ["get", "point_count"], 15, 4, 20, 7, 25],
      "circle-stroke-width": 1,
      "circle-stroke-color": "white",
      "circle-stroke-opacity": 1,
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "point-source",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 16,
    },
    paint: {
      "text-color": "white",
    },
  });
  //my added
  // map.addLayer({
  //   id: "unclustered-point",
  //   type: "circle",
  //   source: "point-source",
  //   filter: ["!has", "point_count"],
  //   paint: {
  //     "circle-color": "#11b4da",
  //     "circle-radius": 4,
  //     "circle-stroke-width": 1,
  //     "circle-stroke-color": "#fff",
  //   },
  // });

  map.on("data", function (e) {
    if (
      e.sourceId !== "point-source" ||
      !map.getSource("point-source").loaded()
    ) {
      return;
    }

    refreshMarkers();

    if (!eventListenersAdded) {
      map.on("move", refreshMarkers);
      map.on("moveend", refreshMarkers);
      eventListenersAdded = true;
    }
  });

  map.on("click", "clusters", function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource("point-source")
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) {
          return;
        }

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom + 0.5,
        });
      });
  });

  map.on("mouseenter", "clusters", function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "clusters", function () {
    map.getCanvas().style.cursor = "";
  });
});

////////////////
// DISPLAY YOUR LOCATION ANIMATED POINT
// THIS CODES REMOVE ITEMS COUNT FROM CLUSTER - ITS A BUG
// if ("geolocation" in navigator) {
//   // geolocation is available
//   navigator.geolocation.getCurrentPosition((position) => {
//     userLat = position.coords.latitude;
//     userLng = position.coords.longitude;

//     var size = 200;

//     // implementation of CustomLayer to draw animated location icon on the map
//     // see https://developer.tomtom.com/maps-sdk-web-js/documentation#ICustomLayer for more info
//     var locationPoint = {
//       width: size,
//       height: size,
//       data: new Uint8Array(size * size * 4),

//       // get rendering context for the map canvas when layer is added to the map
//       onAdd: function () {
//         var canvas = document.createElement("canvas");
//         canvas.width = this.width;
//         canvas.height = this.height;
//         this.context = canvas.getContext("2d");
//       },

//       // called once before every frame where the icon will be used
//       render: function () {
//         var duration = 1100;
//         var t = (performance.now() % duration) / duration;

//         var radius = 18 + 2 * this.easeInOutSine(t);
//         var outerRadius = 80 * this.easeInOutSine(t) + radius;
//         var context = this.context;

//         // draw outer circle
//         context.clearRect(0, 0, this.width, this.height);
//         context.beginPath();
//         context.arc(
//           this.width / 2,
//           this.height / 2,
//           outerRadius,
//           0,
//           Math.PI * 2
//         );
//         context.fillStyle =
//           "rgba(0, 145, 255," + this.easeInOutSine(1 - t) + ")";
//         context.fill();

//         // draw inner circle
//         context.beginPath();
//         context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
//         context.fillStyle = "rgba(0, 145, 255, 1)";
//         context.strokeStyle = "white";
//         context.lineWidth = 3 + this.easeInOutSine(1 - t);
//         context.fill();
//         context.stroke();

//         // update this image's data with data from the canvas
//         this.data = context.getImageData(0, 0, this.width, this.height).data;

//         // continuously repaint the map, resulting in the smooth animation of the dot
//         map.triggerRepaint();

//         // return `true` to let the map know that the image was updated
//         return true;
//       },

//       easeInOutSine: function (x) {
//         return -(Math.cos(Math.PI * x) - 1) / 2;
//       },
//     };

//     map.on("load", function () {
//       map.addImage("pulsing-dot", locationPoint, { pixelRatio: 2 });

//       map.addSource("points", {
//         type: "geojson",
//         data: {
//           type: "FeatureCollection",
//           features: [
//             {
//               type: "Feature",
//               geometry: {
//                 type: "Point",
//                 coordinates: [userLng, userLat],
//               },
//             },
//           ],
//         },
//       });
//       map.addLayer({
//         id: "points",
//         type: "symbol",
//         source: "points",
//         layout: {
//           "icon-image": "pulsing-dot",
//         },
//       });
//     });
//   });
// }
