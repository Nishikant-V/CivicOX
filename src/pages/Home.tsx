import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          CivicOX
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
          Real-time weather details, air quality tracking, nearby places, and local news for cities across India and beyond.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto relative group">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search for a city (e.g., Bengaluru, Paris...)"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-32 text-sm text-slate-900 shadow-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 rounded-xl bg-slate-900 px-6 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
