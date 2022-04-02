
var citySearchEl = document.getElementById("search")
var citySearchButton = document.getElementById("search-button")
var clearEl = document.getElementById("clear")
var nameEl = document.getElementById("city-search")
var currentPicture = document.getElementById("picture")
var currentTemperature = document.getElementById("temperature")
var currentHumidity = document.getElementById("humidity")
var currentWind = document.getElementById("wind")
var currentUv = document.getElementById("uv")
var searchHistory = document.getElementById("history")
var weekEl = document.getElementById("week-forecast")
var todaysWeather = document.getElementById("today's-weather")
let history = JSON.parse(localStorage.getItem("search")) || [];

// Assigning api key to const
const APIKey = "4253bc5e2147b614fe1510a5ddf5c0c5";



function k2f(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}

function getWeather(cityName) {
    // execute a current weather get request from open weather api
    
    const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
    axios.get(apiURL)
        .then(function(response) {

            todaysWeather.classList.remove("d-none");
            // current forecast
            const currentDate = new Date(response.data.dt*1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
            let weatherImage = response.data.weather[0].icon;
            currentPicture.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherImage + "@2x.png");
            currentPicture.setAttribute("alt", response.data.weather[0].description);
            currentTemperature.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
            currentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
            currentWind.innerHTML = "Wind: " + response.data.wind.speed + "MPH";
            

            let lat = response.data.coord.lat;
            let lon = response.data.coord.lon;
            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
            axios.get(UVQueryURL)
            .then(function(response) {
                    let UVIndex = document.createElement("span");
                    UVIndex.setAttribute("class", "badge badge-danger");
                    UVIndex.innerHTML = response.data[0].value;
                    currentUv.innerHTML = "UV Index: ";
                    currentUv.append(UVIndex);   
                });
            
            let cityId = response.data.id
            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
            axios.get(forecastQueryURL)
                .then(function(response) {
                    console.log(response);
                    var responseData = response.data;
                    var dailyData = responseData.daily;
                    weekEl.classList.remove("d-none");
                    //weekly forecast
                    const forecastEls = document.querySelectorAll(".forecast");
                    for (i = 0; i < forecastEls.length; i++) {
                        forecastEls[i].innerHTML = "";
                        const forecastIndex = i + 1;
                        const forecastDate = new Date(dailyData[forecastIndex].dt*1000);
                        const forecastDay = forecastDate.getDate();
                        const forecastMonth = forecastDate.getMonth() + 1;
                        const forecastYear = forecastDate.getFullYear();
                        const forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                        forecastEls[i].append(forecastDateEl);

                        const forecastWeatherEl = document.createElement("img");
                        forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + dailyData[forecastIndex].weather[0].icon + "@2x.png");

                        // console.log(dailyData[forecastIndex].weather[0].description);

                        forecastWeatherEl.setAttribute("alt", dailyData[forecastIndex].weather[0].description);
                        forecastEls[i].append(forecastWeatherEl);

                        const forecastWindEl = document.createElement("p");
                        forecastWindEl.innerHTML = "Wind: " + dailyData[forecastIndex].wind_speed + "MPH";
                        forecastEls[i].append(forecastWindEl);

                        const forecastTempEl = document.createElement("p");

                        // console.log(k2f(dailyData[forecastIndex].temp.day));

                        forecastTempEl.innerHTML = "Temp: " + k2f(dailyData[forecastIndex].temp.day) + " &#176F";
                        forecastEls[i].append(forecastTempEl);
                        const forecastHumidityEl = document.createElement("p");

                        // console.log(dailyData[forecastIndex].humidity)

                        forecastHumidityEl.innerHTML = "Humidity: " + dailyData[forecastIndex].humidity + "%";
                        forecastEls[i].append(forecastHumidityEl);

                    }
                })
        });
}


function Initial() {

    // get history from local storage
    citySearchButton.addEventListener("click", function() {
        const searchTerm = citySearchEl.value;
        getWeather(searchTerm);
        history.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(history));
        renderhistory();
    })

    
    
    function renderhistory() {
        searchHistory.innerHTML = "";
        for (let i = 0; i < history.length; i++) {
            const historyItem = document.createElement("input");
            console.log(historyItem)
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", history[i]);
            historyItem.addEventListener("click", function() {
                getWeather(historyItem.value);
            })
            searchHistory.append(historyItem);
        }
    }

    renderhistory();
    if (history.length > 0) {
        getWeather(history[history.length - 1]);
    }
    // clear history
    clearEl.addEventListener("click", function() {
        localStorage.clear();
        searchHistory = [];
        renderhistory();
    })
    
}


Initial();

