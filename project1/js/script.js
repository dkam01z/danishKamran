const apiKey = "7b42934456e241e3b28e4b9a7bd9df33";

$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});

var defaultMap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

var googleRoadmap = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

var googleSatellite = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

var cyclingRoutes = L.tileLayer(
  "https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png",
  {
    maxZoom: 18,
    attribution:
      'Routes &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a>, CC-BY-SA',
  }
);

let map = L.map("map", {
  zoomControl: true,
  layers: [googleRoadmap, googleSatellite, defaultMap],
}).setView([50, 3], 3);

var baseLayers = {
  "Satellite View": googleSatellite,
  Roadmap: googleRoadmap,
  "Default Map": defaultMap,
};

var earthquakes = L.featureGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var weather = L.featureGroup({});

var cities = L.featureGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var wiki = L.featureGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

let markerLayers = {
  earthquakes: earthquakes,
  weather: weather,
  cities: cities,
};

L.control.layers(baseLayers, markerLayers).addTo(map);

// Custom control container
var customControl = L.Control.extend({
  options: {
    position: "topleft",
  },
  onAdd: function (map) {
    var container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control leaflet-control-custom d-flex flex-column"
    );
    return container;
  },
});
map.addControl(new customControl());

function locateUser() {
  map
    .locate({ setView: true, maxZoom: 6 })
    .on("locationfound", function (event) {
      var userLat = event.latlng.lat;
      var userLng = event.latlng.lng;

      L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("You are here.")
        .openPopup();

      $.ajax({
        url: "php/getCountryName.php",
        type: "GET",
        data: {
          lat: userLat,
          lon: userLng,
          apiKey: apiKey,
        },

        success: function (response) {
          var data = JSON.parse(response);
          var countryIso =
            data.features[0].properties.country_code.toUpperCase();
          $("#CountrySelect").val(countryIso).change();
        },
      });
    })
    .on("locationerror", function (event) {
      $("#countryList").val("GB").change();
      alert("Cannot retrieve your location, please try again.");
    });
}

var polygonGroup = L.layerGroup().addTo(map);

$(document).ready(function () {
  $(".leaflet-control-custom").append($("#outside-buttons").children());

  locateUser();

  $.getJSON("php/populateCountries.php", function (data) {
    $.each(data, function (index, country) {
      $("#CountrySelect").append(new Option(country.name, country.iso_a2));
    });
  });

  $("#CountrySelect").change(function () {
    var selectedIso = $(this).val();

    $.getJSON(
      "php/getCountryBorders.php",
      { isoCode: selectedIso },
      function (selectedFeature) {
        if (!selectedFeature.error) {
          polygonGroup.clearLayers();

          var geometryType = selectedFeature.geometry.type;
          var coords = selectedFeature.geometry.coordinates;
          var latLngs =
            geometryType === "Polygon"
              ? coords[0].map((coord) => [coord[1], coord[0]])
              : coords.map((polygon) =>
                  polygon[0].map((coord) => [coord[1], coord[0]])
                );
          var polygon = L.polygon(latLngs, { color: "blue" }).addTo(
            polygonGroup
          );
          var bounds = polygon.getBounds();
          map.fitBounds(bounds);

          $.ajax({
            url: "php/getCountryEarthquakes.php",
            type: "GET",
            dataType: "JSON",
            data: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            },
            success: function (response) {
              var data = response.earthquakes;

              for (let i = 0; i < data.length; i++) {
                let earthquakeLat = data[i].lat;
                let earthquakeLng = data[i].lng;
                let point = L.latLng(earthquakeLat, earthquakeLng);

                if (bounds.contains(point)) {
                  let earthquakeMagnitude = data[i].magnitude;
                  let earthquakeTime = data[i].datetime;
                  let formattedTime =
                    moment(earthquakeTime).format("MMMM Do, YYYY");

                  L.marker([earthquakeLat, earthquakeLng])
                    .bindTooltip(
                      `<div class='col text-center'><strong>Recorded Earthquake</strong><br><i>on ${formattedTime}</i><br><i>Measuring ${earthquakeMagnitude} on the Richter Scale</i></div>`,
                      { direction: "top", sticky: true }
                    )
                    .addTo(map);
                }
              }
            },
          });
        }
      }
    );
  });
});
