import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBarang } from '../services/barangService';
import { getRiwayatTransaksi } from '../services/transaksiService';
import { SkeletonStatCard, SkeletonChart, SkeletonLine } from '../components/Skeleton';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const fmt = (n) => new Intl.NumberFormat('id-ID').format(n);

export default function Dashboard() {
  const [barangList, setBarangList]       = useState([]);
  const [riwayat, setRiwayat]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterHari, setFilterHari]       = useState(7);
  const [activeChart, setActiveChart]     = useState('line');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBarang, resTrx] = await Promise.all([
        getBarang(),
        getRiwayatTransaksi().catch(() => ({ data: { data: [] } })),
      ]);
      setBarangList(resBarang.data.data || []);
      setRiwayat(resTrx.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const barangKritis = useMemo(() => barangList.filter(b => b.stok < 10), [barangList]);

  const { chartData, totalPendapatan, totalTransaksi, totalLaba, kategoriData, terlaris } = useMemo(() => {
    let filtered = riwayat;
    if (filterHari !== 0) {
      const past = new Date();
      past.setDate(past.getDate() - filterHari);
      filtered = riwayat.filter(t => new Date(t.tanggal) >= past);
    }

    const pendapatan = filtered.reduce((acc, t) => acc + Number(t.total_harga), 0);

    let laba = 0;
    filtered.forEach(t => {
      (t.detail || []).forEach(d => {
        const barang = barangList.find(b => b.nama === d.nama_barang);
        if (barang) {
          laba += (Number(barang.harga_jual) - Number(barang.harga_modal)) * d.jumlah;
        } else {
          laba += (Number(d.harga_satuan) * 0.2) * d.jumlah;
        }
      });
    });

    const grouped = {};
    filtered.forEach(t => {
      const key = new Date(t.tanggal).toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += Number(t.total_harga);
    });
    const chartData = Object.keys(grouped).sort().map(k => ({
      tanggal: new Date(k).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      pendapatan: grouped[k],
    }));

    const penjualan = {};
    filtered.forEach(t => {
      (t.detail || []).forEach(d => {
        if (!penjualan[d.nama_barang]) penjualan[d.nama_barang] = 0;
        penjualan[d.nama_barang] += d.jumlah;
      });
    });
    const terlaris = Object.entries(penjualan)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([nama, jumlah]) => ({ nama, jumlah }));

    const kategoriMap = {};
    filtered.forEach(t => {
      (t.detail || []).forEach(d => {
        const barang = barangList.find(b => b.nama === d.nama_barang);
        const kat = barang?.kategori ?? 'Lainnya';
        if (!kategoriMap[kat]) kategoriMap[kat] = 0;
        kategoriMap[kat] += Number(d.harga_satuan) * d.jumlah;
      });
    });
    const kategoriData = Object.entries(kategoriMap).map(([kat, total]) => ({ kat, total }));

    return { chartData, totalPendapatan: pendapatan, totalTransaksi: filtered.length, totalLaba: laba, kategoriData, terlaris };
  }, [riwayat, filterHari, barangList]);

  const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)', color: 'var(--text-primary)' },
    labelStyle: { fontWeight: 700, color: 'var(--text-primary)' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-textPrimary mb-1">Ringkasan Penjualan 📊</h2>
          <p className="text-textSecondary text-sm">Pantau performa warung Anda secara real-time</p>
        </div>
        <select
          className="border border-border rounded-lg bg-input text-textPrimary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm w-full sm:w-auto min-w-[160px]"
          value={filterHari}
          onChange={e => setFilterHari(Number(e.target.value))}
        >
          <option value={7}>7 Hari Terakhir</option>
          <option value={30}>30 Hari Terakhir</option>
          <option value={0}>Semua Waktu</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Total Pendapatan</div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">💰</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-textPrimary mb-1">Rp {fmt(totalPendapatan)}</div>
                <div className="text-xs text-textMuted">{filterHari === 0 ? 'Semua waktu' : `${filterHari} hari terakhir`}</div>
              </div>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Estimasi Laba</div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl">📈</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">Rp {fmt(totalLaba)}</div>
                <div className="text-xs text-textMuted">Harga jual - modal</div>
              </div>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Total Transaksi</div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">🧾</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{totalTransaksi}</div>
                <div className="text-xs text-textMuted">Struk terbayar</div>
              </div>
            </div>

            <div className={`bg-card p-5 rounded-xl shadow-sm border flex flex-col justify-between ${barangKritis.length > 0 ? 'border-red-400 border-l-4' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-textSecondary text-sm font-semibold">Stok Kritis</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${barangKritis.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {barangKritis.length > 0 ? '⚠️' : '✅'}
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${barangKritis.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {barangKritis.length} <span className="text-sm font-medium">produk</span>
                </div>
                <div className="text-xs text-textMuted">{barangKritis.length === 0 ? 'Semua stok produk aman' : 'Perlu restock segera'}</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-textPrimary text-lg">📈 Tren Pendapatan</h3>
            <div className="flex gap-2">
              {['line', 'bar'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveChart(t)} 
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeChart === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-input text-textSecondary hover:bg-border'
                  }`}
                >
                  {t === 'line' ? '📉' : '📊'}
                </button>
              ))}
            </div>
          </div>
          {loading ? <SkeletonChart /> : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📉</div>
              <p className="text-sm">Belum ada data penjualan pada periode ini.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v/1000}k`} dx={-4} />
                    <Tooltip formatter={v => [`Rp ${fmt(v)}`, 'Pendapatan']} {...tooltipStyle} />
                    <Line type="monotone" dataKey="pendapatan" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v/1000}k`} dx={-4} />
                    <Tooltip formatter={v => [`Rp ${fmt(v)}`, 'Pendapatan']} {...tooltipStyle} />
                    <Bar dataKey="pendapatan" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border lg:col-span-1">
          <h3 className="font-bold text-textPrimary text-lg mb-4">🏆 Produk Terlaris</h3>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} height="40px" style={{ marginBottom: 8 }} />)
          ) : terlaris.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-xs">Belum ada data</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {terlaris.map((item, i) => {
                const max = terlaris[0]?.jumlah ?? 1;
                const pct = Math.round((item.jumlah / max) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-semibold text-textSecondary">{i + 1}. {item.nama}</span>
                      <span className="font-bold text-indigo-600">{item.jumlah} terjual</span>
                    </div>
                    <div className="h-2 w-full bg-input rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-textPrimary text-lg">📄 Transaksi Terakhir</h3>
            <Link to="/riwayat-transaksi" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Lihat Semua &rarr;</Link>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} height="50px" style={{ marginBottom: 8 }} />)
          ) : riwayat.length === 0 ? (
            <div className="flex justify-center py-6 text-gray-400 text-sm">
              <p>Belum ada transaksi</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {riwayat.slice(0, 6).map(trx => (
                <div key={trx.id} className="flex justify-between items-center p-3 rounded-lg bg-input border border-border">
                  <div>
                    <div className="text-xs text-textMuted mb-0.5">
                      {new Date(trx.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="text-sm text-textSecondary font-medium">
                      {(trx.detail || []).slice(0, 2).map(d => d.nama_barang).join(', ')}
                      {(trx.detail || []).length > 2 && ', ...'}
                      {!(trx.detail || []).length && '—'}
                    </div>
                  </div>
                  <span className="font-extrabold text-green-600 text-sm">
                    Rp {fmt(trx.total_harga)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-textPrimary text-lg">⚠️ Stok Kritis</h3>
            <Link to="/barang" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Kelola &rarr;</Link>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} height="44px" style={{ marginBottom: 8 }} />)
          ) : barangKritis.length === 0 ? (
            <div className="bg-successBg text-successText border border-successBorder rounded-xl p-4 text-center font-semibold text-sm">
              ✅ Semua stok produk aman!
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {barangKritis.map(b => (
                <div key={b.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                  b.stok === 0 ? 'bg-errorBg border-errorBorder' : 'bg-warningBg border-warningBorder'
                }`}>
                  <div>
                    <div className="font-bold text-sm text-textPrimary">{b.nama}</div>
                    <div className="text-xs text-textMuted">{b.kategori}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                    b.stok === 0 ? 'text-errorText border border-errorBorder' : 'text-warningText border border-warningBorder'
                  }`}>
                    {b.stok === 0 ? 'HABIS' : `Sisa: ${b.stok}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}