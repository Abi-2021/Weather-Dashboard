const API_KEY = 'db20263da31c4760e1532b4024aca3fb';

// Elements
const searchInputEl = document.querySelector('#searchTerm');
const searchFormEl = document.querySelector('#search');
const searchCityContainerEl = document.querySelector('#search_city_container');

async function getGeoCoordinates(address) {
  const url =
    'http://api.openweathermap.org/geo/1.0/direct?q=' +
    address +
    '&limit=1&appid=' +
    API_KEY;

  const response = await axios.get(url);
  const data = response.data;
  if (data.length === 0) {
    alert('Not a valid city');
    return;
  }
  const obj = { [address]: address };
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || {};
  if (searchHistory) {
    localStorage.setItem(
      'searchHistory',
      JSON.stringify({ ...searchHistory, ...obj })
    );
  } else {
    localStorage.setItem('searchHistory', JSON.stringify(obj));
  }
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
  };
}

async function getWeatherData(geoCoordinates) {
  const lat = 'lat=' + geoCoordinates.lat;
  const lon = 'lon=' + geoCoordinates.lon;
  const url =
    'https://api.openweathermap.org/data/2.5/onecall?' +
    lat +
    '&' +
    lon +
    '&exclude={part}&appid=' +
    API_KEY;
  const response = await axios.get(url);
  const data = response.data;
  return data;
}

function extractDateFromDt(unixTimestamp) {
  return new Date(unixTimestamp * 1000)
    .toLocaleDateString('en-US')
    .split(',')[0];
}

function display(data, cityName) {
  const cityEl = document.querySelector('#city');
  const dateEl = document.querySelector('#date');
  cityEl.textContent = cityName;
  dateEl.textContent = extractDateFromDt(data.current.dt);

  const tempEl = document.querySelector('#temp');
  tempEl.textContent = (data.current.temp - 273.15).toFixed(2);

  const windEl = document.querySelector('#wind');
  windEl.textContent = data.current.wind_speed;

  const humidityEl = document.querySelector('#humidity');
  humidityEl.textContent = data.current.humidity;

  const uvIndexValue = data.current.uvi;
  const uv_indexEl = document.querySelector('#uv_index');
  uv_indexEl.textContent = uvIndexValue;
  determineUvIndexSeverity(uvIndexValue, uv_indexEl);

  const daysCount = 5;
  const dailyData = data.daily;
  for (let i = 1; i <= daysCount; i++) {
    const dateEl = document.querySelector('#date_' + i);
    dateEl.textContent = extractDateFromDt(dailyData[i].dt);

    const iconEl = document.querySelector('#icon_' + i);
    iconEl.src =
      'https://openweathermap.org/img/wn/' +
      dailyData[i].weather[0].icon +
      '@2x.png';
    const windEl = document.querySelector('#wind_' + i);
    windEl.textContent = dailyData[i].wind_speed;

    const humidityEl = document.querySelector('#humidity_' + i);
    humidityEl.textContent = dailyData[i].humidity;
  }

  const todayForecastSectionEl = document.querySelector('.today_forecast');
  todayForecastSectionEl.classList.remove('hide');

  const fiveDayForecastSectionEl = document.querySelector('.five_day_forecast');
  fiveDayForecastSectionEl.classList.remove('hide');
}

function determineUvIndexSeverity(uvIndexValue, uv_indexEl) {
  if (uvIndexValue < 3) {
    uv_indexEl.classList.add('favourable');
    uv_indexEl.classList.remove('moderate');
    uv_indexEl.classList.remove('severe');
  } else if (uvIndexValue >= 3 && uvIndexValue < 6) {
    uv_indexEl.classList.add('moderate');
    uv_indexEl.classList.remove('favourable');
    uv_indexEl.classList.remove('severe');
  } else {
    uv_indexEl.classList.add('severe');
    uv_indexEl.classList.remove('favourable');
    uv_indexEl.classList.remove('moderate');
  }
}

async function searchFormHandler(event) {
  event.preventDefault();
  const enteredValue = searchInputEl.value.trim();

  if (!enteredValue) {
    alert('Must enter a value!');
    return;
  }

  const geoCoordinates = await getGeoCoordinates(enteredValue);
  const weatherData = await getWeatherData(geoCoordinates);
  display(weatherData, geoCoordinates.name);
  searchInputEl.value = '';
  displayPreviousCity();
}

function displayPreviousCity() {
  searchCityContainerEl.innerHTML = '';
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || {};

  const cities = Object.values(searchHistory);

  for (let i = 0; i < cities.length; i++) {
    const cityEl = document.createElement('div');
    cityEl.textContent = cities[i];
    cityEl.classList.add('previousCity');
    cityEl.value = cities[i];
    searchCityContainerEl.appendChild(cityEl);
  }
}
async function searchCityContainerHandler(event) {
  if (event.target.classList.contains('previousCity')) {
    const city = event.target.value;
    const geoCoordinates = await getGeoCoordinates(city);
    const weatherData = await getWeatherData(geoCoordinates);
    display(weatherData, geoCoordinates.name);
  }
}
// event listeners
searchFormEl.addEventListener('submit', searchFormHandler);
searchCityContainerEl.addEventListener('click', searchCityContainerHandler);
displayPreviousCity();
