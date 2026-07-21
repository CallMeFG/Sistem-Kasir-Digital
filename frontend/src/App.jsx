import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const MainLayout       = lazy(() => import('./layouts/MainLayout'));
const AuthLayout       = lazy(() => import('./layouts/AuthLayout'));

const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const Forgot           = lazy(() => import('./pages/Forgot'));

const Dashboard        = lazy(() => import('./pages/Dashboard'));
const DaftarProduk     = lazy(() => import('./pages/DaftarProduk'));
const Transaksi        = lazy(() => import('./pages/Transaksi'));
const RiwayatTransaksi = lazy(() => import('./pages/RiwayatTransaksi'));
const Laporan          = lazy(() => import('./pages/Laporan'));
const Katalog          = lazy(() => import('./pages/Katalog'));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-app gap-4">
      <div className="spinner w-8 h-8" />
      <p className="text-textMuted text-[13.5px]">Memuat halaman...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot" element={<Forgot />} />
              </Route>

              <Route element={<MainLayout />}>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/barang" element={<ProtectedRoute><DaftarProduk /></ProtectedRoute>} />
                <Route path="/transaksi" element={<ProtectedRoute><Transaksi /></ProtectedRoute>} />
                <Route path="/riwayat-transaksi" element={<ProtectedRoute><RiwayatTransaksi /></ProtectedRoute>} />
                <Route path="/laporan" element={<ProtectedRoute><Laporan /></ProtectedRoute>} />
              </Route>

              <Route path="/katalog" element={<Katalog />} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}