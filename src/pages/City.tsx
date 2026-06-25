import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { geocodeCity, type GeoResult } from '../services/geocoding';
import { getWeather, type WeatherResult } from '../services/weather';
import { getAqi, type AqiResult } from '../services/aqi';
import { getNearbyPlaces, type Place } from '../services/places';
import { getCityNews, type NewsArticle } from '../services/news';
import CityMap from '../components/CityMap';
import {
  Wind,
  MapPin,
  Newspaper,
  Search,
  Globe,
  CloudSun,
  AlertCircle,
  Map
} from 'lucide-react';

type GeoStatus = 'loading' | 'success' | 'error' | 'not-found';
type WeatherStatus = 'loading' | 'success' | 'error';
type AqiStatus = 'loading' | 'success' | 'error' | 'no-data';
type PlacesStatus = 'loading' | 'success' | 'error';
type NewsStatus = 'loading' | 'success' | 'error';

interface LocationDetails {
  city: string;
  state: string;
  country: string;
}

function parseLocation(displayName: string, fallbackCountry: string | null): LocationDetails {
  const parts = displayName.split(',').map((p) => p.trim());
  if (parts.length === 0) {
    return { city: '', state: '', country: fallbackCountry || '' };
  }

  const city = parts[0];
  const country = fallbackCountry || parts[parts.length - 1];

  let state = '';
  if (parts.length >= 3) {
    const lastIdx = parts.length - 1;
    const secondToLast = parts[lastIdx - 1];
    const isZip = /^\d+$/.test(secondToLast) || (/[a-zA-Z]/.test(secondToLast) && /\d/.test(secondToLast) && secondToLast.length < 10);
    if (isZip && parts.length >= 4) {
      state = parts[lastIdx - 2];
    } else {
      state = secondToLast;
    }
  }

  return { city, state, country };
}

function getAqiBadgeClass(category: string): string {
  const base = 'inline-flex items-center rounded-md px-2 py-1 text-2xs font-semibold ring-1 ring-inset';
  switch (category.toLowerCase()) {
    case 'good':
      return `${base} bg-green-50 text-green-700 ring-green-600/20`;
    case 'fair':
      return `${base} bg-blue-50 text-blue-700 ring-blue-600/20`;
    case 'moderate':
      return `${base} bg-yellow-50 text-yellow-800 ring-yellow-600/20`;
    case 'poor':
      return `${base} bg-orange-50 text-orange-700 ring-orange-600/20`;
    case 'very poor':
      return `${base} bg-red-50 text-red-700 ring-red-600/20`;
    default:
      return `${base} bg-slate-50 text-slate-700 ring-slate-600/20`;
  }
}

const City: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();

  const [searchCity, setSearchCity] = useState('');

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

  const [newsStatus, setNewsStatus] = useState<NewsStatus>('loading');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
    if (!cityName) return;

    const controller = new AbortController();
    const { signal } = controller;

    // Reset state
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
    setNewsStatus('loading');
    setNews([]);
    setNewsError('');

    geocodeCity(cityName, signal)
      .then((geo) => {
        if (!geo) {
          setGeoStatus('not-found');
          return;
        }
        setGeoResult(geo);
        setGeoStatus('success');

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

        getCityNews(cityName, signal)
          .then((n) => {
            setNews(n);
            setNewsStatus('success');
          })
          .catch((err: unknown) => {
            if (err instanceof Error && err.name === 'AbortError') return;
            setNewsError(err instanceof Error ? err.message : 'Unknown error');
            setNewsStatus('error');
          });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setGeoError(err instanceof Error ? err.message : 'Unknown error');
        setGeoStatus('error');
      });

    return () => controller.abort();
  }, [cityName]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchCity.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
    navigate(`/city/${slug}`);
    setSearchCity('');
  };

  const formattedCitySlug = cityName
    ? cityName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  const parsedLoc = geoResult ? parseLocation(geoResult.displayName, geoResult.country) : null;
  const displayHeading = parsedLoc ? parsedLoc.city : formattedCitySlug;

  return (
    <div className="space-y-12">
      {/* ── Hero Section ── */}
      <div className="text-center py-6 md:py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          {displayHeading}
        </h1>
        <p className="text-base md:text-lg text-slate-500 mb-8 leading-relaxed">
          Live weather, air quality, nearby places, and local news.
        </p>

        {/* Hero Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md mx-auto relative group">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search another city..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-24 text-xs text-slate-900 shadow-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-slate-900 px-4 text-2xs font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Loading & Error States for Geocoding */}
      {geoStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mb-4" />
          <p className="text-sm text-slate-500 font-medium">Resolving location details...</p>
        </div>
      )}

      {geoStatus === 'not-found' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-md mx-auto">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 mb-4">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">City Not Found</h3>
          <p className="text-xs text-slate-500 mb-6">
            We couldn't find any results for &ldquo;{cityName}&rdquo;. Please verify the spelling and try again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Go Back Home
          </button>
        </div>
      )}

      {geoStatus === 'error' && (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center max-w-md mx-auto">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Location Error</h3>
          <p className="text-xs text-slate-500 mb-4">{geoError}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main Dashboard Grid ── */}
      {geoStatus === 'success' && geoResult && (
        <div className="space-y-8">
          {/* Top Row: Weather/AQI (left) & Map (right) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
            <div className="flex flex-col gap-8">
              {/* City Location Card */}
              {parsedLoc && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                      <Globe className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Location Profile</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                        City
                      </span>
                      <span className="text-xs font-bold text-slate-700 block truncate" title={parsedLoc.city}>
                        {parsedLoc.city}
                      </span>
                    </div>
                    <div>
                      <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                        State
                      </span>
                      <span className="text-xs font-bold text-slate-700 block truncate" title={parsedLoc.state}>
                        {parsedLoc.state || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                        Country
                      </span>
                      <span className="text-xs font-bold text-slate-700 block truncate" title={parsedLoc.country}>
                        {parsedLoc.country}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Weather Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Current Weather</h3>
                </div>

                {weatherStatus === 'loading' && (
                  <div className="flex py-6 justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
                  </div>
                )}

                {weatherStatus === 'error' && (
                  <p className="text-xs text-red-500 py-4">Weather error: {weatherError}</p>
                )}

                {weatherStatus === 'success' && weather && (
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {weather.temperature}
                      </span>
                      <span className="text-lg font-bold text-slate-400">°C</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mb-6">{weather.condition}</p>

                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                          Feels Like
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {weather.feelsLike} °C
                        </span>
                      </div>
                      <div>
                        <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                          Humidity
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {weather.humidity}%
                        </span>
                      </div>
                      <div>
                        <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                          Wind Speed
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {weather.windSpeed} km/h
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Air Quality Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                    <Wind className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Air Quality Index</h3>
                </div>

                {aqiStatus === 'loading' && (
                  <div className="flex py-6 justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
                  </div>
                )}

                {aqiStatus === 'error' && (
                  <p className="text-xs text-red-500 py-4">Air quality error: {aqiError}</p>
                )}

                {aqiStatus === 'no-data' && (
                  <p className="text-xs text-slate-500 py-4">No air quality data available.</p>
                )}

                {aqiStatus === 'success' && aqi && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {aqi.aqi}
                      </span>
                      <span className={getAqiBadgeClass(aqi.category)}>{aqi.category}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                          PM2.5
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {aqi.pm2_5} µg/m³
                        </span>
                      </div>
                      <div>
                        <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                          PM10
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {aqi.pm10} µg/m³
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Card */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                  <Map className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Interactive Map</h3>
              </div>
              <div className="relative">
                <CityMap lat={geoResult.lat} lon={geoResult.lon} label={geoResult.displayName} />
              </div>
            </div>
          </div>

          {/* Bottom Grid: Nearby Places & News */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-12">
            {/* Nearby Places */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Nearby Places</h3>
              </div>

              {placesStatus === 'loading' && (
                <div className="flex py-10 justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
                </div>
              )}

              {placesStatus === 'error' && (
                <p className="text-xs text-red-500 py-4">Places error: {placesError}</p>
              )}

              {placesStatus === 'success' && places.length === 0 && (
                <p className="text-xs text-slate-500 py-6 text-center">No named places found within 5 km.</p>
              )}

              {placesStatus === 'success' && places.length > 0 && (
                <div className="space-y-5">
                  <div className="divide-y divide-slate-100">
                    {places.slice(0, 8).map((place) => (
                      <div key={place.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{place.name}</h4>
                          {place.address && <p className="text-3xs text-slate-400">{place.address}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-3xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 whitespace-nowrap">
                            {place.category}
                          </span>
                          <span className="text-3xs font-semibold text-slate-400 whitespace-nowrap">
                            {place.distanceMeters} m
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled
                    className="w-full rounded-xl border border-dashed border-slate-200 py-3 text-xs font-semibold text-slate-400 cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    View More (Feature Coming Soon)
                  </button>
                </div>
              )}
            </div>

            {/* Local News */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                  <Newspaper className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Local News</h3>
              </div>

              {newsStatus === 'loading' && (
                <div className="flex py-10 justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
                </div>
              )}

              {newsStatus === 'error' && (
                <p className="text-xs text-red-500 py-4">News error: {newsError}</p>
              )}

              {newsStatus === 'success' && news.length === 0 && (
                <p className="text-xs text-slate-500 py-6 text-center">No recent news found for this city.</p>
              )}

              {newsStatus === 'success' && news.length > 0 && (
                <div className="space-y-5">
                  {news.map((article, idx) => (
                    <div key={idx} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex flex-col gap-2">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 leading-snug hover:text-slate-900 transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-3xs text-slate-400">
                            <span className="font-semibold">{article.source}</span>
                            <span>•</span>
                            <span>{article.publishedDate}</span>
                          </div>
                        </div>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-3xs font-bold text-slate-950 hover:text-slate-800 transition-colors"
                        >
                          Read More
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default City;
