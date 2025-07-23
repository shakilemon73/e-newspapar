// ========================================
// WEATHER SERVICE (Direct Supabase - No Express)
// Replacing weather-scheduler.ts and weather-service.ts
// ========================================

import { supabase } from './supabase';

export interface WeatherData {
  id?: number;
  city: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast?: any;
  updated_at?: string;
}

export interface LocationData {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

// Bangladesh cities with coordinates
const BANGLADESH_CITIES = [
  { name: 'ঢাকা', lat: 23.8103, lon: 90.4125, english: 'Dhaka' },
  { name: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832, english: 'Chittagong' },
  { name: 'খুলনা', lat: 22.8456, lon: 89.5403, english: 'Khulna' },
  { name: 'রাজশাহী', lat: 24.3636, lon: 88.6241, english: 'Rajshahi' },
  { name: 'সিলেট', lat: 24.8949, lon: 91.8687, english: 'Sylhet' },
  { name: 'বরিশাল', lat: 22.7010, lon: 90.3535, english: 'Barisal' },
  { name: 'রংপুর', lat: 25.7439, lon: 89.2752, english: 'Rangpur' },
  { name: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203, english: 'Mymensingh' },
];

class DirectWeatherService {
  private readonly API_KEY = 'your-weather-api-key'; // Replace with actual API key
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Get weather data from external API (simulated for now)
  private async fetchExternalWeather(city: string): Promise<WeatherData | null> {
    try {
      // Simulate weather API call - replace with actual API
      // For now, return mock data based on city
      const temperature = Math.floor(Math.random() * 10) + 25; // 25-34°C
      const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        city,
        temperature,
        condition,
        icon: this.getWeatherIcon(condition),
        forecast: null,
      };
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return null;
    }
  }

  private getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      'Clear': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Light Rain': '🌦️',
      'Rain': '🌧️',
      'Thunderstorm': '⛈️',
    };
    return iconMap[condition] || '☀️';
  }

  // Update weather for all Bangladesh cities (Direct Supabase)
  async updateAllCitiesWeather(): Promise<void> {
    console.log('[WeatherService] Starting weather update...');
    
    try {
      const updates: WeatherData[] = [];
      
      for (const cityInfo of BANGLADESH_CITIES) {
        const weatherData = await this.fetchExternalWeather(cityInfo.name);
        if (weatherData) {
          updates.push({
            ...weatherData,
            city: cityInfo.name,
          });
          console.log(`[WeatherService] Updated weather for ${cityInfo.name}: ${weatherData.temperature}°C`);
        }
      }

      // Batch update to Supabase
      if (updates.length > 0) {
        // First, clear existing weather data
        await supabase
          .from('weather')
          .delete()
          .neq('id', 0); // Delete all records

        // Insert new weather data
        const { error } = await supabase
          .from('weather')
          .insert(updates);

        if (error) {
          console.error('Error updating weather in database:', error);
        } else {
          console.log(`[WeatherService] Successfully updated weather for ${updates.length} cities`);
        }
      }
    } catch (error) {
      console.error('Error in weather update process:', error);
    }
  }

  // Get weather by city from Supabase
  async getWeatherByCity(city: string): Promise<WeatherData | null> {
    try {
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .eq('city', city)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching weather by city:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting weather by city:', error);
      return null;
    }
  }

  // Get all weather data from Supabase
  async getAllWeather(): Promise<WeatherData[]> {
    try {
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching all weather:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all weather:', error);
      return [];
    }
  }

  // Get user location from IP (client-side)
  async getLocationFromIP(): Promise<LocationData | null> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.city && data.latitude && data.longitude) {
        // Find closest Bangladesh city
        const userLat = parseFloat(data.latitude);
        const userLon = parseFloat(data.longitude);
        
        let closestCity = BANGLADESH_CITIES[0]; // Default to Dhaka
        let minDistance = this.calculateDistance(userLat, userLon, closestCity.lat, closestCity.lon);
        
        for (const city of BANGLADESH_CITIES) {
          const distance = this.calculateDistance(userLat, userLon, city.lat, city.lon);
          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
          }
        }
        
        return {
          city: closestCity.name,
          latitude: userLat,
          longitude: userLon,
          country: data.country_name || 'Bangladesh',
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return null;
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}

// Client-side weather scheduler (runs in browser)
class DirectWeatherScheduler {
  private scheduler: DirectWeatherService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.scheduler = new DirectWeatherService();
  }

  start(): void {
    console.log('[WeatherScheduler] Starting automatic weather updates every hour');
    
    // Update immediately
    this.updateWeather();
    
    // Set interval for future updates
    this.intervalId = setInterval(() => {
      this.updateWeather();
    }, this.UPDATE_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[WeatherScheduler] Stopped automatic weather updates');
    }
  }

  private async updateWeather(): Promise<void> {
    console.log('[WeatherScheduler] Starting scheduled weather update...');
    const startTime = Date.now();
    
    try {
      await this.scheduler.updateAllCitiesWeather();
      const duration = Date.now() - startTime;
      console.log(`[WeatherScheduler] Weather update completed in ${duration}ms`);
    } catch (error) {
      console.error('[WeatherScheduler] Error during weather update:', error);
    }
  }
}

// Export instances
export const directWeatherService = new DirectWeatherService();
export const directWeatherScheduler = new DirectWeatherScheduler();

// Auto-start weather scheduler in browser
if (typeof window !== 'undefined') {
  // Start weather updates when module loads
  directWeatherScheduler.start();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    directWeatherScheduler.stop();
  });
}