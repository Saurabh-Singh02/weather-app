async function getWeather() {
    const cityInput = document.getElementById('city-input').value;
    const openWeatherApiKey = '461c278e8c76b74ced7e63bd39ef827b';
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${openWeatherApiKey}&units=metric`;

    try {
        const weatherResponse = await fetch(openWeatherApiUrl);
        const weatherData = await weatherResponse.json();

        console.log(weatherData);

        const cityName = document.getElementById('city-name');
        const weatherDesc = document.getElementById('weather-desc');
        const temperature = document.getElementById('temp');
        const cityImage = document.getElementById('city-image');

        cityName.textContent = weatherData.name;
        weatherDesc.textContent = weatherData.weather[0].description;
        temperature.textContent = `${weatherData.main.temp} °C`;

        const unsplashApiKey = 'w0fdy35tBHZyL80OhjoObbm67QvkG1_pJxLvIcuvqFI';
        const unsplashApiUrl = `https://api.unsplash.com/photos/random?query=${cityInput}&orientation=landscape&client_id=${unsplashApiKey}`;

        const imageResponse = await fetch(unsplashApiUrl);
        const imageData = await imageResponse.json();

        console.log(imageData);

        cityImage.src = imageData.urls.regular;
        cityImage.alt = `Image of ${weatherData.name}`;
    } catch (error) {
        console.log('Error fetching data:', error);
        alert('Error fetching data. Please try again.');
    }
}
