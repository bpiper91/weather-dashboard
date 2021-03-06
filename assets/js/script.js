// DOM ELEMENT SELECTOR VARIABLES
var searchButton = document.querySelector("#submit");
var inputElement = document.querySelector("#city-search");
var resultsDiv = document.querySelector(".results");

// API VARIABLES
var apiKey = config.API_KEY;
var directGeocodeUrl = "https://api.openweathermap.org/geo/1.0/direct?q=";
var weatherApiCall = "https://api.openweathermap.org/data/2.5/onecall?";
var weatherIconUrl = "https://openweathermap.org/img/wn/"

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
        fetch(directGeocodeUrl + cityName + "&limit=5&appid=" + apiKey)
            .then(function (response) {
                if (response.ok) {
                    // if response is good, pull data needed for weather request
                    response.json().then(function (data) {
                        console.log(data);
                        if (data.length > 1) {
                            // alert user to multiple cities with that name and prompt to choose
                            var promptText = "Your search returned multiple cities. Please enter a number to choose from the following country codes.\n"

                            // create prompt options
                            for (i = 0; i < data.length; i++) {
                                if (!data[i].state) {
                                    promptText = promptText + "\n" + (i + 1) + " - " + data[i].country;
                                } else {
                                    promptText = promptText + "\n" + (i + 1) + " - " + data[i].country + "-" + data[i].state;
                                };
                            };

                            var selectedIndex = prompt(promptText) - 1;
                            debugger;
                            // valideate response
                            if (selectedIndex === "") {
                                alert("That is not a valid selection. Please try your search again.")
                                return false;
                            } else if (!data[selectedIndex]) {
                                alert("That is not a valid selection. Please try your search again.")
                                return false;
                            } else {
                                // create object to store city info
                                if (data[selectedIndex].state) {
                                    // if it has state data, include it
                                    var cityObject = {
                                        city: data[selectedIndex].name,
                                        lat: data[selectedIndex].lat,
                                        lon: data[selectedIndex].lon,
                                        country: data[selectedIndex].country,
                                        state: data[selectedIndex].state
                                    };
                                } else {
                                    // if no state data, just store country
                                    var cityObject = {
                                        city: cityName,
                                        lat: data[selectedIndex].lat,
                                        lon: data[selectedIndex].lon,
                                        country: data[selectedIndex].country
                                    };
                                };
                            };
                            // store city in recent search terms
                            storeCity(cityObject);

                            // get new list of search terms
                            getSavedCities();

                            // get the weather for the searched city
                            getWeather(cityObject);

                        } else if (data.length === 1) {
                            // create object to store city info
                            var cityObject = {
                                city: data[0].name,
                                lat: data[0].lat,
                                lon: data[0].lon,
                                country: data[0].country
                            };

                            // store city in recent search terms
                            storeCity(cityObject);

                            // get new list of search terms
                            getSavedCities();

                            // get the weather for the searched city
                            getWeather(cityObject);
                        } else {
                            alert("City not found. Please try again using a different search term.");
                        };
                    });
                } else {
                    // if response is bad, alert user
                    alert("City not found. Please try again using a different search term.");
                };
            })
            .catch(function (error) {
                alert("Unable to connect to OpenWeather. Please check your connection or try again later.");
            });
    };
};

// store search term
var storeCity = function (cityObject) {
    // check for an existing list of searched cities
    if (localStorage.getItem("savedCities")) {
        // if there are saved cities, get the list
        savedCities = JSON.parse(localStorage.getItem("savedCities"));

        // if the current city is already in the list, just get the weather
        for (i = 0; i < savedCities.length; i++) {
            console.log("searched state: " + cityObject.state);
            console.log("saved state: " + savedCities[i].state);
            if (cityObject.city === savedCities[i].city && cityObject.state === savedCities[i].state) {
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

                    // if there's already weather displayed, remove it
                    if (document.querySelector("#current")) {
                        document.querySelector("#current").remove();
                    };
                    if (document.querySelector("#five-day")) {
                        document.querySelector("#five-day").remove();
                    }
                    if (document.querySelector("#future")) {
                        document.querySelector("#future").remove();
                    };

                    // create current weather div and add to results section
                    var currentWeatherDiv = document.createElement("div");
                    currentWeatherDiv.setAttribute("class", "current");
                    currentWeatherDiv.setAttribute("id", "current");
                    resultsDiv.appendChild(currentWeatherDiv);

                    // create heading
                    var cityHeading = document.createElement("h2");
                    // parse date (10 digits: seconds since 1/1/1970)
                    var dateUTC = data.current.dt;
                    var date = new Date(dateUTC * 1000);
                    var month = parseInt(date.getMonth()) + 1;
                    var day = date.getDate();
                    var year = date.getFullYear();
                    cityHeading.textContent = cityObject.city + " (" + month + "/" + day + "/" + year + ")";
                    // append heading
                    currentWeatherDiv.appendChild(cityHeading);

                    // create icon
                    var iconImg = document.createElement("img");
                    iconImg.setAttribute("src", weatherIconUrl + data.current.weather[0].icon + "@2x.png");
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

                    // add heading
                    var fiveDayHeading = document.createElement("h3");
                    fiveDayHeading.setAttribute("id", "five-day");
                    fiveDayHeading.textContent = "5-Day Forecast";
                    resultsDiv.appendChild(fiveDayHeading);

                    // create future weather div and add to results section
                    var futureWeatherDiv = document.createElement("div");
                    futureWeatherDiv.setAttribute("class", "row future");
                    futureWeatherDiv.setAttribute("id", "future");
                    resultsDiv.appendChild(futureWeatherDiv);

                    // add weather for next 5 days
                    for (i = 0; i < 5; i++) {
                        // create weather block
                        var weatherBlock = document.createElement("div");
                        weatherBlock.setAttribute("class", "col-sm-5 col-lg-3 col-xl-2 weather-block");
                        futureWeatherDiv.appendChild(weatherBlock);

                        // create date heading
                        var dateHeading = document.createElement("h4");
                        // parse date (10 digits: seconds since 1/1/1970)
                        var dateUTC = data.daily[i].dt;
                        var date = new Date(dateUTC * 1000);
                        var month = parseInt(date.getMonth()) + 1;
                        var day = date.getDate();
                        var year = date.getFullYear().toString().substr(2, 2);
                        dateHeading.textContent = month + "/" + day + "/" + year;
                        // add date heading to block
                        weatherBlock.appendChild(dateHeading);

                        // create icon and add to block
                        var futureIconImg = document.createElement("img");
                        futureIconImg.setAttribute("src", weatherIconUrl + data.daily[i].weather[0].icon + ".png");
                        futureIconImg.setAttribute("alt", data.daily[i].weather[0].description);
                        futureIconImg.setAttribute("class", "future-icon");
                        weatherBlock.appendChild(futureIconImg);

                        // add current temperature
                        var futureTempPara = document.createElement("p");
                        futureTempPara.innerHTML = "Temperature: " + data.daily[i].temp.day + "&nbsp;&deg;F";
                        weatherBlock.appendChild(futureTempPara);

                        // add current wind speed
                        var futureWindPara = document.createElement("p");
                        futureWindPara.innerHTML = "Wind: " + data.daily[i].wind_speed + "&nbsp;MPH";
                        weatherBlock.appendChild(futureWindPara);

                        // add current humidity
                        var futureHumidPara = document.createElement("p");
                        futureHumidPara.textContent = "Humidity: " + data.daily[i].humidity + "%";
                        weatherBlock.appendChild(futureHumidPara);

                        // add listener for clicking on recent search term
                        document.querySelector("#saved-cities").addEventListener("click", savedCitiesHandler);
                    };
                });
            } else {
                alert("Could not find weather data for selected city. Please try your search again.");
            }
        })
        .catch(function (error) {
            alert("Could not reach OpenWeather. Please try your search again later.");
        });
};

// when a recent search term is clicked, get data to make API call
var savedCitiesHandler = function (event) {
    if (event.target.className !== "btn") {
        // if the div was clicked but not a button, do nothing
        return false;
    } else {
        // otherwise, get city name and coordinates for city object
        var cityName = event.target.textContent;
        var latitude = event.target.dataset.lat;
        var longitude = event.target.dataset.lon;

        // create city object and call getWeather
        var cityObject = { city: cityName, lat: latitude, lon: longitude };
        getWeather(cityObject);
    }
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

            // check for duplicate names and append state if needed
            var duplicateNames = [];
            // check each array item against each other array item to find duplicates, then save index numbers of duplicates to array
            for (i = 0; i < savedCities.length - 1; i++) {
                for (j = i + 1; j < savedCities.length; j++) {
                    if (savedCities[i].city === savedCities[j].city) {
                        if (!duplicateNames.includes(i)) {
                            duplicateNames.push(i);
                        };
                        if (!duplicateNames.includes(j)) {
                            duplicateNames.push(j);
                        };
                    };
                };
            };

            // populate saved cities display object
            var savedCitiesToDisplay = []
            for (i = 0; i < savedCities.length; i++) {
                if (duplicateNames.includes(i)) {
                    // check for state data
                    if (savedCities[i].state && savedCities[i].state.length < 15) {
                        // if state name is short, create object with it
                        tempObject = {
                            city: savedCities[i].city + ", " + savedCities[i].state,
                            lat: savedCities[i].lat,
                            lon: savedCities[i].lon,
                            country: savedCities[i].country,
                            state: savedCities[i].state
                        };
                    } else if (savedCities[i].state && savedCities[i].state.length > 14) {
                        // if state name is long, shorten and create object with it
                        tempObject = {
                            city: savedCities[i].city + ", " + savedCities[i].state.substr(0,12) + "...",
                            lat: savedCities[i].lat,
                            lon: savedCities[i].lon,
                            country: savedCities[i].country,
                            state: savedCities[i].state
                        };
                    } else {
                        // if no state data, make object with country instead
                        tempObject = {
                            city: savedCities[i].city + ", " + savedCities[i].country,
                            lat: savedCities[i].lat,
                            lon: savedCities[i].lon,
                            country: savedCities[i].country,
                            state: savedCities[i].state
                        };
                    };
                    // add object to display array
                    savedCitiesToDisplay.push(tempObject);
                } else {
                    savedCitiesToDisplay.push(savedCities[i]);
                };
            };

            // create div to list results
            var savedCitiesDiv = document.createElement("div");
            savedCitiesDiv.setAttribute("class", "saved-cities");
            savedCitiesDiv.setAttribute("id", "saved-cities");
            document.querySelector(".search").appendChild(savedCitiesDiv);

            // add each saved city to list below search button
            for (i = 0; i < savedCitiesToDisplay.length; i++) {
                var newButton = document.createElement("button");
                newButton.textContent = savedCitiesToDisplay[i].city;
                newButton.setAttribute("class", "btn");
                newButton.setAttribute("type", "button");
                // set data atrributes with coordinates for API call
                newButton.setAttribute("data-lat", savedCitiesToDisplay[i].lat);
                newButton.setAttribute("data-lon", savedCitiesToDisplay[i].lon);
                // add to saved cities div
                document.querySelector(".saved-cities").appendChild(newButton);
            };
        };
    };
};

var checkSavedCities = function () {
    // add listener for clicking on recent search term
    if (document.querySelector("#saved-cities")) {
        document.querySelector("#saved-cities").addEventListener("click", savedCitiesHandler);
    };
};

// INITIAL FUNCTION CALLS
// load any recently searched cities
getSavedCities();
checkSavedCities();

// listen for search button click
searchButton.addEventListener("click", searchButtonHandler);

