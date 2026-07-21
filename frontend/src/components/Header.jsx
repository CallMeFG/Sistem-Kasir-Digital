import { Link } from 'react-router-dom';

export default function Header({ sidebarOpen, setSidebarOpen, pageTitle, darkMode, setDarkMode, produkKritisCount }) {
  return (
    <header className="app-topbar">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="btn btn-secondary btn-sm md:hidden !px-2.5 !py-1.5"
      >
        ☰
      </button>

      <div className="flex-1">
        <h1 className="text-base font-extrabold text-textPrimary m-0">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-secondary btn-sm text-base !px-2.5 !py-1.5"
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {produkKritisCount > 0 && (
          <Link to="/barang" className="btn btn-secondary btn-sm text-base !px-2.5 !py-1.5 relative no-underline" title="Produk stok kritis">
            ⚠️
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] font-extrabold px-[5px] py-[1px] leading-snug">
              {produkKritisCount}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}

