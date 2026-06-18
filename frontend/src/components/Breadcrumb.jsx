import { Link, useLocation } from 'react-router-dom';

const ROUTE_LABELS = {
  '/':                  'Dashboard',
  '/dashboard':         'Dashboard',
  '/barang':            'Daftar Produk',
  '/transaksi':         'Kasir',
  '/riwayat-transaksi': 'Riwayat Transaksi',
  '/laporan':           'Laporan Laba Rugi',
  '/katalog':           'Katalog',
};

export default function Breadcrumb({ items }) {
  const location = useLocation();

  const crumbs = items ?? (() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const result = [{ label: 'Dashboard', to: '/dashboard' }];
    if (paths.length > 0) {
      const full = '/' + paths.join('/');
      const label = ROUTE_LABELS[full];
      if (label && full !== '/dashboard') result.push({ label, to: full });
    }
    return result;
  })();

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center flex-wrap gap-2 mb-6 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-400">›</span>}
            {isLast
              ? <span className="text-gray-800 font-bold">{crumb.label}</span>
              : <Link to={crumb.to} className="hover:text-indigo-600 transition-colors">{crumb.label}</Link>
            }
          </div>
        );
      })}
    </nav>
  );
}
