// Overpass API — public, no key required
// https://overpass-api.de
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const RADIUS_METERS = 5000;

const AMENITY_CATEGORIES: Record<string, string> = {
  hospital: 'Hospital',
  bank: 'Bank',
  pharmacy: 'Pharmacy',
  fuel: 'Fuel Station',
  police: 'Police Station',
  restaurant: 'Restaurant',
};

const AMENITY_KEYS = Object.keys(AMENITY_CATEGORIES);

export interface Place {
  id: number;
  name: string;
  category: string;
  distanceMeters: number;
  address: string | null;
}

/** Haversine distance in metres between two lat/lon points. */
function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

function buildQuery(lat: string, lon: string): string {
  const amenityUnion = AMENITY_KEYS.map(
    (a) => `node[amenity=${a}](around:${RADIUS_METERS},${lat},${lon});`,
  ).join('\n');

  return `[out:json][timeout:25];
(
${amenityUnion}
);
out body;`;
}

export async function getNearbyPlaces(
  lat: string,
  lon: string,
  signal: AbortSignal,
): Promise<Place[]> {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(buildQuery(lat, lon))}`,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();

  const places: Place[] = (data.elements ?? [])
    .filter((el: { tags?: Record<string, string> }) => el.tags?.name)
    .map((el: { id: number; lat: number; lon: number; tags: Record<string, string> }) => ({
      id: el.id,
      name: el.tags.name,
      category: AMENITY_CATEGORIES[el.tags.amenity] ?? el.tags.amenity,
      distanceMeters: Math.round(haversine(latNum, lonNum, el.lat, el.lon)),
      address: buildAddress(el.tags),
    }));

  // Sort nearest first
  places.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return places;
}
