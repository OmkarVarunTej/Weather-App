const weatherForm = document.querySelector('.weather-form');
const cityInput = document.querySelector('.cityInput');
const card = document.querySelector('.weather-container');
const apiKey = 'YOUR_API_KEY_HERE'; // Use Your Own Weather API Key from OpenWeatherMap 

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
        weather: [{description, id}]
    } = data;

    card.textContent = '';
    card.style.display = 'flex';

    const cityNameEl = document.createElement('h2');
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
    temperatureEl.classList.add('temperature');
    humidityEl.classList.add('humidity');
    descriptionEl.classList.add('description');
    weatherEmoji.classList.add('weatherEmoji');

    card.append(cityNameEl, temperatureEl, humidityEl, descriptionEl, weatherEmoji);
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
    const error = document.createElement('p');
    error.classList.add('error');
    error.textContent = message;

    card.textContent = '';
    card.style.display = 'flex';
    card.appendChild(error);
}

function setLoadingState(isLoading) {
    const button = weatherForm.querySelector('.fetchWeatherBtn');
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Loading...' : 'Get Weather';
}
