import { Link, NavLink } from 'react-router-dom';
import { Globe } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <Globe className="h-5 w-5 text-slate-800" />
          <span>CivicOX</span>
        </Link>
        <nav className="flex gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            Home
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
