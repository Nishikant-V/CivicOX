// Open-Meteo Air Quality API — no API key required
// https://air-quality-api.open-meteo.com
const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export interface AqiResult {
  aqi: number;
  category: string;
  pm2_5: number;
  pm10: number;
}

// European AQI breakpoints used by Open-Meteo
function resolveCategory(aqi: number): string {
  if (aqi <= 20)  return 'Good';
  if (aqi <= 40)  return 'Fair';
  if (aqi <= 60)  return 'Moderate';
  if (aqi <= 80)  return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Extremely Poor';
}

export async function getAqi(
  lat: string,
  lon: string,
  signal: AbortSignal,
): Promise<AqiResult | null> {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: ['european_aqi', 'pm2_5', 'pm10'].join(','),
    timezone: 'auto',
  });

  const response = await fetch(`${BASE_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Air Quality API error: ${response.status}`);
  }

  const data = await response.json();
  const c = data.current;

  if (c.european_aqi == null) {
    return null;
  }

  return {
    aqi: c.european_aqi,
    category: resolveCategory(c.european_aqi),
    pm2_5: c.pm2_5,
    pm10: c.pm10,
  };
}
