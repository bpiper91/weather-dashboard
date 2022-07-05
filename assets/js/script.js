// DOM ELEMENT SELECTOR VARIABLES
var searchButton = document.querySelector("#submit");
var inputElement = document.querySelector("#city-search");

// FUNCTIONS

// handle search button clicks
var searchButtonHandler = function(event) {
    event.preventDefault();

    // get name of city from search field
    var cityName = inputElement.value.trim();
    
    if (!cityName) {
        // if the city name is an empty string, alert to enter a city
        alert("Please enter a city name.");
        return false;
    } else {
        // otherwise, add the city name to localStorage...
        if (localStorage.getItem("savedCities")) {
            // if there are already saved city names, push the new search term
            savedCities = JSON.parse(localStorage.getItem("savedCities"));
            savedCities.push(cityName);
        } else {
            var savedCities = [cityName];
        };

        // save the new list of searched cities to local storage
        localStorage.setItem("savedCities", JSON.stringify(savedCities));

        // get the weather for the searched city
        getWeather(cityName);
    };
};

// look up weather in searched city
var getWeather = function(cityName) {
    console.log("search for weather in " + cityName);



    // pull list of previously searched cities from local storage
    if (localStorage.getItem("savedCities")) {
        savedCities = JSON.parse(localStorage.getItem("savedCities"));
    };
};

// listen for search button click
searchButton.addEventListener("click",searchButtonHandler);