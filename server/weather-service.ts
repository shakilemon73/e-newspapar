// Open-Meteo Weather Service for Bangladesh
// Real-time weather data integration

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    weather_code: string;
    wind_speed_10m: string;
  };
}

interface ForecastResponse {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
  };
}

interface GeocodeResponse {
  results: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1: string;
  }>;
}

// Weather code mapping to Bengali descriptions
const WEATHER_CODES: { [key: number]: { condition: string; icon: string } } = {
  0: { condition: "পরিষ্কার আকাশ", icon: "sunny" },
  1: { condition: "প্রায় পরিষ্কার", icon: "partly-cloudy" },
  2: { condition: "আংশিক মেঘলা", icon: "partly-cloudy" },
  3: { condition: "মেঘলা", icon: "cloudy" },
  45: { condition: "কুয়াশা", icon: "foggy" },
  48: { condition: "ঘন কুয়াশা", icon: "foggy" },
  51: { condition: "হালকা ঝিরিঝিরি", icon: "drizzle" },
  53: { condition: "মাঝারি ঝিরিঝিরি", icon: "drizzle" },
  55: { condition: "ভারী ঝিরিঝিরি", icon: "drizzle" },
  61: { condition: "হালকা বৃষ্টি", icon: "rainy" },
  63: { condition: "মাঝারি বৃষ্টি", icon: "rainy" },
  65: { condition: "ভারী বৃষ্টি", icon: "rainy" },
  71: { condition: "হালকা তুষারপাত", icon: "snowy" },
  73: { condition: "মাঝারি তুষারপাত", icon: "snowy" },
  75: { condition: "ভারী তুষারপাত", icon: "snowy" },
  80: { condition: "হালকা বর্ষণ", icon: "rainy" },
  81: { condition: "মাঝারি বর্ষণ", icon: "rainy" },
  82: { condition: "ভারী বর্ষণ", icon: "rainy" },
  95: { condition: "বজ্রপাত", icon: "thunderstorm" },
  96: { condition: "হালকা বজ্রঝড়", icon: "thunderstorm" },
  99: { condition: "ভারী বজ্রঝড়", icon: "thunderstorm" }
};

// Bengali cities with coordinates
const BENGALI_CITIES: { [key: string]: { lat: number; lon: number; bengali: string } } = {
  "dhaka": { lat: 23.7104, lon: 90.40744, bengali: "ঢাকা" },
  "chittagong": { lat: 22.3569, lon: 91.7832, bengali: "চট্টগ্রাম" },
  "khulna": { lat: 22.8456, lon: 89.5403, bengali: "খুলনা" },
  "rajshahi": { lat: 24.3745, lon: 88.6042, bengali: "রাজশাহী" },
  "sylhet": { lat: 24.8949, lon: 91.8687, bengali: "সিলেট" },
  "barisal": { lat: 22.7010, lon: 90.3535, bengali: "বরিশাল" },
  "rangpur": { lat: 25.7439, lon: 89.2752, bengali: "রংপুর" },
  "mymensingh": { lat: 24.7471, lon: 90.4203, bengali: "ময়মনসিংহ" }
};

class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private geocodeUrl = 'https://geocoding-api.open-meteo.com/v1';

  // Get current weather for a city (supports both English and Bengali names)
  async getCurrentWeather(cityName: string): Promise<any> {
    try {
      const city = cityName.toLowerCase();
      
      // First try direct English name lookup
      let coords = BENGALI_CITIES[city];
      let displayName = coords?.bengali || cityName;
      
      if (!coords) {
        // Try reverse lookup from Bengali name to English key
        const englishKey = this.findEnglishKeyFromBengali(cityName);
        if (englishKey) {
          coords = BENGALI_CITIES[englishKey];
          displayName = coords.bengali;
        }
      }
      
      if (!coords) {
        // If still not found, try geocoding
        const geocoded = await this.geocodeCity(cityName);
        if (!geocoded) {
          throw new Error(`City ${cityName} not found`);
        }
        return this.fetchWeatherByCoords(geocoded.lat, geocoded.lon, cityName);
      }

      return this.fetchWeatherByCoords(coords.lat, coords.lon, displayName);
    } catch (error) {
      console.error(`Error fetching weather for ${cityName}:`, error);
      throw error;
    }
  }

  // Find English key from Bengali city name
  private findEnglishKeyFromBengali(bengaliName: string): string | null {
    for (const [englishKey, cityData] of Object.entries(BENGALI_CITIES)) {
      if (cityData.bengali === bengaliName) {
        return englishKey;
      }
    }
    return null;
  }

  // Fetch weather by coordinates
  private async fetchWeatherByCoords(lat: number, lon: number, cityName: string): Promise<any> {
    const currentUrl = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=Asia/Dhaka`;
    
    const forecastUrl = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=Asia/Dhaka&forecast_days=3`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Weather API request failed');
      }

      const currentData: OpenMeteoResponse = await currentResponse.json();
      const forecastData: ForecastResponse = await forecastResponse.json();

      return this.formatWeatherData(currentData, forecastData, cityName);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Geocode city name to coordinates
  private async geocodeCity(cityName: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(`${this.geocodeUrl}/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      
      if (!response.ok) {
        return null;
      }

      const data: GeocodeResponse = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Format weather data for database storage
  private formatWeatherData(current: OpenMeteoResponse, forecast: ForecastResponse, cityName: string): any {
    const weatherCode = current.current.weather_code;
    const weather = WEATHER_CODES[weatherCode] || { condition: "অজানা", icon: "unknown" };

    // Format forecast data
    const forecastArray = forecast.daily.time.slice(0, 3).map((date, index) => ({
      day: this.formatDate(date, index),
      temperature: Math.round(forecast.daily.temperature_2m_max[index]),
      icon: WEATHER_CODES[forecast.daily.weather_code[index]]?.icon || "unknown",
      precipitation: Math.round(forecast.daily.precipitation_sum[index] || 0)
    }));

    return {
      city: cityName,
      temperature: Math.round(current.current.temperature_2m),
      condition: weather.condition,
      icon: weather.icon,
      forecast: JSON.stringify(forecastArray),
      updated_at: new Date().toISOString()
      // Note: humidity, windSpeed, windDirection, lastFetchTime removed 
      // until database schema is updated to include these columns
    };
  }

  // Format date to Bengali
  private formatDate(dateString: string, index: number): string {
    const bengaliDays = ["আজ", "আগামীকাল", "পরশু"];
    if (index < bengaliDays.length) {
      return bengaliDays[index];
    }
    
    const date = new Date(dateString);
    const bengaliWeekdays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    return bengaliWeekdays[date.getDay()];
  }

  // Get weather for all cities
  async getAllCitiesWeather(): Promise<any[]> {
    const weatherPromises = Object.keys(BENGALI_CITIES).map(async (cityKey) => {
      try {
        return await this.getCurrentWeather(cityKey);
      } catch (error) {
        console.error(`Failed to fetch weather for ${cityKey}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(weatherPromises);
    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
  }

  // Get weather by user's current location (coordinates)
  async getWeatherByLocation(lat: number, lon: number): Promise<any> {
    try {
      console.log(`[WeatherService] Fetching weather for location: ${lat}, ${lon}`);
      
      // First try to reverse geocode to get city name
      const cityName = await this.reverseGeocode(lat, lon);
      
      // Get weather data for the coordinates
      const weatherData = await this.fetchWeatherByCoords(lat, lon, cityName || 'আপনার অবস্থান');
      
      console.log(`[WeatherService] Successfully fetched weather for ${cityName}: ${weatherData.temperature}°C`);
      
      return {
        ...weatherData,
        isUserLocation: true,
        coordinates: { lat, lon }
      };
    } catch (error) {
      console.error('[WeatherService] Error fetching weather by location:', error);
      throw error;
    }
  }

  // Reverse geocode coordinates to city name
  private async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      // Check if coordinates match any of our predefined cities
      let closestCity = null;
      let minDistance = Infinity;
      
      for (const [cityKey, cityData] of Object.entries(BENGALI_CITIES)) {
        const distance = this.calculateDistance(lat, lon, cityData.lat, cityData.lon);
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = cityData.bengali;
        }
      }
      
      // If within 50km of a known city, use that
      if (minDistance < 50) {
        console.log(`[WeatherService] Location matched to ${closestCity} (${minDistance.toFixed(2)}km away)`);
        return closestCity;
      }
      
      // If not near any known city, return generic location name
      console.log(`[WeatherService] Location not near any known city (closest: ${closestCity} at ${minDistance.toFixed(2)}km)`);
      return 'আপনার অবস্থান';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'আপনার অবস্থান';
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Update weather data in database
  async updateWeatherInDatabase(storage: any): Promise<void> {
    try {
      console.log('[WeatherService] Starting weather update...');
      const weatherData = await this.getAllCitiesWeather();
      
      for (const weather of weatherData) {
        try {
          await storage.updateWeather(weather.city, weather);
          console.log(`[WeatherService] Updated weather for ${weather.city}: ${weather.temperature}°C`);
        } catch (error) {
          console.error(`[WeatherService] Failed to update ${weather.city}:`, error);
        }
      }
      
      console.log(`[WeatherService] Successfully updated weather for ${weatherData.length} cities`);
    } catch (error) {
      console.error('[WeatherService] Error updating weather:', error);
    }
  }
}

export const weatherService = new WeatherService();