const apiKey = "7b42934456e241e3b28e4b9a7bd9df33";
const exchangeAPIKey = "554d89ca95967dd8c7a603a5";
const weatherAPI = "107e1db8180a432d922171836242803";
const newsApi = "bbe07a0f0321480888552a545dbaa8fb"

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
  "Default Map": defaultMap,
  Roadmap: googleRoadmap,
  
};

var earthquakeIcon = L.ExtraMarkers.icon({
  icon: "fa-house-chimney-crack",
  markerColor: "brown",
  shape: "square",
  prefix: "fa",
});

var citiesIcon = L.ExtraMarkers.icon({
  icon: "fa-building",
  markerColor: "green",
  shape: "square",
  prefix: "fa",
});

weatherIcon = L.ExtraMarkers.icon({
  icon: "fa-cloud-bolt",
  markerColor: "yellow",
  shape: "square",
  prefix: "fa",
});

var earthquakes = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var wiki = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

var weather_Observations = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

let markerLayers = {
  Earthquakes: earthquakes,
  Wiki: wiki,
  Cities: cities,
  Weather_Observations: weather_Observations,
};
const weatherBackgrounds = {
  'clear': 'clear.jpg',
  'fog': 'fog.gif',
  'rain': 'rain.gif',
  'cloudy': 'clouds.gif',
  'overcast': 'overcast.gif',
  'snow': 'snow.gif',
  'sunny': 'sunny.gif'
  
};

L.control.layers(baseLayers, markerLayers).addTo(map);

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
var countryCode;

function getCities(selectedIso) {
  $.ajax({
    url: "php/getCities.php",
    type: "GET",
    dataType: "JSON",
    data: {
      countryCode: selectedIso,
    },

    success: function (response) {
      var responseData = response.geonames;
      for (let i = 0; i < responseData.length; i++) {
        let cityLat = responseData[i].lat;
        let cityLng = responseData[i].lng;
        let cityName = responseData[i].name;

        let cityPopulation = formatPopulation(responseData[i].population);
        L.marker([cityLat, cityLng], {
          icon: citiesIcon,
        })
          .bindTooltip(
            "<div class='col text-center'><strong>" +
              cityName +
              "</strong><br><i>" +
              "Population of " +
              cityPopulation +
              "</i></div>",
            { direction: "top", sticky: true }
          )
          .addTo(cities);
      }
    },
  });
}

function getEarthQuakes(east, west, north, south) {
  $.ajax({
    url: "php/getCountryEarthquakes.php",
    type: "GET",
    dataType: "JSON",
    data: {
      north: north,
      south: south,
      east: east,
      west: west,
    },

    success: function (response) {
      var data = response.earthquakes;

      for (let i = 0; i < data.length; i++) {
        let earthquakeLat = data[i].lat;
        let earthquakeLng = data[i].lng;
        let earthquakeMagnitude = data[i].magnitude;
        let earthquakeTime = data[i].datetime;
        let formattedTime = moment(earthquakeTime).format("MMMM Do, YYYY");

        L.marker([earthquakeLat, earthquakeLng], { icon: earthquakeIcon })
          .bindTooltip(
            `<div class='bootstrap-tooltip card'>
              <div class='card-body'>
                <h6 class='card-title text-primary'><strong>Recorded Earthquake</strong></h6>
                <p class='card-text'>
                  <small class='text-muted'>On ${formattedTime}</small><br>
                  <small>Measuring ${earthquakeMagnitude} on the Richter Scale</small>
                </p>
              </div>
            </div>`,
            { className: "bootstrap-tooltip", direction: "top", sticky: true }
          )
          .addTo(earthquakes);
      }
    },
  });
}

function weatherObservations(east, west, north, south) {
  $.ajax({
    url: "php/weatherObservations.php",
    type: "GET",
    dataType: "JSON",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
    },
    success: function (response) {
      var weatherData = response.weatherObservations;
      for (let i = 0; i < weatherData.length; i++) {
        var weatherLat = weatherData[i].lat;
        var weatherLng = weatherData[i].lng;
        var weatherStation = weatherData[i].stationName;
        var weatherTemp = weatherData[i].temperature;
        var weatherClouds = weatherData[i].clouds;
        var Observation = weatherData[i].observation;
        var weatherDateTime = weatherData[i].datetime;

        L.marker([weatherLat, weatherLng], {
          icon: weatherIcon,
        })
          .bindTooltip(
            `<div class='card border-0 shadow-sm'>
              <div class='card-body'>
                <h6 class='card-title text-primary'><strong>${weatherStation}</strong></h6>
                <p class='card-text'>
                  <small class='text-muted'>Temperature: ${weatherTemp} °C</small><br>
                  <small>Clouds: ${weatherClouds}</small><br>
                  <small>Observation: ${Observation}</small><br>
                  <small class='text-muted'>Observed: ${weatherDateTime}</small>
                </p>
              </div>
            </div>`,
            { className: "bootstrap-tooltip", direction: "top", sticky: true }
          )
          .addTo(weather_Observations);
      }
    },
  });
}

function updateConversionResult(conversionRate) {
  var amount = $("#fromamount").val();
  var calculateConversion = amount * conversionRate;
  $("#exchangeresults").text(calculateConversion.toFixed(2)); // Show results with 2 decimal places
}

function countryExchange(currencyCode) {
  $.ajax({
    url: "php/countryExchange.php",
    dataType: "JSON",
    type: "GET",
    data: {
      apiKey: exchangeAPIKey,
      currencyCode: currencyCode,
    },
    success: function (response) {
      var lastUpdated = response.data.time_last_update_utc;
      var conversionRates = response.data.conversion_rates;

      $("#currencySelect").empty();

      $("#currencySelect").append(
        $("<option>").text("USD").attr("value", "USD")
      );

      
      $.each(conversionRates, function (code, rate) {
        $("#currencySelect").append(
          $("<option>").text(code).attr("value", code)
        );
      });

      $("#exchangeupdatedon").text(lastUpdated);
      $("#currencyExchangeCode").text(currencyCode);

      $("#currencySelect").change(function () {
        var selectedCurrency = $(this).val();
        var conversionRate = conversionRates[selectedCurrency];
        updateConversionResult(conversionRate);
      });

      $("#fromamount").on("input", function () {
        var selectedCurrency = $("#currencySelect").val();
        var conversionRate = conversionRates[selectedCurrency];
        updateConversionResult(conversionRate);
      });

      $("#currencySelect").trigger("change");
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function formatPopulation(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCountryInfo(countryCode) {
  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    dataType: "JSON",
    data: {
      countryCode: countryCode,
    },
    success: function (response) {
      var data = response;

     
      var countryName = data.name;
      var subRegion = data.subregion;
      var currency = data.currencies[0].name;
      var currencyCode = data.currencies[0].code;
      var population = formatPopulation(data.population);
      var extensionCode = data.callingCodes;
      var capital = data.capital;
      var flagImg = data.flags.svg

      $("#currencyCode").html(currencyCode);
      $("#countryName").children().text(countryName).attr('href', `https://en.wikipedia.org/wiki/${countryName}`);
      $("#subRegion").text(subRegion);
      $("#currency").text(currency);
      $("#population").text(population);
      $("#capital").text(capital);
      $("#extensionCode").text("+" + extensionCode);
      $('#flag').children().attr('src', `${flagImg}`); 

      $("#information").on("click", function () {
        $("#countryInfoModal").modal("show");
      });

      countryExchange(currencyCode);
      weatherData(capital);
    },
  });
}

function weatherData(capital) {

  var encodedCapital = encodeURIComponent(capital);

  $.ajax({
    url: 'php/getWeatherData.php',
    type: "GET",
    dataType: "JSON",
    data: {
      capital: encodedCapital,
      apiKey: weatherAPI,
    },
    success: function(response) {
     
    
      
      
      var location = response.location;
      var current = response.current;
      var forecast = response.forecast.forecastday;

      var country = location.country;
      var city = location.name;
      var currentTemp = current.temp_c;
      var currentCondition = current.condition.text;
      var currentImg = current.condition.icon;
      console.log(response)
    
      $('.cityTitle').text(`${city}, ${country}`);
      $('#currentWeatherIcon').attr('src', `https:${currentImg}`); 
      $('.currentTemp').text(`${currentTemp}°C`);
      $('.currentCondition').text(`${currentCondition}`);

    
      updateWeatherBackground(currentCondition.toLowerCase());

    
      forecast.forEach((day, index) => {
        if (index === 0) { 
          return;
        }

       
        $('.cityTitle').text(`${city}, ${country}`);
        $('#currentWeatherIcon').attr('src', `https:${currentImg}`);
        $('.currentTemp').text(`${currentTemp}°C`);
        $('.currentCondition').text(`${currentCondition}`);
        $("#pressureValue").text(current.pressure_mb);
        $("#humidityValue").text(current.humidity);
        $('#windspeed').text(`${current.wind_kph} Kph`)
     

        $(`.modal-daily-forecast .daily-forecast-item:nth-child(${index}) .daily-temp`).text(`${forecast[index].day.avgtemp_c}°C`);

        
      });
    },
    error: function(error) {
      console.error("Error fetching weather data: ", error);
    }
  });
}

function updateWeatherBackground(description) {
  let backgroundImg = 'default.png'; 
  for (const [key, value] of Object.entries(weatherBackgrounds)) {
    if (description.toLowerCase().includes(key)) {
      backgroundImg = value;
      break; 
    }
  }

  $('.weather-content').css('background-image', `url('img/${backgroundImg}')`);
}


function nearbyWikipedia(east, west, north, south) {
  $.ajax({
    url: "php/countryWiki.php",
    method: "GET",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
    },
    dataType: "json",
    success: function (response) {
    
        var geonames = response;
        const listContainer = $('#wikipediaArticlesList');
        listContainer.empty();

        for (let i = 0; i < geonames.length; i++) { 
          var title = geonames[i].title;
          var summary = geonames[i].summary;
          var articleUrl = `https://${geonames[i].wikipediaUrl}`; 

          const articleElement = $(`
              <a href="${articleUrl}" target="_blank" class="list-group-item list-group-item-action my-3">
                <h5 class="articleTitle">${title}</h5>
                <p class="articleDescription">${summary}</p>
              </a>
          `);
          listContainer.append(articleElement);
        }
      
    },
    error: function (error) {
      console.error(error);
    }
  });
}


function newsArticles(country) {

  $.ajax({
    url: 'php/getNews.php',
    method: "GET",
    dataType: "JSON",
    data: {
      apiKey: newsApi,
      country: country
    },
    success: function(response) {
      
      var articles = response.articles;
      var listContainer = $('#newsArticlesList');
      listContainer.empty();

      var defaultNews = 'img/defaultNews.jpg'

      articles.forEach(function(article) {
        var author = article.author || 'Unknown author';
        var title = article.title;
        var url = article.url;
        var imageUrl = article.urlToImage ? article.urlToImage : defaultNews;
        var date = new Date(article.publishedAt).toLocaleString();
        
        var articleHtml = `
          <div class="card mb-3">
            <img src="${imageUrl}" class="card-img-top" alt="${title}">
            <div class="text-center card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${author}</p>
              <p class="card-text"><small class="text-muted">Published on ${date}</small></p>
              <a href="${url}" target="_blank" class="btn btn-primary">Read more</a>
            </div>
          </div>
        `;

        listContainer.append(articleHtml);
      });
    },
    error: function(error) {
      console.error("Error fetching news data: ", error);
    }
  });
}


$(document).ready(function () {
  $(".leaflet-control-custom").append($("#outside-buttons").children());

  locateUser();

  $.getJSON("php/populateCountries.php", function (data) {
    $.each(data, function (index, country) {
      countryCode = country.iso_a2;
      $("#CountrySelect").append(new Option(country.name, countryCode));
    });
  });

  $("#CountrySelect").change(function () {
    var selectedIso = $(this).val();
    polygonGroup.clearLayers();
    earthquakes.clearLayers();
    cities.clearLayers();
    weather_Observations.clearLayers();

    $.getJSON(
      "php/getCountryBorders.php",
      { isoCode: selectedIso },
      function (selectedFeature) {
        if (!selectedFeature.error) {
          var geometryType = selectedFeature.geometry.type;
          var coords = selectedFeature.geometry.coordinates;
          var latLngs = coords[0].map((coord) => [coord[1], coord[0]]);
          if (geometryType === "MultiPolygon") {
            latLngs = coords.map((polygon) =>
              polygon[0].map((coord) => [coord[1], coord[0]])
            );
          }

          var polygon = L.polygon(latLngs, {
            opacity: 0.5,
            color: "blue",
          }).addTo(polygonGroup);
          var bounds = polygon.getBounds();
          map.fitBounds(bounds);

          let east = bounds.getEast();
          let west = bounds.getWest();
          let north = bounds.getNorth();
          let south = bounds.getSouth();

          getEarthQuakes(east, west, north, south);
          getCities(selectedIso);
          weatherObservations(east, west, north, south);
          getCountryInfo(selectedIso);
          nearbyWikipedia(east, west, north, south);
          newsArticles(selectedIso)
        }
      }
    );
  });
});

L.easyButton("fa-solid fa-info blue", function (btn, map) {
  $("#countryInfoModal").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-dollar-sign", function (btn, map) {
  $("#exchangeRateModal").modal("show");
}).addTo(map);

L.easyButton("fa-brands fa-wikipedia-w", function (btn, map) {
  $("#wikipediaModal").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-sun", function (btn, map) {
  $("#weatherModal").modal("show");
}).addTo(map);

L.easyButton("fa-solid fa-newspaper", function (btn, map) {
  $("#newsModal").modal("show");
}).addTo(map);

