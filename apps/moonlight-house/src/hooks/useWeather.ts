/**
 * useWeather - Real weather data hook for ambient sound integration
 * 
 * Fetches current weather using wttr.in API (free, no key required)
 * Falls back to "story weather" based on time of day if fetch fails
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type WeatherCondition = 'clear' | 'rain' | 'storm' | 'snow' | 'hot' | 'cloudy' | 'windy';

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number; // Celsius
  humidity: number;
  windSpeed: number; // km/h
  description: string;
  icon: string;
  isRealWeather: boolean;
  lastUpdated: Date;
}

interface WttrResponse {
  current_condition?: {
    temp_C?: string;
    humidity?: string;
    windspeedKmph?: string;
    weatherCode?: string;
    weatherDesc?: { value: string }[];
  }[];
}

// Weather code mapping from wttr.in
// See: https://github.com/chubin/wttr.in/blob/master/lib/constants.py
const WEATHER_CODE_MAP: Record<string, WeatherCondition> = {
  // Clear/Sunny
  '113': 'clear',
  // Partly cloudy
  '116': 'cloudy',
  '119': 'cloudy',
  '122': 'cloudy',
  // Mist/Fog
  '143': 'cloudy',
  '248': 'cloudy',
  '260': 'cloudy',
  // Rain
  '176': 'rain',
  '263': 'rain',
  '266': 'rain',
  '293': 'rain',
  '296': 'rain',
  '299': 'rain',
  '302': 'rain',
  '305': 'rain',
  '308': 'rain',
  '353': 'rain',
  '356': 'rain',
  '359': 'rain',
  // Thunderstorm
  '200': 'storm',
  '386': 'storm',
  '389': 'storm',
  '392': 'storm',
  '395': 'storm',
  // Snow
  '179': 'snow',
  '182': 'snow',
  '185': 'snow',
  '227': 'snow',
  '230': 'snow',
  '281': 'snow',
  '284': 'snow',
  '311': 'snow',
  '314': 'snow',
  '317': 'snow',
  '320': 'snow',
  '323': 'snow',
  '326': 'snow',
  '329': 'snow',
  '332': 'snow',
  '335': 'snow',
  '338': 'snow',
  '350': 'snow',
  '362': 'snow',
  '365': 'snow',
  '368': 'snow',
  '371': 'snow',
  '374': 'snow',
  '377': 'snow',
};

// Weather condition to emoji mapping
const WEATHER_ICONS: Record<WeatherCondition, string> = {
  clear: '☀️',
  cloudy: '☁️',
  rain: '🌧️',
  storm: '⛈️',
  snow: '❄️',
  hot: '🔥',
  windy: '💨',
};

// Generate "story weather" based on time and randomness
function getStoryWeather(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): WeatherData {
  const baseConditions: Record<string, WeatherCondition[]> = {
    morning: ['clear', 'cloudy', 'rain'],
    afternoon: ['clear', 'hot', 'cloudy', 'storm'],
    evening: ['clear', 'cloudy', 'rain'],
    night: ['clear', 'cloudy', 'rain', 'snow'],
  };
  
  // Use seeded randomness based on day for consistency
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const conditions = baseConditions[timeOfDay];
  const condition = conditions[seed % conditions.length];
  
  // Generate plausible values
  const tempByCondition: Record<WeatherCondition, [number, number]> = {
    clear: [15, 25],
    cloudy: [12, 20],
    rain: [10, 18],
    storm: [15, 28],
    snow: [-5, 3],
    hot: [28, 38],
    windy: [10, 20],
  };
  
  const [minTemp, maxTemp] = tempByCondition[condition];
  const temperature = Math.floor(minTemp + Math.random() * (maxTemp - minTemp));
  
  return {
    condition,
    temperature,
    humidity: condition === 'rain' || condition === 'storm' ? 80 + Math.random() * 15 : 40 + Math.random() * 30,
    windSpeed: condition === 'storm' || condition === 'windy' ? 30 + Math.random() * 40 : 5 + Math.random() * 15,
    description: `${WEATHER_ICONS[condition]} ${condition.charAt(0).toUpperCase() + condition.slice(1)}`,
    icon: WEATHER_ICONS[condition],
    isRealWeather: false,
    lastUpdated: new Date(),
  };
}

interface UseWeatherOptions {
  enabled: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  refreshInterval?: number; // ms, default 15 min
}

export function useWeather({ enabled, timeOfDay, refreshInterval = 15 * 60 * 1000 }: UseWeatherOptions) {
  const [weather, setWeather] = useState<WeatherData>(() => getStoryWeather(timeOfDay));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationRef = useRef<{ lat: number; lon: number } | null>(null);

  // Fetch weather from wttr.in
  const fetchWeather = useCallback(async (lat?: number, lon?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use coordinates if available, otherwise let wttr.in use IP geolocation
      const location = lat && lon ? `${lat},${lon}` : '';
      const url = `https://wttr.in/${location}?format=j1`;
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data: WttrResponse = await response.json();
      const current = data.current_condition?.[0];
      
      if (!current) throw new Error('No current weather data');
      
      const weatherCode = current.weatherCode || '113';
      let condition = WEATHER_CODE_MAP[weatherCode] || 'clear';
      
      // Check for hot weather based on temperature
      const tempC = parseInt(current.temp_C || '20', 10);
      if (tempC >= 30 && condition === 'clear') {
        condition = 'hot';
      }
      
      // Check for windy conditions
      const windSpeed = parseInt(current.windspeedKmph || '0', 10);
      if (windSpeed >= 40 && condition === 'clear') {
        condition = 'windy';
      }
      
      setWeather({
        condition,
        temperature: tempC,
        humidity: parseInt(current.humidity || '50', 10),
        windSpeed,
        description: current.weatherDesc?.[0]?.value || 'Unknown',
        icon: WEATHER_ICONS[condition],
        isRealWeather: true,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.warn('Weather fetch failed, using story weather:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setWeather(getStoryWeather(timeOfDay));
    } finally {
      setIsLoading(false);
    }
  }, [timeOfDay]);

  // Get user location
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      fetchWeather();
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationRef.current = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        // Fall back to IP-based location
        fetchWeather();
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }, [fetchWeather]);

  // Initial fetch when enabled
  useEffect(() => {
    if (enabled) {
      getLocation();
    } else {
      setWeather(getStoryWeather(timeOfDay));
    }
  }, [enabled, getLocation, timeOfDay]);

  // Periodic refresh
  useEffect(() => {
    if (!enabled) return;
    
    const timer = setInterval(() => {
      if (locationRef.current) {
        fetchWeather(locationRef.current.lat, locationRef.current.lon);
      } else {
        fetchWeather();
      }
    }, refreshInterval);
    
    return () => clearInterval(timer);
  }, [enabled, fetchWeather, refreshInterval]);

  // Update story weather when time changes (only if not using real weather)
  useEffect(() => {
    if (!weather.isRealWeather) {
      setWeather(getStoryWeather(timeOfDay));
    }
  }, [timeOfDay, weather.isRealWeather]);

  // Manual refresh
  const refresh = useCallback(() => {
    if (enabled && locationRef.current) {
      fetchWeather(locationRef.current.lat, locationRef.current.lon);
    } else if (enabled) {
      getLocation();
    } else {
      setWeather(getStoryWeather(timeOfDay));
    }
  }, [enabled, fetchWeather, getLocation, timeOfDay]);

  return {
    weather,
    isLoading,
    error,
    refresh,
    isRealWeather: weather.isRealWeather,
  };
}

export default useWeather;
