import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = city.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
    navigate(`/city/${slug}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>CivicOS</h1>
      <p>Explore civic data for cities across India.</p>
      <form onSubmit={handleSearch} style={{ marginTop: '2rem' }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter a city name"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default Home;
