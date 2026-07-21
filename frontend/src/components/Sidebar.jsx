import { NavLink, Link, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard',         icon: '📊', label: 'Dashboard' },
  { to: '/transaksi',         icon: '🛒', label: 'Kasir' },
  { to: '/barang',            icon: '📦', label: 'Daftar Produk' },
  { to: '/riwayat-transaksi', icon: '🧾', label: 'Riwayat Transaksi' },
  { to: '/laporan',           icon: '📈', label: 'Laporan' },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, produkKritisCount, user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-[39] backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-5 pb-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-lg shrink-0 shadow-[0_4px_12px_rgb(99_102_241/0.4)]">📦</div>
            <div>
              <div className="font-extrabold text-[15px] text-textPrimary leading-tight">Warung Adjie</div>
              <div className="text-[11px] text-textMuted font-medium">Sistem Kasir Digital</div>
            </div>
          </Link>
        </div>

        <nav className="p-3 px-2.5 flex-1">
          <div className="text-[10.5px] font-bold text-textMuted uppercase tracking-wider p-2 pb-1.5">
            Menu Utama
          </div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex items-center gap-2.5 py-2.5 px-2.5 rounded-xl no-underline text-[13.5px] mb-0.5 transition-all duration-150 relative ${
                isActive 
                  ? 'font-bold text-primary-600 bg-primary-50' 
                  : 'font-medium text-textSecondary hover:bg-input'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-primary-600 rounded-full" />
                  )}
                  <span className="text-[17px]">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/barang' && produkKritisCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-[10px] font-extrabold px-1.5 min-w-[18px] text-center">
                      {produkKritisCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="h-[1px] bg-border my-3" />
          
          <div className="text-[10.5px] font-bold text-textMuted uppercase tracking-wider p-2 pb-1.5">
            Publik
          </div>
          <NavLink
            to="/katalog"
            className={({ isActive }) => `flex items-center gap-2.5 py-2.5 px-2.5 rounded-xl no-underline text-[13.5px] transition-all duration-150 ${
              isActive ? 'font-bold text-primary-600 bg-primary-50' : 'font-medium text-textSecondary hover:bg-input'
            }`}
          >
            <span className="text-[17px]">🛍️</span>
            <span>Katalog</span>
          </NavLink>
        </nav>

        <div className="p-3 px-2.5 border-t border-border">
          {user && (
            <div className="flex items-center gap-2.5 p-2 px-2.5 rounded-xl bg-input mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-[13px] font-extrabold shrink-0">
                {(user.email?.[0] ?? 'A').toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[12.5px] font-bold text-textPrimary truncate">
                  {user.email}
                </div>
                <div className="text-[11px] text-textMuted">Admin</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm w-full justify-center"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}

