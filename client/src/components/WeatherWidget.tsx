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
  forecast: Forecast[];
  updatedAt: string;
  isUserLocation?: boolean;
  coordinates?: { lat: number; lon: number };
}

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [otherCities, setOtherCities] = useState<Weather[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending' | 'unavailable'>('pending');
  const [isTrackingLocation, setIsTrackingLocation] = useState<boolean>(false);

  // Function to get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('unavailable');
      return;
    }

    setIsTrackingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log(`[Location] User location: ${latitude}, ${longitude}`);
          
          // Fetch weather for user's location
          const locationResponse = await fetch(`/api/weather/location/${latitude}/${longitude}`);
          
          if (locationResponse.ok) {
            const responseText = await locationResponse.text();
            
            try {
              const locationWeather = JSON.parse(responseText);
              
              // Parse the forecast JSON if it's a string
              if (typeof locationWeather.forecast === 'string') {
                locationWeather.forecast = JSON.parse(locationWeather.forecast);
              }
              
              setWeather(locationWeather);
              setLocationPermission('granted');
              console.log(`[Weather] Successfully fetched location weather for ${locationWeather.city}`);
            } catch (jsonError) {
              console.error('[Weather] Invalid JSON response:', responseText);
              throw new Error('Invalid weather data format');
            }
          } else {
            const errorText = await locationResponse.text();
            console.error(`[Weather] API error ${locationResponse.status}:`, errorText);
            throw new Error('Failed to fetch location weather');
          }
        } catch (error) {
          console.error('Error fetching location weather:', error);
          // Fall back to Dhaka weather
          await fetchDefaultWeather();
        } finally {
          setIsTrackingLocation(false);
        }
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        setIsTrackingLocation(false);
        // Fall back to Dhaka weather
        fetchDefaultWeather();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Function to fetch default weather (Dhaka)
  const fetchDefaultWeather = async () => {
    try {
      const dhakaResponse = await fetch('/api/weather/ঢাকা');
      
      if (!dhakaResponse.ok) {
        throw new Error('Failed to fetch Dhaka weather');
      }
      
      const dhakaWeather = await dhakaResponse.json();
      
      if (typeof dhakaWeather.forecast === 'string') {
        dhakaWeather.forecast = JSON.parse(dhakaWeather.forecast);
      }
      
      setWeather(dhakaWeather);
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
        
        // Try to get user's location first
        if (navigator.geolocation) {
          getUserLocation();
        } else {
          await fetchDefaultWeather();
        }
        
        // Fetch all weather data for other cities
        const allResponse = await fetch('/api/weather');
        
        if (!allResponse.ok) {
          throw new Error('Failed to fetch all weather data');
        }
        
        const allWeatherData = await allResponse.json();
        
        // Parse forecast for each city and filter out current weather city
        const otherCitiesData = allWeatherData
          .map((city: Weather) => {
            if (typeof city.forecast === 'string') {
              city.forecast = JSON.parse(city.forecast);
            }
            return city;
          });
        
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
          {weather.forecast.slice(0, 3).map((day, index) => (
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
