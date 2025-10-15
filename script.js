// API Keys
const openWeatherApiKey = '461c278e8c76b74ced7e63bd39ef827b';
const unsplashApiKey = 'w0fdy35tBHZyL80OhjoObbm67QvkG1_pJxLvIcuvqFI';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const weatherDesc = document.getElementById('weather-desc');
const temp = document.getElementById('temp');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const cityImage = document.getElementById('city-image');
const weatherIcon = document.getElementById('weather-icon');
const forecastContainer = document.getElementById('forecast-container');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const loading = document.getElementById('loading');
const body = document.body;

// State
let currentUnit = 'celsius';
let currentWeatherData = null;

// Event Listeners
searchBtn.addEventListener('click', getWeather);
locationBtn.addEventListener('click', getWeatherByLocation);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});
celsiusBtn.addEventListener('click', () => switchUnit('celsius'));
fahrenheitBtn.addEventListener('click', () => switchUnit('fahrenheit'));

// Main function to get weather data
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        // Get weather data
        const weatherData = await fetchWeatherData(city);
        currentWeatherData = weatherData;
        
        // Update UI with weather data
        updateWeatherUI(weatherData);
        
        // Get city image
        const imageUrl = await fetchCityImage(city);
        cityImage.src = imageUrl;
        cityImage.alt = `Image of ${weatherData.name}`;
        
        // Get forecast data
        const forecastData = await fetchForecastData(city);
        updateForecastUI(forecastData);
        
        // Update background based on time of day
        updateBackground(weatherData);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please check the city name and try again.');
    } finally {
        hideLoading();
    }
}

// Get weather by current location
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Get weather data by coordinates
                const weatherData = await fetchWeatherByCoords(latitude, longitude);
                currentWeatherData = weatherData;
                
                // Update UI with weather data
                updateWeatherUI(weatherData);
                
                // Get city image
                const imageUrl = await fetchCityImage(weatherData.name);
                cityImage.src = imageUrl;
                cityImage.alt = `Image of ${weatherData.name}`;
                
                // Get forecast data
                const forecastData = await fetchForecastByCoords(latitude, longitude);
                updateForecastUI(forecastData);
                
                // Update background based on time of day
                updateBackground(weatherData);
                
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error fetching weather data for your location.');
            } finally {
                hideLoading();
            }
        },
        (error) => {
            hideLoading();
            alert('Unable to retrieve your location. Please allow location access or search for a city manually.');
            console.error('Geolocation error:', error);
        }
    );
}

// Fetch weather data by city name
async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('City not found');
    }
    
    return await response.json();
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Weather data not available for this location');
    }
    
    return await response.json();
}

// Fetch forecast data by city name
async function fetchForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Forecast data not available');
    }
    
    return await response.json();
}

// Fetch forecast data by coordinates
async function fetchForecastByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Forecast data not available for this location');
    }
    
    return await response.json();
}

// Fetch city image from Unsplash
async function fetchCityImage(city) {
    try {
        const url = `https://api.unsplash.com/photos/random?query=${city}&orientation=landscape&client_id=${unsplashApiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Image not found');
        }
        
        const data = await response.json();
        return data.urls.regular;
    } catch (error) {
        console.error('Error fetching image:', error);
        // Return a placeholder image if Unsplash fails
        return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    }
}

// Update weather UI with data
function updateWeatherUI(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherDesc.textContent = data.weather[0].description;
    
    // Update temperature based on current unit
    updateTemperature(data.main.temp);
    
    windSpeed.textContent = `${data.wind.speed} m/s`;
    humidity.textContent = `${data.main.humidity}%`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Update weather icon
    updateWeatherIcon(data.weather[0].icon, data.weather[0].main);
}

// Update temperature display based on current unit
function updateTemperature(tempCelsius) {
    if (currentUnit === 'celsius') {
        temp.textContent = `${Math.round(tempCelsius)}°C`;
    } else {
        const tempFahrenheit = (tempCelsius * 9/5) + 32;
        temp.textContent = `${Math.round(tempFahrenheit)}°F`;
    }
}

// Update weather icon
function updateWeatherIcon(iconCode, main) {
    const iconClass = getWeatherIconClass(iconCode, main);
    weatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
}

// Map OpenWeather icon codes to Font Awesome classes
function getWeatherIconClass(iconCode, main) {
    const iconMap = {
        '01d': 'fa-sun',           // clear sky day
        '01n': 'fa-moon',          // clear sky night
        '02d': 'fa-cloud-sun',     // few clouds day
        '02n': 'fa-cloud-moon',    // few clouds night
        '03d': 'fa-cloud',         // scattered clouds
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',         // broken clouds
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain',    // shower rain
        '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain',// rain day
        '10n': 'fa-cloud-moon-rain',// rain night
        '11d': 'fa-bolt',          // thunderstorm
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',     // snow
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',          // mist
        '50n': 'fa-smog'
    };
    
    return iconMap[iconCode] || 'fa-cloud';
}

// Update forecast UI
function updateForecastUI(forecastData) {
    // Clear previous forecast
    forecastContainer.innerHTML = '';
    
    // Group forecast by day and get one entry per day
    const dailyForecasts = getDailyForecasts(forecastData.list);
    
    // Create forecast elements for the next 5 days
    dailyForecasts.slice(0, 5).forEach(day => {
        const forecastElement = createForecastElement(day);
        forecastContainer.appendChild(forecastElement);
    });
}

// Group forecast data by day and get one entry per day
function getDailyForecasts(forecastList) {
    const dailyForecasts = [];
    const datesProcessed = [];
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString();
        
        // If we haven't processed this date yet, add it to our list
        if (!datesProcessed.includes(dateString)) {
            datesProcessed.push(dateString);
            dailyForecasts.push({
                date: date,
                temp: item.main.temp,
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                main: item.weather[0].main
            });
        }
    });
    
    return dailyForecasts;
}

// Create a forecast element for a day
function createForecastElement(day) {
    const forecastDay = document.createElement('div');
    forecastDay.className = 'forecast-day';
    
    const date = new Date(day.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dateString = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
    
    const iconClass = getWeatherIconClass(day.icon, day.main);
    
    let highTemp, lowTemp;
    if (currentUnit === 'celsius') {
        highTemp = Math.round(day.temp_max);
        lowTemp = Math.round(day.temp_min);
    } else {
        highTemp = Math.round((day.temp_max * 9/5) + 32);
        lowTemp = Math.round((day.temp_min * 9/5) + 32);
    }
    
    forecastDay.innerHTML = `
        <div class="forecast-date">${dateString}</div>
        <div class="forecast-icon"><i class="fas ${iconClass}"></i></div>
        <div class="forecast-temp">
            <span class="forecast-high">${highTemp}°</span>
            <span class="forecast-low">${lowTemp}°</span>
        </div>
    `;
    
    return forecastDay;
}

// Switch temperature unit
function switchUnit(unit) {
    if (unit === currentUnit) return;
    
    currentUnit = unit;
    
    // Update active button
    if (unit === 'celsius') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
    }
    
    // Update temperatures if we have data
    if (currentWeatherData) {
        updateTemperature(currentWeatherData.main.temp);
        updateForecastUI(currentWeatherData.forecast);
    }
}

// Update background based on time of day
function updateBackground(weatherData) {
    const currentTime = new Date().getTime() / 1000;
    const sunrise = weatherData.sys.sunrise;
    const sunset = weatherData.sys.sunset;
    
    if (currentTime > sunrise && currentTime < sunset) {
        body.classList.remove('night');
    } else {
        body.classList.add('night');
    }
}

// Show loading indicator
function showLoading() {
    loading.classList.remove('hidden');
}

// Hide loading indicator
function hideLoading() {
    loading.classList.add('hidden');
}

// Initialize app with a default city
window.addEventListener('DOMContentLoaded', () => {
    // Set default city or get from localStorage if available
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather();
    }
});

// Save last searched city to localStorage
cityInput.addEventListener('blur', () => {
    if (cityInput.value.trim()) {
        localStorage.setItem('lastSearchedCity', cityInput.value.trim());
    }
});
