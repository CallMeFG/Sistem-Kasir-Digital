import { useState, useEffect } from 'react';
import { getLaporan } from '../services/laporanService';
import { SkeletonStatCard, SkeletonTable } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => Number(n).toLocaleString('id-ID');

export default function Laporan() {
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [bulan, setBulan]           = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    setLoading(true);
    const [y, m] = bulan.split('-');
    getLaporan(m, y)
      .then(res => {
        setLaporanData(res.data.data);
      })
      .catch((err) => {
        console.error("API Error:", err.response ? err.response.data : err);
        setLaporanData(null);
      })
      .finally(() => setLoading(false));
  }, [bulan]);

  const data = laporanData || {
    total_pendapatan: 0,
    total_modal: 0,
    laba_kotor: 0,
    per_hari: [],
    per_kategori: [],
    top_barang: []
  };

  const {
    total_pendapatan: pendapatan,
    total_modal: modal,
    laba_kotor: laba,
    per_hari: perHari
  } = data;

  const perKategori = data.per_kategori.map(k => ({
    kat: k.kategori,
    pendapatan: k.pendapatan,
    laba: k.laba
  }));

  const topBarang = data.top_barang.map(b => ({
    nama: b.nama,
    jumlah: b.total_terjual,
    pendapatan: b.total_pendapatan
  }));

  const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' },
  };

  const [y, m] = bulan.split('-');
  const namaBulan = new Date(Number(y), Number(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-textPrimary mb-1">Laporan Bulan {namaBulan}</h2>
          <p className="text-textSecondary text-sm">Ringkasan pendapatan, modal, dan laba kotor</p>
        </div>
        <input 
          type="month" 
          className="border border-border rounded-lg bg-input text-textPrimary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm w-full sm:w-auto" 
          value={bulan} 
          onChange={e => setBulan(e.target.value)} 
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />) : (
          <>
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Total Pendapatan</div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">💰</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-textPrimary mb-1">Rp {fmt(pendapatan)}</div>
                <div className="text-xs text-textMuted">Dari penjualan</div>
              </div>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Total Modal</div>
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl">📦</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-textPrimary mb-1">Rp {fmt(modal)}</div>
                <div className="text-xs text-textMuted">Harga beli produk</div>
              </div>
            </div>

            <div className={`bg-card p-5 rounded-xl shadow-sm border border-border border-l-4 flex flex-col justify-between ${laba >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Laba Kotor</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${laba >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>📈</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${laba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {fmt(laba)}
                </div>
                <div className="text-xs text-textMuted">
                  Margin: {pendapatan > 0 ? Math.round((laba / pendapatan) * 100) : 0}%
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Grafik Harian */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
        <h3 className="font-bold text-textPrimary text-lg mb-5">📊 Pendapatan Harian — {namaBulan}</h3>
        {loading ? <div className="animate-pulse bg-input rounded-lg h-56 w-full" /> : perHari.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📉</div>
            <p className="text-sm">Belum ada data penjualan pada bulan ini.</p>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perHari} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hari" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v/1000}k`} dx={-4} />
                <Tooltip formatter={v => [`Rp ${fmt(v)}`, 'Pendapatan']} {...tooltipStyle} />
                <Bar dataKey="pendapatan" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Kategori */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="font-bold text-textPrimary text-lg mb-4">🏷️ Laba per Kategori</h3>
          {loading ? <SkeletonTable rows={3} cols={3} /> : perKategori.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <p className="text-sm">Tidak ada data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-textSecondary">
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold">Pendapatan</th>
                    <th className="pb-3 font-semibold text-right">Laba</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {perKategori.map(r => (
                    <tr key={r.kat} className="hover:bg-input transition-colors">
                      <td className="py-3 font-medium text-textPrimary">{r.kat}</td>
                      <td className="py-3 text-textSecondary">Rp {fmt(r.pendapatan)}</td>
                      <td className={`py-3 font-bold text-right ${r.laba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rp {fmt(r.laba)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Barang */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="font-bold text-textPrimary text-lg mb-4">🏆 Top Produk Terjual</h3>
          {loading ? <SkeletonTable rows={5} cols={3} /> : topBarang.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <p className="text-sm">Tidak ada data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-textSecondary">
                    <th className="pb-3 font-semibold w-8">#</th>
                    <th className="pb-3 font-semibold">Nama Produk</th>
                    <th className="pb-3 font-semibold text-center">Terjual</th>
                    <th className="pb-3 font-semibold text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topBarang.map((b, i) => (
                    <tr key={b.nama} className="hover:bg-input transition-colors">
                      <td className="py-3 font-bold text-textMuted">{i + 1}</td>
                      <td className="py-3 font-medium text-textPrimary">{b.nama}</td>
                      <td className="py-3 text-textSecondary text-center">{b.jumlah}</td>
                      <td className="py-3 font-bold text-textPrimary text-right">Rp {fmt(b.pendapatan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
