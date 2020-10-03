var userInput = $("#serchNow");
var citySeachBtn = $("#searchBtn");
var intialUrlBuild;
var forcaseWeatherObj;
var citySearchHistory = [];

// click event on the search button
$("#searchBtn").on("click", function (e) {
  e.preventDefault();
  console.log("I got clicked");
  renderDisplay();
  var userInputText = $("#serchNow").val().trim().toLowerCase();
  $(citySeachBtn).prop('disabled', true);
  if (userInputText < 1) {
    console.log("Nothing to search");
  } else {
    if (citySearchHistory.includes(userInputText)) {
      var pascalCity = pascalWordConverter(userInputText);
      $("#cityHeaderInfo")
        .text(pascalCity + " " + "(" + moment().format("MM/DD/YYYY") + ")")
        .css({ "font-weight": "bold" });
      getCityLonLat(userInputText);
    } else {
      console.log("We got the city");
      citySearchHistory.push(userInputText);
      console.log(citySearchHistory);
      generateButton(userInputText);
      getCityLonLat(userInputText);
    }
  }
});
// Get the city lon and lat from Weather api  
function getCityLonLat(o) {
  intialUrlBuild = o.toString();
  var cityName = intialUrlBuild.trim();
  console.log(cityName);

  var queryForcast =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&APPID=2b07208e40c4f732c8daffed5bf88d24";
  console.log(queryForcast);

  $.ajax({
    url: queryForcast,
    method: "GET",
  }).then(function (x) {
    currentWeatherObj = x;
    console.log(x);
    console.log(x.coord.lon, x.coord.lat);
    getCityForcast(x.coord.lat, x.coord.lon, cityName);
  });
}

// Get the City forcast
function getCityForcast(p, v, c) {
  var queryForcast =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    p +
    "&lon=" +
    v +
    "&exclude=minutely,hourly&appid=2b07208e40c4f732c8daffed5bf88d24";

  console.log(queryForcast);

  $.ajax({
    url: queryForcast,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    forcaseWeatherObj = { cityName: c, response: response };
    localStorage.setItem("lastForcast", JSON.stringify(forcaseWeatherObj));
    displayCurrentWeather(response);
  });
}

// Display current Weather
function displayCurrentWeather(z) {
  displayForecastWeahter(z);
  var currentIcon =
    "https://openweathermap.org/img/w/" + z.current.weather[0].icon + ".png";
  $("#currentWicon").attr("src", currentIcon);
  $("#currentWicon").attr("alt", "Weather Icon");
  $("#currenttemp")
    .text(tempKtoFConverter(z.current.temp) + " °F")
    console.log(z.current.temp);
    .css({ "font-weight": "bold" });
  $("#currenthumidity")
    .text(z.current.humidity + " %")
    .css({ "font-weight": "bold" });
  $("#currentwind")
    .text(z.current.wind_speed + " MPH")
    .css({ "font-weight": "bold" });
  var uvIndex = z.current.uvi;
  $("#uvIndexDisplay").text(uvIndex).css({ "font-weight": "bold" });
  console.log(uvIndex);
  if (uvIndex <= 2) {
    $("#uvIndexDisplay").attr("class", "green");
  } else if (uvIndex > 2 && uvIndex <= 5) {
    $("#uvIndexDisplay").attr("class", "yellow");
  } else if (uvIndex > 5 && uvIndex <= 7) {
    $("#uvIndexDisplay").attr("class", "orange");
  } else if (uvIndex > 7 && uvIndex <= 10) {
    $("#uvIndexDisplay").attr("class", "red");
  } else if (uvIndex > 10) {
    $("#uvIndexDisplay").attr("class", "purple");
  }
}

// Display ForeCastWeather
function displayForecastWeahter(b) {
  var forcastDaysElements = $(".fcDay");
  var forcastImg = $(".fcImg");
  var forcastTempElements = $(".fcTemp");
  var forcastHumElements = $(".fcHum");

  for (var i = 0; i < forcastDaysElements.length; i++) {
    $(forcastDaysElements[i]).text(
      moment()
        .add(i + 1, "day")
        .format("MM/DD/YYYY")
    );
    $(forcastTempElements[i]).text(
      tempKtoFConverter(b.daily[i + 1].temp.day) + " °F"
    );
    $(forcastHumElements[i]).text(b.daily[i + 1].humidity + " %");
    $(forcastImg[i]).attr(
      "src",
      "https://openweathermap.org/img/w/" +
      b.daily[i + 1].weather[0].icon +
      ".png"
    )
    $(forcastImg[i]).attr("alt", "Weather Icon");
    ;
  }
}

// Adding the city button to the search list
function generateButton(u) {
  var remainderCity = pascalWordConverter(u);
  var time = moment().format("MMMM Do YYYY");
  console.log(time);
  console.log();
  var addCity = $("<button type='button' class='btn btn-light cityList'>");
  var addCityText = $(addCity).text(remainderCity);
  $("#listCitySec").prepend(addCity);
  var time = moment().format("MM/DD/YYYY");
  $("#cityHeaderInfo")
    .text(remainderCity + " " + "(" + time + ")")
    .css({ "font-weight": "bold" });
  clearInputField();
}

// Clear the input field after City Button is added
function clearInputField() {
  $("#serchNow").val("");
}

// Temp Kalvin to F converter
function tempKtoFConverter(k) {
  var tempInK = k;
  var tempInF = (tempInK - 273.15) * (9 / 5) + 32;
  console.log(tempInF);
  return tempInF.toFixed(2);
}

// Reseach City history buttons' event
$("#listCitySec").on("click", ".cityList", function () {
  renderDisplay();
  var cityFromButton = this.innerText.toString();
  getCityLonLat(cityFromButton);
  $("#cityHeaderInfo")
    .text(cityFromButton + " " + "(" + moment().format("MM/DD/YYYY") + ")")
    .css({ "font-weight": "bold" });
});

// Render Display on click events for both research and city history buttons
function renderDisplay() {
  $("#cityHeaderInfo").empty();
  $("#currentWicon").attr("src", "");
  $("#currenttemp").empty();
  $("#currenthumidity").empty();
  $("#currentwind").empty();
  $("#uvIndexDisplay").empty();
  $("#uvIndexDisplay").attr("class", "noBackGround");
  $(".fcDay").empty();
  $(".fcImg").empty();
  $(".fcTemp").empty();
  $(".fcHum").empty();
}

// Disabling the search button when there is no input delivered by the client
$("#serchNow").keyup(function () {
  var checkingInput = $("#serchNow").val().trim();
  console.log(checkingInput);
  if (checkingInput.length < 1) {
    $(citySeachBtn).prop('disabled', true);
  }
  else {
    $(citySeachBtn).prop('disabled', false);
  }
});

// Pascal style words converter
function pascalWordConverter(w) {
  var wFirstLetter = w.charAt(0).toUpperCase();
  var wPascal = wFirstLetter + w.substring(1);
  return wPascal;
}


// Get current location lon lat and city name in to display incase no search was conducted in the first place
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
  else {
    console.log("we not permitted to get the location");;
  }
}
function showPosition(position) {
  var locationLat = position.coords.latitude;
  var locationLon = position.coords.longitude;
  console.log("Your coordinates are Latitude: " + locationLat + " Longitude " + locationLon);
  getCityName(locationLat, locationLon);
}
// get city name from Weahter API using lon and lat
function getCityName(la, lo) {

  var queryLonLat =
    "https://api.openweathermap.org/data/2.5/weather?lat=" + la + "&lon=" + lo + "&APPID=2b07208e40c4f732c8daffed5bf88d24";
  console.log(queryLonLat);

  $.ajax({
    url: queryLonLat,
    method: "GET",
  }).then(function (rr) {
    console.log(rr);
    console.log(rr.coord.lon, rr.coord.lat, rr.name);
    getCityForcast(rr.coord.lon, rr.coord.lat, rr.name);
    $("#cityHeaderInfo")
      .text(rr.name + " " + "(" + moment().format("MM/DD/YYYY") + ")")
      .css({ "font-weight": "bold" });
  });
}


// Initializing the Page
function intializePage() {
  var getSavedForcastObj =
    JSON.parse(localStorage.getItem("lastForcast")) || {};
  if (getSavedForcastObj.cityName == undefined) {
    console.log("Nothing Saved in the memory");
    getLocation();
  } else {
    console.log(getSavedForcastObj);
    var intialTime = moment().format("MMMM Do YYYY");
    getCityLonLat(getSavedForcastObj.cityName);
    var initialCity = getSavedForcastObj.cityName;
    var presentCity = pascalWordConverter(initialCity);
    $("#cityHeaderInfo")
      .text(presentCity + " " + "(" + intialTime + ")")
      .css({ "font-weight": "bold" });
  }
}

intializePage();
