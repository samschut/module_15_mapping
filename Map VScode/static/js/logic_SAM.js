


//map function
function markerSize(mag) {
  let radius = 2;


  if (mag > 0) {
    radius = mag ** 7;
  }

  return radius
}

// Custom named function
function chooseColor(depth) {
  let color = "black";

  // Switch color by size
  if (depth <= 10) {
    color = "#000080";
  } else if (depth <= 30) {
    color = "#1E90FF";
  } else if (depth <= 50) {
    color = "#DA70D6";
  } else if (depth <= 70) {
    color = "#32CD32";
  } else if (depth <= 90) {
    color = "#Ffa500";
  } else {
    color = "#DC143C";
  }

  // return color
  return (color);
}


function mapcreation(data, geo_data) {
    // Define variables.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  //Overlay layers
  let markers = L.markerClusterGroup();
  let heatArray = [];
  let circleArray = [];

  for (let i = 0; i < data.length; i++){
    let row = data[i];
    let location = row.geometry;

    //marker
    if (location) {
      let point = [location.coordinates[1], location.coordinates[0]];

      let marker = L.marker(point);
      let popup = `<h1>${row.properties.title}</h1>`;
      marker.bindPopup(popup);
      markers.addLayer(marker);

      // for heatmap
      heatArray.push(point);

      // circle
      let circleMarker = L.circle(point, {
        fillOpacity: 0.80,
        color: chooseColor(location.coordinates[2]),
        fillColor: chooseColor(location.coordinates[2]),
        radius: markerSize(row.properties.mag)
      }).bindPopup(popup);

      circleArray.push(circleMarker);
    }
  }

  // layer
  let heatLayer = L.heatLayer(heatArray, {
    radius: 30,
    blur: 10
  });

  let circleLayer = L.layerGroup(circleArray);

  // tectonic plate layer
  let geo_layer = L.geoJSON(geo_data, {
    style: {
      "color": "blueviolet",
      "weight": 2
    }
  });

// Only one base layer shown.
let baseLayers = {
  Street: street,
  Topography: topo
};

let overlayLayers = {
  Markers: markers,
  Heatmap: heatLayer,
  Circles: circleLayer,
  "Tectonic Plates": geo_layer
}

let myMap = L.map("map", {
  center: [40.7, -94.5],
  zoom: 3,
  layers: [street, markers, geo_layer]
});


// Add the Layer Control filter legends as needed
L.control.layers(baseLayers, overlayLayers).addTo(myMap);

// Legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");

  let legendInfo = "<h4>Legend</h4>"
  legendInfo += "<i style='background: #000080'></i>-10-10<br/>";
  legendInfo += "<i style='background: #1E90FF'></i>10-30<br/>";
  legendInfo += "<i style='background: #DA70D6'></i>30-50<br/>";
  legendInfo += "<i style='background: #32CD32'></i>50-70<br/>";
  legendInfo += "<i style='background: #Ffa500'></i>70-90<br/>";
  legendInfo += "<i style='background: #DC143C'></i>90+";

  div.innerHTML = legendInfo;
  return div;
};

// Adding the legend to the map
legend.addTo(myMap);
}

function mapit() {
// Assemble the API query URL.
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(url).then(function (data) {
    // console.log(data);
    d3.json(url2).then(function (geo_data) {
      let data_rows = data.features;

      // make map with both datasets
      mapcreation(data_rows, geo_data);
    });
  });
}

mapit();