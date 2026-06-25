const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export interface GeoResult {
  displayName: string;
  lat: string;
  lon: string;
  country: string | null;
}

export async function geocodeCity(
  cityName: string,
  signal: AbortSignal,
): Promise<GeoResult | null> {
  const params = new URLSearchParams({
    q: cityName,
    format: 'json',
    limit: '1',
    addressdetails: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept-Language': 'en' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const hit = data[0];
  return {
    displayName: hit.display_name,
    lat: hit.lat,
    lon: hit.lon,
    country: hit.address?.country ?? null,
  };
}
