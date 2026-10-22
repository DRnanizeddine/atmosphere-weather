// Atmosphere Weather Dashboard JS Logic

// App State
let isCelsius = true;
let currentWeatherData = null;
let recentSearches = JSON.parse(localStorage.getItem('atmosphere_recent')) || ['London', 'Tokyo', 'New York'];

// DOM Elements
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const geoBtn = document.getElementById('geo-btn');
const recentCitiesContainer = document.getElementById('recent-cities');
const unitToggle = document.getElementById('unit-toggle');
const themeToggle = document.getElementById('theme-toggle');

const weatherCard = document.getElementById('weather-card');
const forecastSection = document.getElementById('forecast-section');
const forecastContainer = document.getElementById('forecast-container');
const placeholderState = document.getElementById('placeholder-state');

// Weather Details DOM
const locationName = document.getElementById('location-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const weatherIconLarge = document.getElementById('weather-icon-large');

const detailHumidity = document.getElementById('detail-humidity');
const detailWind = document.getElementById('detail-wind');
const detailPressure = document.getElementById('detail-pressure');
const detailVisibility = document.getElementById('detail-visibility');

// Weather Icon Mapping
const iconMap = {
    Clear: 'fa-sun text-amber-300',
    Clouds: 'fa-cloud text-sky-200',
    Rain: 'fa-cloud-showers-heavy text-blue-300',
    Drizzle: 'fa-cloud-rain text-blue-200',
    Thunderstorm: 'fa-bolt text-yellow-300',
    Snow: 'fa-snowflake text-indigo-100',
    Mist: 'fa-smog text-slate-300',
    Fog: 'fa-smog text-slate-300'
};

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-sky-600 text-white'
    };
    toast.className = `px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.remove('translate-y-2', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Simulated Mock API Weather Fetch (Runs seamlessly without needing external API keys)
function fetchWeatherData(city) {
    const mockDatabase = {
        tokyo: { name: 'Tokyo, JP', temp: 19, desc: 'Clouds', humidity: 55, wind: 14, pressure: 1018, visibility: 10 },
        london: { name: 'London, UK', temp: 14, desc: 'Rain', humidity: 82, wind: 22, pressure: 1009, visibility: 8 },
        paris: { name: 'Paris, FR', temp: 17, desc: 'Clear', humidity: 60, wind: 10, pressure: 1015, visibility: 10 },
        'new york': { name: 'New York, US', temp: 21, desc: 'Clear', humidity: 48, wind: 16, pressure: 1020, visibility: 10 },
    };

    const key = city.toLowerCase().trim();
    if (mockDatabase[key]) {
        return mockDatabase[key];
    }

    // Generate deterministic mock weather for any entered city name
    let hash = 0;
    for (let i = 0; i < city.length; i++) hash += city.charCodeAt(i);
    const temp = (hash % 25) + 5;
    const weatherTypes = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Snow', 'Mist'];
    const desc = weatherTypes[hash % weatherTypes.length];

    return {
        name: `${city.charAt(0).toUpperCase() + city.slice(1)}, World`,
        temp: temp,
        desc: desc,
        humidity: (hash % 40) + 40,
        wind: (hash % 20) + 5,
        pressure: 1000 + (hash % 30),
        visibility: 10
    };
}

function renderWeather(city) {
    const data = fetchWeatherData(city);
    currentWeatherData = data;

    // Remove placeholder state
    placeholderState.classList.add('hidden');
    weatherCard.classList.remove('hidden');
    forecastSection.classList.remove('hidden');

    // Current Date
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

    // Location & Temp
    locationName.textContent = data.name;
    updateTemperatureDisplay();

    weatherDesc.textContent = data.desc;
    
    // Icon
    const iconClass = iconMap[data.desc] || 'fa-cloud text-sky-200';
    weatherIconLarge.className = `fa-solid ${iconClass} text-7xl md:text-8xl drop-shadow-md`;

    // Metrics
    detailHumidity.textContent = `${data.humidity}%`;
    detailWind.textContent = `${data.wind} km/h`;
    detailPressure.textContent = `${data.pressure} hPa`;
    detailVisibility.textContent = `${data.visibility} km`;

    // Save Recent Search
    saveRecentSearch(data.name.split(',')[0]);
    renderForecast(data);
}

function renderForecast(baseData) {
    forecastContainer.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIndex = new Date().getDay();

    for (let i = 1; i <= 5; i++) {
        const dayName = days[(todayIndex + i) % 7];
        const variance = (i % 2 === 0 ? i : -i) * 2;
        const tempC = baseData.temp + variance;
        const displayTemp = isCelsius ? `${tempC}°C` : `${Math.round((tempC * 9/5) + 32)}°F`;

        const weatherTypes = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'];
        const desc = weatherTypes[(baseData.temp + i) % weatherTypes.length];
        const iconClass = iconMap[desc] || 'fa-cloud';

        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-center flex flex-col items-center justify-between gap-2 shadow-sm hover:shadow-md transition';
        card.innerHTML = `
            <p class="font-semibold text-sm">${dayName}</p>
            <i class="fa-solid ${iconClass} text-2xl text-sky-500 my-1"></i>
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">${desc}</p>
            <p class="text-base font-bold">${displayTemp}</p>
        `;
        forecastContainer.appendChild(card);
    }
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;
    const tempC = currentWeatherData.temp;
    if (isCelsius) {
        currentTemp.textContent = `${tempC}°C`;
        feelsLike.textContent = `Feels like ${tempC + 1}°C`;
    } else {
        const tempF = Math.round((tempC * 9/5) + 32);
        currentTemp.textContent = `${tempF}°F`;
        feelsLike.textContent = `Feels like ${tempF + 2}°F`;
    }
}

function saveRecentSearch(city) {
    if (!recentSearches.includes(city)) {
        recentSearches.unshift(city);
        if (recentSearches.length > 5) recentSearches.pop();
        localStorage.setItem('atmosphere_recent', JSON.stringify(recentSearches));
        renderRecentSearches();
    }
}

function renderRecentSearches() {
    recentCitiesContainer.innerHTML = '';
    recentSearches.forEach(city => {
        const badge = document.createElement('button');
        badge.className = 'px-2.5 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 rounded-lg text-xs font-medium transition';
        badge.textContent = city;
        badge.onclick = () => renderWeather(city);
        recentCitiesContainer.appendChild(badge);
    });
}

// Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        renderWeather(city);
        cityInput.value = '';
    }
});

geoBtn.addEventListener('click', () => {
    showToast('Fetching weather for your current location...', 'info');
    setTimeout(() => renderWeather('Paris'), 1000);
});

unitToggle.addEventListener('click', () => {
    isCelsius = !isCelsius;
    unitToggle.textContent = isCelsius ? '°C / °F' : '°F / °C';
    updateTemperatureDisplay();
    if (currentWeatherData) renderForecast(currentWeatherData);
});

// Theme Init
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Initial Setup
renderRecentSearches();
renderWeather('Tokyo');
