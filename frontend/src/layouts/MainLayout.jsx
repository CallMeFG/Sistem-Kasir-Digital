import { useState, useEffect, Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { getProduk } from '../services/produkService';
import Loading from '../components/Loading';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const PAGE_TITLES = {
  '/dashboard':         'Dashboard',
  '/':                  'Dashboard',
  '/barang':            'Daftar Produk',
  '/transaksi':         'Kasir',
  '/riwayat-transaksi': 'Riwayat Transaksi',
  '/laporan':           'Laporan Laba Rugi',
  '/katalog':           'Katalog',
};

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [produkKritisCount, setProdukKritisCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    getProduk()
      .then(res => {
        const all = res.data.data || [];
        setProdukKritisCount(all.filter(p => p.stok < 10).length);
      })
      .catch(() => {});
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Warung Adjie';

  return (
    <div className="app-shell">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        produkKritisCount={produkKritisCount} 
        user={user} 
      />

      <div className="app-main">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={pageTitle}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          produkKritisCount={produkKritisCount}
        />

        <main className="app-content animate-fade">
          <Breadcrumb />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
