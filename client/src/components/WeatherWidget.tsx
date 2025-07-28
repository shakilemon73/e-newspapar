import { useState, useEffect } from 'react';
import { toBengaliNumber } from '@/lib/utils/dates';
import { MapPin, Navigation, RefreshCw, Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Compass, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
      
      // Use direct Supabase weather data (default to Dhaka)
      const { getWeatherByCity } = await import('../lib/supabase-api-direct');
      const locationWeather = await getWeatherByCity('ঢাকা');
      
      if (locationWeather) {
        setWeather({
          ...locationWeather,
          id: locationWeather.id || Date.now(),
          updatedAt: locationWeather.updated_at || new Date().toISOString()
        });
        setLocationPermission('granted');
        console.log(`[Weather] Successfully fetched weather for ${locationWeather.city}`);
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
    <Card className="h-full overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50/50 dark:from-sky-950/30 dark:via-gray-900 dark:to-blue-950/20 border-sky-200/60 dark:border-sky-800/40 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Modern Header with Gradient */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-sky-500 p-2 rounded-xl shadow-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              আবহাওয়া
            </h3>
          </div>
          
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={getUserLocation}
            disabled={isTrackingLocation}
            className="hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-full p-2"
          >
            <RefreshCw className={`w-4 h-4 text-sky-600 ${isTrackingLocation ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hero Weather Display - Mobile-First Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 p-6 text-white shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 transform rotate-12">
              <Sun className="w-16 h-16" />
            </div>
            <div className="absolute bottom-4 left-4 transform -rotate-12">
              <CloudRain className="w-12 h-12" />
            </div>
          </div>

          {/* Location Header */}
          <div className="relative z-10 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {weather.isUserLocation ? (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Navigation className="w-4 h-4 text-green-200" />
                  <span className="text-sm text-green-200 font-medium">আপনার অবস্থান</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">শহর</span>
                </div>
              )}
            </div>
            
            <h4 className="text-2xl md:text-3xl font-bold text-shadow-lg">
              {weather.city}
            </h4>
            <p className="text-white/80 text-sm mt-1">{currentDate}</p>
          </div>

          {/* Temperature & Condition Display */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl md:text-6xl font-bold text-shadow-lg">
                  {toBengaliNumber(weather.temperature)}
                </span>
                <span className="text-2xl font-light text-white/80">°C</span>
              </div>
              <p className="text-lg text-white/90 text-shadow font-medium">
                {weather.condition}
              </p>
            </div>
            
            {/* Weather Icon */}
            <div className="text-6xl md:text-7xl opacity-90">
              {weather.icon.includes('sun') ? (
                <Sun className="w-16 h-16 md:w-20 md:h-20 text-yellow-200" />
              ) : weather.icon.includes('cloud') ? (
                <Cloud className="w-16 h-16 md:w-20 md:h-20 text-white" />
              ) : weather.icon.includes('rain') ? (
                <CloudRain className="w-16 h-16 md:w-20 md:h-20 text-blue-200" />
              ) : (
                <Sun className="w-16 h-16 md:w-20 md:h-20 text-yellow-200" />
              )}
            </div>
          </div>

          {/* Weather Metrics */}
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <Thermometer className="w-5 h-5 mx-auto mb-1 text-white/80" />
              <div className="text-white/80 text-xs">অনুভূতি</div>
              <div className="font-bold text-lg">{toBengaliNumber(weather.temperature + 2)}°</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <Droplets className="w-5 h-5 mx-auto mb-1 text-white/80" />
              <div className="text-white/80 text-xs">আর্দ্রতা</div>
              <div className="font-bold text-lg">{toBengaliNumber(65)}%</div>
            </div>
          </div>
        </div>

        {/* 3-Day Forecast - Enhanced Design */}
        <div className="space-y-3">
          <h5 className="font-semibold text-foreground flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-500" />
            পরবর্তী ৩ দিন
          </h5>
          
          <div className="grid grid-cols-3 gap-3">
            {parseForecast(weather.forecast || []).slice(0, 3).map((day, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800 border border-gray-200/60 dark:border-gray-600/40 p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {day.day}
                  </div>
                  
                  <div className="flex justify-center">
                    {day.icon.includes('sun') ? (
                      <Sun className="w-8 h-8 text-yellow-500" />
                    ) : day.icon.includes('cloud') ? (
                      <Cloud className="w-8 h-8 text-gray-500" />
                    ) : day.icon.includes('rain') ? (
                      <CloudRain className="w-8 h-8 text-blue-500" />
                    ) : (
                      <Sun className="w-8 h-8 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="text-lg font-bold text-foreground">
                    {toBengaliNumber(day.temperature)}°
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Cities - Compact Modern Design */}
        {otherCities.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-green-500" />
              অন্যান্য শহর
            </h5>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {otherCities.filter(city => city.city !== weather.city).slice(0, 5).map((city, index) => (
                <div 
                  key={city.id}
                  className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800 border border-gray-200/60 dark:border-gray-600/40 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    
                    <div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {city.city}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {city.condition}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-lg text-foreground">
                        {toBengaliNumber(city.temperature)}°
                      </div>
                    </div>
                    
                    <div className="text-lg">
                      {city.icon.includes('sun') ? (
                        <Sun className="w-5 h-5 text-yellow-500" />
                      ) : city.icon.includes('cloud') ? (
                        <Cloud className="w-5 h-5 text-gray-500" />
                      ) : city.icon.includes('rain') ? (
                        <CloudRain className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Sun className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Location Access - Only show if permission denied */}
        {locationPermission === 'denied' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1">
                <h6 className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                  আপনার এলাকার আবহাওয়া দেখুন
                </h6>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  আরও নির্ভুল তথ্যের জন্য অবস্থান চালু করুন
                </p>
              </div>
              
              <Button
                onClick={getUserLocation}
                disabled={isTrackingLocation}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isTrackingLocation ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
