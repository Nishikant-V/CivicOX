import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-6">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">404 — Page Not Found</h1>
      <p className="text-slate-500 max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
