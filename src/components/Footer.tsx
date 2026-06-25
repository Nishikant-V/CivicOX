const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-slate-400">
          &copy; {year} CivicOX. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
