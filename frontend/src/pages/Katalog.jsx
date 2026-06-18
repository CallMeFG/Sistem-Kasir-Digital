import { useState, useEffect, useMemo } from 'react';
import { getBarang } from '../services/barangService';
import { BACKEND_URL } from '../services/api';

const fmt = (n) => Number(n).toLocaleString('id-ID');
const KATEGORI = ['Semua', 'Makanan', 'Minuman', 'Sembako', 'Lainnya'];

export default function Katalog() {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterKat, setFilterKat]   = useState('Semua');

  useEffect(() => {
    getBarang()
      .then(res => setBarangList(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let res = barangList.filter(b => b.stok > 0);
    if (filterKat !== 'Semua') res = res.filter(b => b.kategori === filterKat);
    if (search) res = res.filter(b => b.nama.toLowerCase().includes(search.toLowerCase()));
    return res;
  }, [barangList, filterKat, search]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 60%, #8b5cf6 100%)',
        padding: '48px 24px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Katalog Warung Adjie</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
            Temukan produk pilihan kami dengan harga terbaik!
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ maxWidth: 900, margin: '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div className="card" style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="form-input"
            placeholder="🔍 Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {KATEGORI.map(k => (
              <button
                key={k}
                onClick={() => setFilterKat(k)}
                className={`btn btn-sm ${filterKat === k ? 'btn-primary' : 'btn-secondary'}`}
              >{k}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Produk */}
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card" style={{ margin: '20px 0' }}>
            <div className="empty-state-icon">🔍</div>
            <h3>Produk tidak ditemukan</h3>
            <p>Coba kata kunci lain atau pilih kategori berbeda.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(b => (
              <div key={b.id} className="card" style={{ padding: 18, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {b.gambar ? (
                  <div style={{
                    height: 120, borderRadius: 12, marginBottom: 14, overflow: 'hidden', border: '1px solid var(--border)'
                  }}>
                    <img src={`${BACKEND_URL}uploads/${b.gambar}`} alt={b.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    height: 120, borderRadius: 12, background: 'var(--input-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 48, marginBottom: 14, border: '1px solid var(--border)'
                  }}>
                    {b.kategori === 'Makanan' ? '🍔' : b.kategori === 'Minuman' ? '🥤' : b.kategori === 'Sembako' ? '🍚' : '📦'}
                  </div>
                )}
                <span className="badge badge-neutral" style={{ fontSize: 11, marginBottom: 8 }}>{b.kategori}</span>
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.3 }}>{b.nama}</h3>
                <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary-600)' }}>Rp {fmt(b.harga_jual)}</p>
                <p style={{ fontSize: 11.5, color: b.stok < 5 ? 'var(--warning-text)' : 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                  {b.stok < 5 ? `⚠️ Sisa: ${b.stok}` : `✅ Tersedia`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12, borderTop: '1px solid var(--border)' }}>
        Warung Adjie © {new Date().getFullYear()} — Sistem Kasir Digital
      </footer>
    </div>
  );
}