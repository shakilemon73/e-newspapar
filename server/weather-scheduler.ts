// Weather data scheduler for automatic updates
// Updates weather data every hour using Open-Meteo API

import { weatherService } from './weather-service';
import { storage } from './storage';

class WeatherScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private updateInterval = 60 * 60 * 1000; // 1 hour in milliseconds
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('[WeatherScheduler] Already running');
      return;
    }

    console.log('[WeatherScheduler] Starting automatic weather updates every hour');
    
    // Initial update
    this.updateWeatherData();
    
    // Schedule recurring updates
    this.intervalId = setInterval(() => {
      this.updateWeatherData();
    }, this.updateInterval);
    
    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[WeatherScheduler] Stopped automatic weather updates');
  }

  private async updateWeatherData() {
    try {
      console.log('[WeatherScheduler] Starting scheduled weather update...');
      const startTime = Date.now();
      
      await weatherService.updateWeatherInDatabase(storage);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`[WeatherScheduler] Weather update completed in ${duration}ms`);
    } catch (error) {
      console.error('[WeatherScheduler] Error during scheduled weather update:', error);
    }
  }

  // Manual update trigger
  async forceUpdate() {
    console.log('[WeatherScheduler] Manual weather update triggered');
    await this.updateWeatherData();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      updateInterval: this.updateInterval,
      nextUpdate: this.intervalId ? new Date(Date.now() + this.updateInterval).toISOString() : null
    };
  }

  // Change update interval (in minutes)
  setUpdateInterval(minutes: number) {
    const newInterval = minutes * 60 * 1000;
    
    if (newInterval < 10 * 60 * 1000) { // Minimum 10 minutes
      console.warn('[WeatherScheduler] Minimum update interval is 10 minutes');
      return false;
    }
    
    this.updateInterval = newInterval;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log(`[WeatherScheduler] Update interval changed to ${minutes} minutes`);
    return true;
  }
}

export const weatherScheduler = new WeatherScheduler();