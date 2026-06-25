// Open-Meteo — no API key required
// https://open-meteo.com/en/docs
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherResult {
  temperature: number;      // °C
  feelsLike: number;        // °C
  humidity: number;         // %
  windSpeed: number;        // km/h
  condition: string;
}

// WMO Weather interpretation codes → human-readable condition
// https://open-meteo.com/en/docs#weathervariables
const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

function resolveCondition(code: number): string {
  return WMO_CODES[code] ?? `Weather code ${code}`;
}

export async function getWeather(
  lat: string,
  lon: string,
  signal: AbortSignal,
): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const response = await fetch(`${BASE_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const c = data.current;

  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    condition: resolveCondition(c.weather_code),
  };
}
