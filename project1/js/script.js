const apiKey = "7b42934456e241e3b28e4b9a7bd9df33";
const exchangeAPIKey = "554d89ca95967dd8c7a603a5";
const weatherAPI = "107e1db8180a432d922171836242803";
const newsApi = "bbe07a0f0321480888552a545dbaa8fb"




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
        error: function(jqXHR, textStatus, errorThrown) {
          console.error("AJAX error: " + textStatus + ' : ' + errorThrown);
          alert("Error retrieving your location, please try again.");
        }
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
               
              cityPopulation +
              "</i></div>",
            { direction: "top", sticky: true }
          )
          .addTo(cities);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error fetching cities data: " + textStatus + ' : ' + errorThrown);
      alert('Error retrieving city data due to network error. Please try again.');
    }
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
      var data = response.data.earthquakes;

      for (let i = 0; i < data.length; i++) {
        let earthquakeLat = data[i].lat;
        let earthquakeLng = data[i].lng;
        let earthquakeMagnitude = data[i].magnitude;
        let earthquakeTime = data[i].datetime;
        let formattedTime = moment(earthquakeTime).format("MMMM Do, YYYY");

        L.marker([earthquakeLat, earthquakeLng], { icon: earthquakeIcon })
          .bindTooltip(
            `<div class=' card'>
              <div class='card-body'>
                <p class='card-text'>
                  <small class='text-muted'>${formattedTime}</small><br>
                  <small>${earthquakeMagnitude} Magnitude</small>
                </p>
              </div>
            </div>`,
            { className: "bootstrap-tooltip", direction: "top", sticky: true }
          )
          .addTo(earthquakes);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error fetching earthquake data:", textStatus, errorThrown);
      alert('Error retrieving earthquake data.');
    }
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
      
      var weatherData = response.data.weatherObservations;
      for (let i = 0; i < weatherData.length; i++) {
        var weatherLat = weatherData[i].lat;
        var weatherLng = weatherData[i].lng;
        var weatherStation = weatherData[i].stationName;
        var weatherTemp = weatherData[i].temperature;
        var weatherClouds = weatherData[i].clouds;
        var Observation = weatherData[i].observation;
        
        var weatherDateTime = moment(weatherData[i].datetime).format("MMMM Do, YYYY")  ;

        L.marker([weatherLat, weatherLng], {
          icon: weatherIcon,
        })
          .bindTooltip(
            `<div class='card border-0 shadow-sm'>
              <div class='card-body'>
                <h6 class='card-title text-primary'><strong>${weatherStation}</strong></h6>
                <p class='card-text'>
                  <small class='text-muted'>${weatherTemp} °C</small><br>
                  <small>${weatherClouds}</small><br>
                  <small>Observation: ${Observation}</small><br>
                  <small class='text-muted'>${weatherDateTime}</small>
                </p>
              </div>
            </div>`,
            { className: "bootstrap-tooltip", direction: "top", sticky: true }
          )
          .addTo(weather_Observations);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error fetching weather observations: ", textStatus, errorThrown);
    }
  });
}

function updateConversionResult(conversionRate) {
  var amount = $("#fromamount").val();
  var calculateConversion = amount * conversionRate;
  $("#exchangeresults").text(calculateConversion.toFixed(2)); 
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

      var $currencySelect = $("#currencySelect");
      $currencySelect.empty(); 
  
      $.each(conversionRates, function (code, rate) {
        $currencySelect.append(
          $("<option>").text(code).attr("value", code)
        );
      });

 
      lastUpdated = calculateDate(lastUpdated);
      $("#exchangeupdatedon").val(lastUpdated); 

     
      $('label[for="fromamount"]').text(currencyCode);

      $currencySelect.on("change", function () {
        var selectedCurrency = $(this).val();
        var conversionRate = conversionRates[selectedCurrency];
        updateConversionResult(conversionRate);
      });

      
      $("#fromamount").on("input", function () {
        var selectedCurrency = $currencySelect.val();
        var conversionRate = conversionRates[selectedCurrency];
        updateConversionResult(conversionRate);
      });

    
      $currencySelect.trigger("change");
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function updateConversionResult(conversionRate) {
  var amount = parseFloat($('#fromamount').val());
  var result = amount * conversionRate;
  $('#exchangeresults').val(result.toFixed(2));
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
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching country info:", textStatus, errorThrown);
      alert('Failed to retrieve country data due to network error. Please try again.');
    }
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
  
      var location = response.data.location;
      var current = response.data.current;
      var forecast = response.data.forecast.forecastday;

      $('#weatherModalLabel').text(`${location.name}, ${location.country}`);
      $('#currentWeatherIcon').attr('src', `https:${current.condition.icon}`);
      $('.currentTemp').text(`${Math.round(current.temp_c)}°C`);
      $('.currentCondition').text(current.condition.text);
      $('#lastUpdated').text(`Updated ${calculateDate(current.last_updated)}. Powered by WeatherAPI.com`);

      
      $('.daily-forecast-container').empty();

      updateWeatherBackground(current.condition.text.toLowerCase());

      for (let i = 1; i < forecast.length; i++) {
        var dayForecast = forecast[i];
        var dayElement = `
          <div class="col">
            <div class="text-center">
              <p class="mb-0">${moment(dayForecast.date).format('ddd Do')}</p>
              <img src="https:${dayForecast.day.condition.icon}" alt="Weather Icon" class="weather-icon-small mb-1">
              <p class="mb-0">${Math.round(dayForecast.day.maxtemp_c)}°C</p>
              <p class="text-white-50">${Math.round(dayForecast.day.mintemp_c)}°C</p>
            </div>
          </div>
        `;

        $('.daily-forecast-container').append(dayElement);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching weather data: ", textStatus, errorThrown);
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

function calculateDate(time) {
  const date = new Date(time);
  const secondsPast = (new Date() - date) / 1000;
  let relativeTime = '';

  if (secondsPast < 60) {
    relativeTime = 'just now';
  } else if (secondsPast < 3600) {
    relativeTime = `${Math.floor(secondsPast / 60)} minutes ago`;
  } else if (secondsPast < 86400) {
    relativeTime = `${Math.floor(secondsPast / 3600)} hours ago`;
  } else {
    const days = Math.floor(secondsPast / 86400);
    relativeTime = days === 1 ? `${days} day ago` : `${days} days ago`;
  }

  return relativeTime;
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
      
      var articles = response.data.articles;
      var listContainer = $('#newsArticlesList');
      listContainer.empty();

      var defaultNews = 'img/defaultNews.jpg'

      articles.forEach(function(article) {
        var author = article.author || 'Unknown author';
        var title = article.title;
        var url = article.url;
        var imageUrl = article.urlToImage ? article.urlToImage : defaultNews;
        var date = calculateDate(article.publishedAt)
       
        
        var articleHtml = `
          <div class="card mb-3">
            <a href="${url}" target="_blank">
            <img src="${imageUrl}" class="card-img-top" alt="${title}">
            <div class="text-center card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${author}</p>
              <p class="card-text"><small class="text-muted">${date}</small></p>
            </div>
            </a>
          </div>
        `;

        listContainer.append(articleHtml);
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching news data: ", textStatus, errorThrown);
    }
  });
}




$(document).ready(function () {

  setTimeout(function() {
    $("#preloader").fadeOut("slow", function() {
        $(this).remove(); 
    });
  }, 1500); 

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

