import { useState, useEffect, useMemo } from 'react';
import { getRiwayatTransaksi } from '../services/transaksiService';
import { useToast } from '../components/Toast';
import { SkeletonTable } from '../components/Skeleton';
import { printStrukRiwayat } from '../utils/printReceipt';

const fmt = (n) => Number(n).toLocaleString('id-ID');

function exportCSV(data) {
  const rows = [['ID Transaksi', 'Tanggal', 'Waktu', 'Nama Produk', 'Jumlah', 'Harga Satuan', 'Subtotal', 'Total Transaksi']];
  data.forEach(trx => {
    const tgl = new Date(trx.tanggal);
    if (trx.detail && trx.detail.length > 0) {
      trx.detail.forEach(d => {
        rows.push([
          trx.id.substring(0, 8).toUpperCase(),
          tgl.toLocaleDateString('id-ID'),
          tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          d.nama_barang,
          d.jumlah,
          d.harga_satuan,
          d.jumlah * d.harga_satuan,
          trx.total_harga,
        ]);
      });
    } else {
      rows.push([trx.id.substring(0, 8).toUpperCase(), tgl.toLocaleDateString('id-ID'), tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), '-', '-', '-', '-', trx.total_harga]);
    }
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `riwayat-transaksi-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


export default function RiwayatTransaksi() {
  const toast = useToast();
  const [riwayat, setRiwayat]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRiwayatTransaksi();
      setRiwayat(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data', 'Coba refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let res = [...riwayat];
    if (search) {
      res = res.filter(t =>
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        (t.detail || []).some(d => d.nama_barang?.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (dateFrom) res = res.filter(t => new Date(t.tanggal) >= new Date(dateFrom));
    if (dateTo)   res = res.filter(t => new Date(t.tanggal) <= new Date(dateTo + 'T23:59:59'));
    return res;
  }, [riwayat, search, dateFrom, dateTo]);

  const totalFiltered = useMemo(() => filtered.reduce((a, t) => a + Number(t.total_harga), 0), [filtered]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input
          className="form-input"
          placeholder="🔍 Cari ID atau nama produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span style={{ color: 'var(--text-muted)' }}>—</span>
        <input type="date" className="form-input" style={{ width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        {(search || dateFrom || dateTo) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}>
            ✕ Reset
          </button>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { exportCSV(filtered); toast.success('Export berhasil!', `${filtered.length} transaksi diexport ke CSV.`); }}
          disabled={filtered.length === 0}
        >
          📥 Export CSV
        </button>
      </div>

      {!loading && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 10, padding: '10px 16px', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Menampilkan: </span>
            <strong style={{ color: 'var(--primary-600)' }}>{filtered.length} transaksi</strong>
          </div>
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 10, padding: '10px 16px', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <strong style={{ color: 'var(--success-text)' }}>Rp {fmt(totalFiltered)}</strong>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🧾</div>
          <h3>Tidak ada transaksi</h3>
          <p>{search || dateFrom || dateTo ? 'Tidak ada yang cocok dengan filter.' : 'Belum ada riwayat transaksi.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(trx => {
            const isOpen = expanded === trx.id;
            return (
              <div key={trx.id} className="card" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => setExpanded(isOpen ? null : trx.id)}
                  style={{
                    padding: '14px 20px', display: 'flex', alignItems: 'center',
                    gap: 12, cursor: 'pointer', flexWrap: 'wrap',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '3px 8px', borderRadius: 6 }}>
                    #{trx.id.substring(0, 8).toUpperCase()}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      {new Date(trx.tanggal).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {(trx.detail || []).slice(0, 3).map(d => d.nama_barang).join(', ')}{(trx.detail?.length ?? 0) > 3 ? '...' : ''}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--success-text)' }}>
                    Rp {fmt(trx.total_harga)}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                    ▼
                  </span>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-input)', padding: '12px 20px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Detail Produk
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={(e) => { e.stopPropagation(); printStrukRiwayat(trx); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 10px' }}
                      >
                        🖨️ Cetak Struk
                      </button>
                    </div>
                    {(trx.detail || []).length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Tidak ada detail produk</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {trx.detail.map((d, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                            <div>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.nama_barang}</span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{d.jumlah} × Rp {fmt(d.harga_satuan)}</span>
                            </div>
                            <span style={{ fontWeight: 700 }}>Rp {fmt(d.jumlah * d.harga_satuan)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}