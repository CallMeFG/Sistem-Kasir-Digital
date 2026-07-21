import { useState, useEffect, useMemo } from 'react';
import { getProduk } from '../services/produkService';
import { getRiwayatTransaksi } from '../services/transaksiService';
import { SkeletonStatCard, SkeletonTable } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => Number(n).toLocaleString('id-ID');

export default function Laporan() {
  const [produkList, setProdukList] = useState([]);
  const [riwayat, setRiwayat]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [bulan, setBulan]           = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProduk, resTrx] = await Promise.all([
        getProduk(),
        getRiwayatTransaksi().catch(() => ({ data: { data: [] } })),
      ]);
      setProdukList(resProduk.data.data || []);
      setRiwayat(resTrx.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => {
    let total_pendapatan = 0;
    let total_modal = 0;
    let laba_kotor = 0;
    const harian = {};
    const kategoriMap = {};
    const produkMap = {};

    const [y, m] = bulan.split('-');
    const targetMonth = `${y}-${m}`;

    riwayat.forEach(trx => {
      const trxDate = trx.tanggal.substring(0, 7);
      if (trxDate === targetMonth) {
        total_pendapatan += Number(trx.total_harga);

        const hari = new Date(trx.tanggal).getDate().toString();
        if (!harian[hari]) harian[hari] = 0;
        harian[hari] += Number(trx.total_harga);

        (trx.detail || []).forEach(d => {
          const produk = produkList.find(p => p.nama === d.nama_barang);
          const hModal = produk ? Number(produk.harga_modal) : Number(d.harga_satuan) * 0.8;
          const modalItem = hModal * d.jumlah;
          const labaItem = (Number(d.harga_satuan) - hModal) * d.jumlah;
          
          total_modal += modalItem;
          laba_kotor += labaItem;

          const kat = produk ? produk.kategori : 'Lainnya';
          if (!kategoriMap[kat]) kategoriMap[kat] = { pendapatan: 0, laba: 0 };
          kategoriMap[kat].pendapatan += Number(d.harga_satuan) * d.jumlah;
          kategoriMap[kat].laba += labaItem;

          if (!produkMap[d.nama_barang]) produkMap[d.nama_barang] = { jumlah: 0, pendapatan: 0 };
          produkMap[d.nama_barang].jumlah += d.jumlah;
          produkMap[d.nama_barang].pendapatan += Number(d.harga_satuan) * d.jumlah;
        });
      }
    });

    const per_hari = Object.keys(harian).sort((a, b) => Number(a) - Number(b)).map(hari => ({
      hari,
      pendapatan: harian[hari]
    }));

    const per_kategori = Object.keys(kategoriMap).map(kat => ({
      kategori: kat,
      pendapatan: kategoriMap[kat].pendapatan,
      laba: kategoriMap[kat].laba
    }));

    const top_produk = Object.keys(produkMap)
      .map(nama => ({
        nama,
        total_terjual: produkMap[nama].jumlah,
        total_pendapatan: produkMap[nama].pendapatan
      }))
      .sort((a, b) => b.total_terjual - a.total_terjual)
      .slice(0, 5);

    return { total_pendapatan, total_modal, laba_kotor, per_hari, per_kategori, top_produk };
  }, [riwayat, produkList, bulan]);

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

  const topProduk = data.top_produk.map(p => ({
    nama: p.nama,
    jumlah: p.total_terjual,
    pendapatan: p.total_pendapatan
  }));

  const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' },
  };

  const [y, m] = bulan.split('-');
  const namaBulan = new Date(Number(y), Number(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const exportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return alert("Izinkan popup untuk mencetak laporan.");
    
    let html = `
      <html>
        <head>
          <title>Laporan Keuangan - ${namaBulan}</title>
          <style>
            @page { margin: 20px; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #666; }
            
            .summary-box { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .stat { flex: 1; background: #f8fafc; padding: 15px; margin: 0 10px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
            .stat-title { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
            .stat-value { font-size: 20px; font-weight: bold; color: #0f172a; }
            .stat-value.green { color: #16a34a; }
            .stat-value.red { color: #dc2626; }
            
            .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f8fafc; color: #475569; font-weight: 600; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">WARUNG ADJIE</div>
            <div class="subtitle">Laporan Keuangan: ${namaBulan}</div>
          </div>
          
          <div class="summary-box">
            <div class="stat">
              <div class="stat-title">Total Pendapatan</div>
              <div class="stat-value">Rp ${fmt(pendapatan)}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Total Modal</div>
              <div class="stat-value">Rp ${fmt(modal)}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Laba Kotor</div>
              <div class="stat-value ${laba >= 0 ? 'green' : 'red'}">Rp ${fmt(laba)}</div>
            </div>
          </div>
          
          <div class="section-title">Pendapatan per Kategori</div>
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th class="text-right">Pendapatan</th>
                <th class="text-right">Laba</th>
              </tr>
            </thead>
            <tbody>
              ${perKategori.map(k => `
                <tr>
                  <td>${k.kat}</td>
                  <td class="text-right">Rp ${fmt(k.pendapatan)}</td>
                  <td class="text-right ${k.laba >= 0 ? 'green' : 'red'}">Rp ${fmt(k.laba)}</td>
                </tr>
              `).join('')}
              ${perKategori.length === 0 ? '<tr><td colspan="3" class="text-center">Tidak ada data</td></tr>' : ''}
            </tbody>
          </table>
          
          <div class="section-title">Top 5 Produk Terlaris</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th>Nama Produk</th>
                <th class="text-center">Terjual</th>
                <th class="text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${topProduk.map((b, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${b.nama}</td>
                  <td class="text-center">${b.jumlah}</td>
                  <td class="text-right">Rp ${fmt(b.pendapatan)}</td>
                </tr>
              `).join('')}
              ${topProduk.length === 0 ? '<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>' : ''}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 40px; font-size: 12px; color: #64748b;">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-textPrimary mb-1">Laporan Bulan {namaBulan}</h2>
          <p className="text-textSecondary text-sm">Ringkasan pendapatan, modal, dan laba kotor</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            className="border border-border rounded-lg bg-input text-textPrimary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm w-full sm:w-auto" 
            value={bulan} 
            onChange={e => setBulan(e.target.value)} 
          />
          <button
            onClick={exportPDF}
            className="btn btn-primary"
            disabled={loading || perHari.length === 0}
          >
            🖨️ Cetak PDF
          </button>
        </div>
      </div>

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

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="font-bold text-textPrimary text-lg mb-4">🏆 Top Produk Terjual</h3>
          {loading ? <SkeletonTable rows={5} cols={3} /> : topProduk.length === 0 ? (
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
                  {topProduk.map((b, i) => (
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


