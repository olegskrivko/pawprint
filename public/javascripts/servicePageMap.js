var map = tt.map({
  key: TOMTOMTOKEN,
  container: 'map',
  center: [24.105078, 56.946285],
  zoom: 6,
  // dragPan: !isMobileOrTablet()
});

// Set coordinates which cover the Baltic States and some surrounding areas
var southwest = new tt.LngLat(18.059, 52.129);
var northeast = new tt.LngLat(30.425, 61.259);
var bounds = new tt.LngLatBounds(southwest, northeast);

map.on('load', function () {
  map.setMaxBounds(bounds);
});

map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());

var markersOnTheMap = {};
var eventListenersAdded = false;

var points = services.features.map(function (point, index) {
  return {
    coordinates: [point.location.coordinates[0], point.location.coordinates[1]],
    properties: {
      id: index,
      name: point.name,
      img: point.logo[0].url,
      serviceId: point._id,
    },
  };
});

let geoButtonZoomAll = document.querySelectorAll('.geoButtonZoom');
geoButtonZoomAll.forEach((item) => {
  item.addEventListener('click', (e) => {
    let coords = e.target.dataset.servicecoords;
    let coordsArray = coords.split(',');

    map.easeTo({
      center: coordsArray,
      zoom: 12,
    });
  });
});

var geoJson = {
  type: 'FeatureCollection',
  features: points.map(function (point) {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: point.coordinates,
      },
      properties: point.properties,
    };
  }),
};

function refreshMarkers() {
  Object.keys(markersOnTheMap).forEach(function (id) {
    markersOnTheMap[id].remove();
    delete markersOnTheMap[id];
  });

  map.querySourceFeatures('point-source').forEach(function (feature) {
    if (feature.properties && !feature.properties.cluster) {
      var id = parseInt(feature.properties.id, 10);
      if (!markersOnTheMap[id]) {
        const iconElement = document.createElement('i');
        iconElement.className = 'bi bi-geo-alt-fill';
        iconElement.style.fontSize = '2rem';
        iconElement.style.color = '#9b59b6';

        var newMarker = new tt.Marker({
          element: iconElement,
          anchor: 'bottom',
          draggable: false,
          color: '#FF0000',
        }).setLngLat(feature.geometry.coordinates);

        newMarker.addTo(map);

        newMarker.setPopup(
          new tt.Popup({ offset: 30, closeButton: false }).setHTML(
            `<div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden;">
              <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid white;
              background-image: url(${feature.properties.img ? feature.properties.img : '/images/icons/default-user-image.png'});
              background-size: cover;
              background-position: center;">
              </div>
            </div>
            <p style="text-align: center; font-weight: 700;">${feature.properties.name}</p>
            `,
          ),
        );

        markersOnTheMap[id] = newMarker;
      }
    }
  });
}

map.on('load', function () {
  map.addSource('point-source', {
    type: 'geojson',
    data: geoJson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'point-source',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#EC619F', 4, '#008D8D', 7, '#004B7F'],
      'circle-radius': ['step', ['get', 'point_count'], 15, 4, 20, 7, 25],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'white',
      'circle-stroke-opacity': 1,
    },
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'point-source',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 16,
    },
    paint: {
      'text-color': 'white',
    },
  });

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

  map.on('data', function (e) {
    if (e.sourceId !== 'point-source' || !map.getSource('point-source').loaded()) {
      return;
    }

    refreshMarkers();

    if (!eventListenersAdded) {
      map.on('move', refreshMarkers);
      map.on('moveend', refreshMarkers);
      eventListenersAdded = true;
    }
  });

  map.on('click', 'clusters', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    var clusterId = features[0].properties.cluster_id;
    map.getSource('point-source').getClusterExpansionZoom(clusterId, function (err, zoom) {
      if (err) {
        return;
      }

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom + 0.5,
      });
    });
  });

  map.on('mouseenter', 'clusters', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = '';
  });
});

////////////////
