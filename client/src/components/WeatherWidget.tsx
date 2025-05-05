import { useState, useEffect } from 'react';
import { toBengaliNumber } from '@/lib/utils/dates';

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
}

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [otherCities, setOtherCities] = useState<Weather[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

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
        
        // Fetch Dhaka weather first (main city)
        const dhakaResponse = await fetch('/api/weather/ঢাকা');
        
        if (!dhakaResponse.ok) {
          throw new Error('Failed to fetch Dhaka weather');
        }
        
        const dhakaWeather = await dhakaResponse.json();
        
        // Parse the forecast JSON if it's a string
        if (typeof dhakaWeather.forecast === 'string') {
          dhakaWeather.forecast = JSON.parse(dhakaWeather.forecast);
        }
        
        setWeather(dhakaWeather);
        
        // Fetch all weather data for other cities
        const allResponse = await fetch('/api/weather');
        
        if (!allResponse.ok) {
          throw new Error('Failed to fetch all weather data');
        }
        
        const allWeatherData = await allResponse.json();
        
        // Parse forecast for each city and filter out Dhaka
        const otherCitiesData = allWeatherData
          .filter((city: Weather) => city.city !== 'ঢাকা')
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
      <div className="bg-white rounded shadow-sm p-4 h-full">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-mid-gray pb-2">আবহাওয়া</h3>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-mid-gray pb-2">আবহাওয়া</h3>
        <p className="text-center py-8">{error || 'আবহাওয়া তথ্য পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm p-4 h-full">
      <h3 className="text-lg font-bold mb-4 font-hind border-b border-mid-gray pb-2">আবহাওয়া</h3>
      <div className="flex items-center justify-between">
        <div className="location-info">
          <h4 className="font-bold text-xl mb-1">{weather.city}</h4>
          <p className="text-sm text-gray-600">{currentDate}</p>
        </div>
        <div className="weather-info text-right">
          <div className="flex items-center justify-end">
            <span className="text-3xl font-bold mr-2">{toBengaliNumber(weather.temperature)}°</span>
            <i className={`${weather.icon} text-yellow-500 text-3xl`}></i>
          </div>
          <p className="text-sm text-gray-600">{weather.condition}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {weather.forecast.map((day, index) => (
          <div className="forecast-day" key={index}>
            <div className="text-xs">{day.day}</div>
            <i className={`${day.icon} ${day.icon.includes('sun') ? 'text-yellow-500' : 'text-gray-500'} my-1`}></i>
            <div className="text-xs font-bold">{toBengaliNumber(day.temperature)}°</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 border-t border-mid-gray pt-3">
        <h5 className="font-bold mb-2">অন্যান্য শহর</h5>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {otherCities.map((city) => (
            <div className="flex justify-between" key={city.id}>
              <span>{city.city}</span>
              <span className="font-bold">{toBengaliNumber(city.temperature)}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
