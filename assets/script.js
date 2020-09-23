var userInput = $("#serchNow");
var intialUrlBuild;
var forcaseWeatherObj;
var citySearchHistory = [];

$("#searchBtn").on("click", function (e) {
  e.preventDefault();
  renderDisplay();
  console.log("I got clicked");
  var userInputText = $("#serchNow").val().trim().toLowerCase();
  console.log(userInputText);

  if (userInputText < 1) {
    console.log("Nothing to search");
  } else {
    if (citySearchHistory.includes(userInputText)) {
      var displayCity = userInputText ;
      var firstDisplayCity = displayCity.charAt(0).toUpperCase();
      var pascalCity = firstDisplayCity + displayCity.substring(1);
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
// Get the city current Weather
function getCityLonLat(o) {
  intialUrlBuild = o.toString();
  var cityName = intialUrlBuild.trim();
  console.log(cityName);

  var queryForcast =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
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
    forcaseWeatherObj = { cityName: c, response: response };
    localStorage.setItem("lastForcast", JSON.stringify(forcaseWeatherObj));
    displayCurrentWeather(response);
  });
}

// Display current Weather
function displayCurrentWeather(z) {
  displayForecastWeahter(z);
  var currentIcon =
    "http://openweathermap.org/img/w/" + z.current.weather[0].icon + ".png";
  $("#currentWicon").attr("src", currentIcon);
  $("#currenttemp")
    .text(tempKtoFConverter(z.current.temp) + " °F")
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
      "http://openweathermap.org/img/w/" +
        b.daily[i + 1].weather[0].icon +
        ".png"
    );
  }
}

// Adding the city button to the search list
function generateButton(u) {
  var lowerCaseU = u.toLowerCase();
  var pascalU = lowerCaseU.charAt(0).toUpperCase();
  var remainderCity = pascalU + lowerCaseU.substring(1);
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

function tempKtoFConverter(k) {
  var tempInK = k;
  var tempInF = (tempInK - 273.15) * (9 / 5) + 32;
  console.log(tempInF);
  return tempInF.toFixed(2);
}

// Reseach City history buttons
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
  $(".fcDay").empty();
  $(".fcImg").empty();
  $(".fcTemp").empty();
  $(".fcHum").empty();
}

// Initializing the Page
function intializePage() {
  var getSavedForcastObj =
    JSON.parse(localStorage.getItem("lastForcast")) || {};
  if (getSavedForcastObj.cityName == undefined) {
    console.log("Nothing Saved in the memory");
  } else {
    console.log(getSavedForcastObj);
    var intialTime = moment().format("MMMM Do YYYY");
    getCityLonLat(getSavedForcastObj.cityName);
    var initialCity = getSavedForcastObj.cityName;
    var initialPascalCity = initialCity.charAt(0).toUpperCase();
    var presentCity = initialPascalCity + initialCity.substring(1);
    $("#cityHeaderInfo")
      .text(presentCity + " " + "(" + intialTime + ")")
      .css({ "font-weight": "bold" });
  }
}

intializePage();
