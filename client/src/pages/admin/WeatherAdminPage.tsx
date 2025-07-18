import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Plus, 
  Edit, 
  Trash2, 
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Loader2,
  Eye,
  MapPin
} from 'lucide-react';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Weather {
  id: number;
  city: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast: any;
  updated_at: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
};

const weatherConditions = [
  { value: 'sunny', label: 'রোদ (Sunny)', icon: Sun },
  { value: 'cloudy', label: 'মেঘলা (Cloudy)', icon: Cloud },
  { value: 'rainy', label: 'বৃষ্টি (Rainy)', icon: CloudRain },
  { value: 'snowy', label: 'তুষার (Snowy)', icon: CloudSnow },
  { value: 'windy', label: 'ঝড়ো (Windy)', icon: Wind },
];

export default function WeatherAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [editingWeather, setEditingWeather] = useState<Weather | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch weather data from Supabase
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['/api/weather'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Create weather mutation
  const createWeatherMutation = useMutation({
    mutationFn: async (weatherData: any) => {
      return await apiRequest('POST', '/api/weather', weatherData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weather'] });
      toast({
        title: "Success",
        description: "Weather data created successfully",
      });
      setIsFormOpen(false);
      setEditingWeather(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create weather data",
        variant: "destructive",
      });
    },
  });

  // Update weather mutation
  const updateWeatherMutation = useMutation({
    mutationFn: async ({ city, ...weatherData }: any) => {
      return await apiRequest('PUT', `/api/weather/${city}`, weatherData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weather'] });
      toast({
        title: "Success",
        description: "Weather data updated successfully",
      });
      setIsFormOpen(false);
      setEditingWeather(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update weather data",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const weatherInfo = {
      city: formData.get('city') as string,
      temperature: parseInt(formData.get('temperature') as string),
      condition: formData.get('condition') as string,
      icon: formData.get('condition') as string, // Use condition as icon
      forecast: JSON.stringify({
        humidity: parseInt(formData.get('humidity') as string) || 65,
        windSpeed: parseInt(formData.get('windSpeed') as string) || 10,
        pressure: parseInt(formData.get('pressure') as string) || 1013,
      }),
    };

    if (editingWeather) {
      updateWeatherMutation.mutate({ city: editingWeather.city, ...weatherInfo });
    } else {
      createWeatherMutation.mutate(weatherInfo);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Weather Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage weather information for your Bengali news website
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Weather Data
          </Button>
        </div>

        {/* Weather Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cities</p>
                  <p className="text-2xl font-bold">{weatherData?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Temperature</p>
                  <p className="text-2xl font-bold">
                    {weatherData?.length ? 
                      Math.round(weatherData.reduce((sum: number, w: Weather) => sum + w.temperature, 0) / weatherData.length) : 0}°C
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CloudRain className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rainy Cities</p>
                  <p className="text-2xl font-bold">
                    {weatherData?.filter((w: Weather) => w.condition === 'rainy').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sunny Cities</p>
                  <p className="text-2xl font-bold">
                    {weatherData?.filter((w: Weather) => w.condition === 'sunny').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weather Data List */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Information</CardTitle>
            <CardDescription>
              Manage weather data for different cities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading weather data: {error.message}
              </div>
            ) : weatherData?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No weather data found. Add weather information for cities!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weatherData?.map((weather: Weather) => {
                  const IconComponent = weatherIcons[weather.condition as keyof typeof weatherIcons] || Cloud;
                  const forecast = weather.forecast ? JSON.parse(weather.forecast) : {};
                  
                  return (
                    <Card key={weather.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                            <h3 className="font-semibold text-lg">{weather.city}</h3>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {weather.condition}
                          </Badge>
                        </div>
                        
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {weather.temperature}°C
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {weather.condition}
                          </div>
                        </div>

                        {forecast && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="flex items-center gap-1">
                                <Droplets className="h-3 w-3" />
                                Humidity
                              </span>
                              <span>{forecast.humidity || 65}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="flex items-center gap-1">
                                <Wind className="h-3 w-3" />
                                Wind Speed
                              </span>
                              <span>{forecast.windSpeed || 10} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pressure</span>
                              <span>{forecast.pressure || 1013} hPa</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingWeather(weather);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Weather deletion would require a DELETE endpoint
                              toast({
                                title: "Info",
                                description: "Weather data deletion not implemented yet",
                              });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {editingWeather ? 'Edit Weather Data' : 'Add Weather Data'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      required
                      placeholder="e.g., ঢাকা, চট্টগ্রাম"
                      defaultValue={editingWeather?.city || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input 
                      id="temperature" 
                      name="temperature" 
                      type="number"
                      required
                      placeholder="e.g., 28"
                      defaultValue={editingWeather?.temperature || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Weather Condition</Label>
                    <Select name="condition" defaultValue={editingWeather?.condition || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {weatherConditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            <div className="flex items-center gap-2">
                              <condition.icon className="h-4 w-4" />
                              {condition.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input 
                      id="humidity" 
                      name="humidity" 
                      type="number"
                      placeholder="e.g., 65"
                      defaultValue={editingWeather?.forecast ? JSON.parse(editingWeather.forecast).humidity : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
                    <Input 
                      id="windSpeed" 
                      name="windSpeed" 
                      type="number"
                      placeholder="e.g., 10"
                      defaultValue={editingWeather?.forecast ? JSON.parse(editingWeather.forecast).windSpeed : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pressure">Pressure (hPa)</Label>
                    <Input 
                      id="pressure" 
                      name="pressure" 
                      type="number"
                      placeholder="e.g., 1013"
                      defaultValue={editingWeather?.forecast ? JSON.parse(editingWeather.forecast).pressure : ''}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      disabled={createWeatherMutation.isPending || updateWeatherMutation.isPending}
                    >
                      {createWeatherMutation.isPending || updateWeatherMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        editingWeather ? 'Update' : 'Create'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingWeather(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}