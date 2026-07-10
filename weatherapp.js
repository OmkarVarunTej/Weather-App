const weatherForm = document.querySelector('.weather-form');
const cityInput = document.querySelector('.cityInput');
const card = document.querySelector('.weather-container');
const content = document.querySelector('.weather-content');
const loader = document.querySelector('.weather-loader');
const apiKey = 'f396b1b9a9f672621f8049f145529945'; // Use Your Own Weather API Key from OpenWeatherMap 
let clockInterval;

weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();

    if (!cityName) {
        displayError('Please enter a city name.');
        return;
    }

    setLoadingState(true);

    try {
        const weatherData = await getWeatherData(cityName);
        displayWeatherInfo(weatherData);
    } catch (error) {
        displayError(error.message);
    } finally {
        setLoadingState(false);
    }
});

async function getWeatherData(cityName) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling.');
        }

        if (response.status === 401) {
            throw new Error('The weather API key is invalid or not active yet.');
        }

        throw new Error('Could not fetch the weather. Please try again.');
    }

    return response.json();
}

function displayWeatherInfo(data) {
    const {
        name,
        main: {temp, humidity: humidityValue},
        weather: [{description, id}],
        timezone
    } = data;

    content.innerHTML = '';
    content.hidden = false;
    card.style.display = 'flex';
    card.classList.remove('is-loading');

    const cityNameEl = document.createElement('h2');
    const localTimeEl = document.createElement('p');
    const temperatureEl = document.createElement('p');
    const humidityEl = document.createElement('p');
    const descriptionEl = document.createElement('p');
    const weatherEmoji = document.createElement('p');

    cityNameEl.textContent = name;
    temperatureEl.textContent = Math.round(temp);
    humidityEl.textContent = humidityValue;
    descriptionEl.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    cityNameEl.classList.add('cityName');
    localTimeEl.classList.add('localTime');
    temperatureEl.classList.add('temperature');
    humidityEl.classList.add('humidity');
    descriptionEl.classList.add('description');
    weatherEmoji.classList.add('weatherEmoji');

    content.append(cityNameEl, localTimeEl, temperatureEl, humidityEl, descriptionEl, weatherEmoji);

    startClock(timezone, localTimeEl);
}

function startClock(timezoneOffset, element) {
    if (clockInterval) {
        clearInterval(clockInterval);
    }

    const updateTime = () => {
        const now = new Date();
        const targetTimestamp = now.getTime() + (timezoneOffset * 1000);
        const targetDate = new Date(targetTimestamp);
        
        const options = {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'UTC'
        };
        
        const timeString = new Intl.DateTimeFormat('en-US', options).format(targetDate);
        element.textContent = `🕒 ${timeString}`;
    };

    updateTime();
    clockInterval = setInterval(updateTime, 1000);
}


function getWeatherEmoji(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return '\u26C8\uFE0F';
    if (weatherId >= 300 && weatherId < 400) return '\uD83C\uDF26\uFE0F';
    if (weatherId >= 500 && weatherId < 600) return '\uD83C\uDF27\uFE0F';
    if (weatherId >= 600 && weatherId < 700) return '\u2744\uFE0F';
    if (weatherId >= 700 && weatherId < 800) return '\uD83C\uDF2B\uFE0F';
    if (weatherId === 800) return '\u2600\uFE0F';
    if (weatherId > 800 && weatherId < 900) return '\u2601\uFE0F';
    return '\u2753';
}

function displayError(message) {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    const error = document.createElement('p');
    error.classList.add('error');
    error.textContent = message;

    content.innerHTML = '';
    content.hidden = false;
    card.style.display = 'flex';
    card.classList.remove('is-loading');
    content.appendChild(error);
}

function setLoadingState(isLoading) {
    const button = weatherForm.querySelector('.fetchWeatherBtn');
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Loading...' : 'Get Weather';

    card.style.display = 'flex';
    loader.hidden = !isLoading;
    content.hidden = isLoading;
    card.classList.toggle('is-loading', isLoading);

    if (isLoading) {
        content.innerHTML = '';
        if (clockInterval) {
            clearInterval(clockInterval);
        }
    }
}
