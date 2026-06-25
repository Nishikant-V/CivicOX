import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon paths when bundled with Vite
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  lat: string;
  lon: string;
  label: string;
}

const CityMap: React.FC<Props> = ({ lat, lon, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setError('Invalid coordinates.');
      return;
    }

    if (!containerRef.current) return;

    // Destroy any previous instance (route change)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    let map: L.Map;
    try {
      map = L.map(containerRef.current).setView([latNum, lonNum], 12);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([latNum, lonNum], { icon: DefaultIcon })
        .addTo(map)
        .bindPopup(label);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Map failed to initialise.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, label]);

  if (error) {
    return <p>Map error: {error}</p>;
  }

  return (
    <div
      ref={containerRef}
      style={{ height: '400px', width: '100%' }}
      aria-label={`Map centred on ${label}`}
    />
  );
};

export default CityMap;
