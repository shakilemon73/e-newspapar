import { useState, useEffect } from 'react';
import { toBengaliNumber } from '@/lib/utils/dates';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Forecast {
  day: string;
  temperature: number;
  icon: string;
}

interface Weather {
  id: number;
  city: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast: string | Forecast[]; // Can be JSON string or parsed array
  updatedAt: string;
  isUserLocation?: boolean;
  coordinates?: { lat: number; lon: number };
  updated_at?: string;
}

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [otherCities, setOtherCities] = useState<Weather[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending' | 'unavailable'>('pending');
  const [isTrackingLocation, setIsTrackingLocation] = useState<boolean>(false);

  // Helper function to safely parse forecast data
  const parseForecast = (forecastData: string | Forecast[]): Forecast[] => {
    if (Array.isArray(forecastData)) {
      return forecastData;
    }
    
    try {
      return JSON.parse(forecastData as string) || [];
    } catch (error) {
      console.error('Error parsing forecast data:', error);
      return [];
    }
  };

  // Function to get user's location via IP (no permissions needed)
  const getUserLocation = async () => {
    setIsTrackingLocation(true);
    
    try {
      console.log('[Weather] Getting location via IP address...');
      
      // Use IP-based location endpoint for enhanced privacy
      const response = await fetch('/api/public/weather/ip-location');
      
      if (!response.ok) {
        throw new Error('Failed to get IP-based weather');
      }
      
      const locationWeather = await response.json();
      
      if (locationWeather) {
        setWeather({
          ...locationWeather,
          id: Date.now(), // Add temporary ID for state management
          updatedAt: new Date().toISOString()
        });
        setLocationPermission('granted');
        console.log(`[Weather] Successfully fetched IP-based weather for ${locationWeather.detectedCity}`);
      } else {
        throw new Error('No weather data received');
      }
    } catch (error) {
      console.error('Error fetching IP-based weather:', error);
      setLocationPermission('denied');
      // Fall back to default Dhaka weather
      await fetchDefaultWeather();
    } finally {
      setIsTrackingLocation(false);
    }
  };

  // Function to fetch default weather (Dhaka)
  const fetchDefaultWeather = async () => {
    try {
      // Fetch default weather for Dhaka using direct Supabase call
      const { getWeatherByCity } = await import('../lib/supabase-api-direct');
      const dhakaWeather = await getWeatherByCity('ঢাকা');
      
      if (dhakaWeather) {
        // Transform the data to match our interface
        const transformedWeather: Weather = {
          id: dhakaWeather.id,
          city: dhakaWeather.city,
          temperature: dhakaWeather.temperature,
          condition: dhakaWeather.condition || 'N/A',
          icon: dhakaWeather.icon || 'fas fa-sun',
          forecast: dhakaWeather.forecast || '[]',
          updatedAt: dhakaWeather.updated_at || ''
        };
        setWeather(transformedWeather);
      }
    } catch (error) {
      console.error('Error fetching default weather:', error);
      setError('আবহাওয়া তথ্য লোড করতে সমস্যা হয়েছে');
    }
  };

  useEffect(() => {
    // Get current date in Bengali
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    setCurrentDate(today.toLocaleDateString('bn-BD', options));

    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get user's location using IP (no permission needed)
        await getUserLocation();
        
        // Fetch all weather data for other cities using direct Supabase call
        const { getWeather } = await import('../lib/supabase-api-direct');
        const allWeatherData = await getWeather();
        
        // Parse forecast for each city and filter out current weather city
        const otherCitiesData = allWeatherData
          .map((city: any) => ({
            ...city,
            forecast: parseForecast(city.forecast)
          }));
        
        setOtherCities(otherCitiesData);
        setError(null);
      } catch (err) {
        setError('আবহাওয়া তথ্য লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching weather data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4 h-full">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">আবহাওয়া</h3>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">আবহাওয়া</h3>
        <p className="text-center py-8">{error || 'আবহাওয়া তথ্য পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4 h-full">
      <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">আবহাওয়া</h3>
      
      {/* Main Weather Section with Location Tracking */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {weather.isUserLocation ? (
                <Navigation className="w-4 h-4 text-blue-500" />
              ) : (
                <MapPin className="w-4 h-4 text-gray-500" />
              )}
              <h4 className="font-bold text-xl">{weather.city}</h4>
            </div>
            {locationPermission === 'denied' && (
              <Button
                variant="outline"
                size="sm"
                onClick={getUserLocation}
                disabled={isTrackingLocation}
                className="text-xs"
              >
                {isTrackingLocation ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
                <span className="ml-1">অবস্থান</span>
              </Button>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end">
              <span className="text-3xl font-bold mr-2">{toBengaliNumber(weather.temperature)}°</span>
              <i className={`${weather.icon} text-yellow-500 text-3xl`}></i>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{weather.condition}</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{currentDate}</p>
        
        {/* Forecast Section */}
        <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 dark:bg-gray-800 rounded p-3">
          {parseForecast(weather.forecast || []).slice(0, 3).map((day, index) => (
            <div className="forecast-day" key={index}>
              <div className="text-xs font-medium mb-1">{day.day}</div>
              <i className={`${day.icon} ${day.icon.includes('sun') ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'} text-lg mb-1`}></i>
              <div className="text-sm font-bold">{toBengaliNumber(day.temperature)}°</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Other Cities Section */}
      <div className="border-t border-border pt-4">
        <h5 className="font-bold mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          অন্যান্য শহর
        </h5>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {otherCities.filter(city => city.city !== weather.city).slice(0, 6).map((city) => (
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded p-2" key={city.id}>
              <span className="font-medium">{city.city}</span>
              <div className="flex items-center space-x-1">
                <span className="font-bold">{toBengaliNumber(city.temperature)}°</span>
                <i className={`${city.icon} text-sm ${city.icon.includes('sun') ? 'text-yellow-500' : 'text-gray-500'}`}></i>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Location Status */}
      {locationPermission === 'pending' && isTrackingLocation && (
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            অবস্থান খুঁজছি...
          </div>
        </div>
      )}
      
      {locationPermission === 'unavailable' && (
        <div className="mt-3 text-center text-sm text-gray-500">
          অবস্থান সেবা উপলব্ধ নয়
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
