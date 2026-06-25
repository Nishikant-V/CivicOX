import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold text-gray-900">
          CivicOS
        </Link>
        <nav className="flex gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'text-sm font-medium text-blue-600' : 'text-sm font-medium text-gray-600 hover:text-gray-900'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'text-sm font-medium text-blue-600' : 'text-sm font-medium text-gray-600 hover:text-gray-900'
            }
          >
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
