import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { geocodeCity, type GeoResult } from '../services/geocoding';
import { getWeather, type WeatherResult } from '../services/weather';
import { getAqi, type AqiResult } from '../services/aqi';
import { getNearbyPlaces, type Place } from '../services/places';
import CityMap from '../components/CityMap';

type GeoStatus = 'loading' | 'success' | 'error' | 'not-found';
type WeatherStatus = 'loading' | 'success' | 'error';
type AqiStatus = 'loading' | 'success' | 'error' | 'no-data';
type PlacesStatus = 'loading' | 'success' | 'error';

const City: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();

  const [geoStatus, setGeoStatus] = useState<GeoStatus>('loading');
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [geoError, setGeoError] = useState('');

  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('loading');
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [weatherError, setWeatherError] = useState('');

  const [aqiStatus, setAqiStatus] = useState<AqiStatus>('loading');
  const [aqi, setAqi] = useState<AqiResult | null>(null);
  const [aqiError, setAqiError] = useState('');

  const [placesStatus, setPlacesStatus] = useState<PlacesStatus>('loading');
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesError, setPlacesError] = useState('');

  useEffect(() => {
    if (!cityName) return;

    const controller = new AbortController();
    const { signal } = controller;

    // Reset all state
    setGeoStatus('loading');
    setGeoResult(null);
    setGeoError('');
    setWeatherStatus('loading');
    setWeather(null);
    setWeatherError('');
    setAqiStatus('loading');
    setAqi(null);
    setAqiError('');
    setPlacesStatus('loading');
    setPlaces([]);
    setPlacesError('');

    geocodeCity(cityName, signal)
      .then((geo) => {
        if (!geo) {
          setGeoStatus('not-found');
          return;
        }
        setGeoResult(geo);
        setGeoStatus('success');

        // Weather and AQI are independent — fetch in parallel
        getWeather(geo.lat, geo.lon, signal)
          .then((w) => {
            setWeather(w);
            setWeatherStatus('success');
          })
          .catch((err: unknown) => {
            if (err instanceof Error && err.name === 'AbortError') return;
            setWeatherError(err instanceof Error ? err.message : 'Unknown error');
            setWeatherStatus('error');
          });

        getAqi(geo.lat, geo.lon, signal)
          .then((a) => {
            if (a) {
              setAqi(a);
              setAqiStatus('success');
            } else {
              setAqiStatus('no-data');
            }
          })
          .catch((err: unknown) => {
            if (err instanceof Error && err.name === 'AbortError') return;
            setAqiError(err instanceof Error ? err.message : 'Unknown error');
            setAqiStatus('error');
          });

        getNearbyPlaces(geo.lat, geo.lon, signal)
          .then((p) => {
            setPlaces(p);
            setPlacesStatus('success');
          })
          .catch((err: unknown) => {
            if (err instanceof Error && err.name === 'AbortError') return;
            setPlacesError(err instanceof Error ? err.message : 'Unknown error');
            setPlacesStatus('error');
          });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setGeoError(err instanceof Error ? err.message : 'Unknown error');
        setGeoStatus('error');
      });

    return () => controller.abort();
  }, [cityName]);

  return (
    <div>
      <h1>{cityName}</h1>

      {/* ── Geocoding ── */}
      {geoStatus === 'loading' && <p>Loading location…</p>}
      {geoStatus === 'not-found' && <p>No results found for &ldquo;{cityName}&rdquo;.</p>}
      {geoStatus === 'error' && <p>Location error: {geoError}</p>}

      {geoStatus === 'success' && geoResult && (
        <dl>
          <dt>Display Name</dt>
          <dd>{geoResult.displayName}</dd>

          <dt>Latitude</dt>
          <dd>{geoResult.lat}</dd>

          <dt>Longitude</dt>
          <dd>{geoResult.lon}</dd>

          {geoResult.country && (
            <>
              <dt>Country</dt>
              <dd>{geoResult.country}</dd>
            </>
          )}
        </dl>
      )}

      {/* ── Map ── */}
      {geoStatus === 'success' && geoResult && (
        <CityMap lat={geoResult.lat} lon={geoResult.lon} label={geoResult.displayName} />
      )}

      {/* ── Nearby Places ── */}
      {geoStatus === 'success' && (
        <>
          <h2>Nearby Places</h2>

          {placesStatus === 'loading' && <p>Loading nearby places…</p>}
          {placesStatus === 'error' && <p>Places error: {placesError}</p>}
          {placesStatus === 'success' && places.length === 0 && (
            <p>No named places found within 5 km.</p>
          )}

          {placesStatus === 'success' && places.length > 0 && (
            <ul>
              {places.map((place) => (
                <li key={place.id}>
                  <strong>{place.name}</strong> — {place.category},{' '}
                  {place.distanceMeters} m away
                  {place.address && <>, {place.address}</>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ── Weather ── */}
      {geoStatus === 'success' && (
        <>
          <h2>Current Weather</h2>

          {weatherStatus === 'loading' && <p>Loading weather…</p>}
          {weatherStatus === 'error' && <p>Weather error: {weatherError}</p>}

          {weatherStatus === 'success' && weather && (
            <dl>
              <dt>Condition</dt>
              <dd>{weather.condition}</dd>

              <dt>Temperature</dt>
              <dd>{weather.temperature} °C</dd>

              <dt>Feels Like</dt>
              <dd>{weather.feelsLike} °C</dd>

              <dt>Humidity</dt>
              <dd>{weather.humidity} %</dd>

              <dt>Wind Speed</dt>
              <dd>{weather.windSpeed} km/h</dd>
            </dl>
          )}
        </>
      )}

      {/* ── Air Quality ── */}
      {geoStatus === 'success' && (
        <>
          <h2>Air Quality</h2>

          {aqiStatus === 'loading' && <p>Loading air quality…</p>}
          {aqiStatus === 'error' && <p>Air quality error: {aqiError}</p>}
          {aqiStatus === 'no-data' && <p>No air quality data available.</p>}

          {aqiStatus === 'success' && aqi && (
            <dl>
              <dt>AQI (European)</dt>
              <dd>{aqi.aqi}</dd>

              <dt>Category</dt>
              <dd>{aqi.category}</dd>

              <dt>PM2.5</dt>
              <dd>{aqi.pm2_5} µg/m³</dd>

              <dt>PM10</dt>
              <dd>{aqi.pm10} µg/m³</dd>
            </dl>
          )}
        </>
      )}
    </div>
  );
};

export default City;
