// Elements
const searchInputEl = document.querySelector('#searchTerm');
const searchFormEl = document.querySelector('#search');

async function getGeoCoordinates(address) {
  const url =
    'http://api.openweathermap.org/geo/1.0/direct?q=' +
    address +
    '&limit=1&appid=16991ac51522a2ab91d2187ce05413e2';

  const response = await axios.get(url);
  const data = response.data;
  if (data.length === 0) alert('Not a valid city');

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
    '&exclude={part}&appid=16991ac51522a2ab91d2187ce05413e2';
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
  const cityEle = document.querySelector('#city');
  const dateEl = document.querySelector('#date');
  cityEle.textContent = cityName;
  dateEl.textContent = extractDateFromDt(data.current.dt);

  const tempEl = document.querySelector('#temp');
  tempEl.textContent = (data.current.temp - 273.15).toFixed(2);

  const windEl = document.querySelector('#wind');
  windEl.textContent = data.current.wind_speed;

  const humidityEl = document.querySelector('#humidity');
  humidityEl.textContent = data.current.humidity;

  const uv_indexEl = document.querySelector('#uv_index');
  uv_indexEl.textContent = data.current.uvi;

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
}

// event listeners
searchFormEl.addEventListener('submit', searchFormHandler);
