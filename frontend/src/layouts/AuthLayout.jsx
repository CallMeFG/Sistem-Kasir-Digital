import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Loading from "../components/Loading";

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-sans)',
      background: 'var(--bg-app)',
    }}>
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }} className="no-print" id="auth-panel">
        <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: '40%', right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: '#fff' }}>Warung Adjie</h1>
          <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6, maxWidth: 280, margin: '0 auto 36px' }}>
            Sistem kasir digital untuk manajemen warung yang lebih mudah dan efisien.
          </p>

          {[
            { icon: '📊', text: 'Dashboard laporan real-time' },
            { icon: '🛒', text: 'Kasir cepat & akurat' },
            { icon: '📦', text: 'Manajemen stok otomatis' },
            { icon: '🧾', text: 'Riwayat transaksi lengkap' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 16px', marginBottom: 10,
              backdropFilter: 'blur(8px)', textAlign: 'left'
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, opacity: 0.9 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 460,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--bg-card)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
          
          <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 28 }}>
            Warung Adjie © {new Date().getFullYear()} — Sistem Kasir Digital
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #auth-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
