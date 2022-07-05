// DOM ELEMENT SELECTOR VARIABLES
var searchButton = document.querySelector("#submit");

// FUNCTIONS

// handle search button clicks
var searchButtonHandler = function(event) {
    if (!event.target.parent().children("#city-search").value()) {
        return false;
    } else {
        var city = event.target.parent().children("#city-search").value();
        getWeather(city);
    };
};

// look up weather in searched city
var getWeather = function(cityName) {

};

// listen for search button click
searchButton.addEventListener("click",searchButtonHandler);