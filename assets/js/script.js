// DOM ELEMENT SELECTOR VARIABLES
var searchButton = document.querySelector("#submit");
var inputElement = document.querySelector("#city-search");
var resultsDiv = document.querySelector(".results");

// API VARIABLES
var apiKey = "2fe97bca221f6d95d8bfe21d3f54bbb1";
var directGeocodeUrl = "http://api.openweathermap.org/geo/1.0/direct?q=";
var weatherApiCall = "https://api.openweathermap.org/data/2.5/onecall?";
var weatherIconUrl = "http://openweathermap.org/img/wn/"
// var apiSuffix = "&limit=1&appid=" + apiKey

// FUNCTIONS
// handle search button clicks
var searchButtonHandler = function (event) {
    event.preventDefault();

    // get name of city from search field
    var cityName = inputElement.value.trim();
    inputElement.value = "";

    if (!cityName) {
        // if the city name is an empty string, alert to enter a city
        alert("Please enter a city name.");
        return false;
    } else {
        // get latitude and longitude based on city name
        fetch(directGeocodeUrl + cityName + "&limit=1&appid=" + apiKey)
            .then(function (response) {
                if (response.ok) {
                    // if response is good, pull data needed for weather request
                    response.json().then(function (data) {
                        // get latitude and longitude of city
                        cityName = data[0].name;
                        var latitude = data[0].lat;
                        var longitude = data[0].lon;

                        // create object to store city info
                        var cityObject = { city: cityName, lat: latitude, lon: longitude };
                        console.log(cityObject);

                        // store city in recent search terms
                        storeCity(cityObject);

                        // get the weather for the searched city
                        getWeather(cityObject);
                    });
                } else {
                    // if response is bad, alert user
                    alert("bad response to geocoding API call");
                };
            });
    };
};

// store search term
var storeCity = function (cityObject) {
    // check for an existing list of searched cities
    if (localStorage.getItem("savedCities")) {
        // if there are saved cities, get the list
        savedCities = JSON.parse(localStorage.getItem("savedCities"));

        // if the current city is already in the list, run get the weather
        for (i = 0; i < savedCities.length; i++) {
            if (cityObject.city.toLowerCase() === savedCities[i].city.toLowerCase()) {
                return false;
            };
        };
        // add current city to the list
        savedCities.push(cityObject);
    } else {
        // if there is no list, declare an array with the current city
        var savedCities = [cityObject];
    };
    // save the new list of searched cities to local storage
    localStorage.setItem("savedCities", JSON.stringify(savedCities));
};

// look up weather in searched city
var getWeather = function (cityObject) {
    // get weather data for city
    fetch(weatherApiCall + "lat=" + cityObject.lat + "&lon=" + cityObject.lon + "&units=imperial&appid=" + apiKey)
        .then(function (response) {
            if (response.ok) {
                // if response is good, pull weather data
                response.json().then(function (data) {

                    console.log(data);
                    // create current weather div and add to results section
                    var currentWeatherDiv = document.createElement("div");
                    currentWeatherDiv.setAttribute("class","current");
                    currentWeatherDiv.setAttribute("id","current");
                    resultsDiv.appendChild(currentWeatherDiv);

                    // create heading
                    var cityHeading = document.createElement("h2");
                    // parse date (10 digits: seconds since 1/1/1970)
                    var dateUTC = data.current.dt;
                    console.log("dateUTC = " + dateUTC);
                    var date = new Date(dateUTC * 1000);
                    console.log("date = " + date);
                    var month = parseInt(date.getMonth()) + 1;
                    var day = date.getDate();
                    var year = date.getFullYear();
                    cityHeading.textContent = cityObject.city + " (" + month + "/" + day + "/" + year + ")";
                    // append heading
                    currentWeatherDiv.appendChild(cityHeading);

                    // create icon
                    var iconImg = document.createElement("img");
                    iconImg.setAttribute("src", weatherIconUrl + data.current.weather[0].icon +"@2x.png");
                    iconImg.setAttribute("alt", data.current.weather[0].description);
                    iconImg.setAttribute("class", "current-icon");
                    currentWeatherDiv.appendChild(iconImg);

                    // add current temperature
                    var tempPara = document.createElement("p");
                    tempPara.innerHTML = "Temperature: " + data.current.temp + " &deg;F";
                    currentWeatherDiv.appendChild(tempPara);

                    // add current wind speed
                    var windPara = document.createElement("p");
                    windPara.textContent = "Wind: " + data.current.wind_speed + " MPH";
                    currentWeatherDiv.appendChild(windPara);

                    // add current humidity
                    var humidPara = document.createElement("p");
                    humidPara.textContent = "Humidity: " + data.current.humidity + "%";
                    currentWeatherDiv.appendChild(humidPara);

                    // add current UV index
                    var uvPara = document.createElement("p");
                    // determine UV index rating from data
                    if (data.current.uvi < 3) {
                        var uvRating = "favorable";
                    } else if (data.current.uvi < 6) {
                        var uvRating = "moderate";
                    } else {
                        var uvRating = "severe";
                    };
                    // style UV index based on rating
                    uvPara.innerHTML = "UV Index: <span class=" + uvRating + ">" + data.current.uvi + "</span>";
                    currentWeatherDiv.appendChild(uvPara);


















                });
            } else {
                alert("bad response to weather data API call")
            }
        });
};

// create clickable list of recent searches
var getSavedCities = function () {
    // if there's already a list of saved search terms, clear it
    if (document.querySelector("#saved-cities")) {
        document.querySelector("#saved-cities").remove();
    };

    // pull list of previously searched cities from local storage
    if (localStorage.getItem("savedCities")) {
        // get array of searched cities, if it exists
        savedCities = JSON.parse(localStorage.getItem("savedCities"));

        // check to see if there are recent search terms
        if (savedCities.length > 0) {

            // create div to list results
            var savedCitiesDiv = document.createElement("div");
            savedCitiesDiv.setAttribute("class", "saved-cities");
            savedCitiesDiv.setAttribute("id", "saved-cities");
            document.querySelector(".search").appendChild(savedCitiesDiv);

            // add each saved city to list below search button
            for (i = 0; i < savedCities.length; i++) {
                var newButton = document.createElement("button");
                newButton.textContent = savedCities[i].city;
                newButton.setAttribute("class", "btn");
                newButton.setAttribute("type", "button");
                // add to saved cities div
                document.querySelector(".saved-cities").appendChild(newButton);
            };
        };
    };
};

// FUNCTION CALLS
// load any recently searched cities
getSavedCities();

// listen for search button click
searchButton.addEventListener("click", searchButtonHandler);


// TO-DO:
// - add links to saved city buttons in getSavedCities
// - add hover/active?/focus? style to search button
// - add else action for unfilfilled promise
// - add disambiguation for common city names?