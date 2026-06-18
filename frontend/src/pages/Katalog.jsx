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
  const [selectedProduk, setSelectedProduk] = useState(null);

  useEffect(() => {
    getBarang()
      .then(res => setBarangList(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let res = [...barangList];
    if (filterKat !== 'Semua') res = res.filter(b => b.kategori === filterKat);
    if (search) res = res.filter(b => b.nama.toLowerCase().includes(search.toLowerCase()));
    return res;
  }, [barangList, filterKat, search]);

  return (
    <div className="min-h-screen bg-app font-sans">
      <div className="relative overflow-hidden text-center py-12 px-5 md:py-16 pb-16 md:pb-20" style={{
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 60%, #8b5cf6 100%)'
      }}>
        <div className="absolute -top-10 -left-10 w-40 h-40 md:w-52 md:h-52 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🛍️</div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">Katalog Warung Adjie</h1>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto px-4">
            Temukan produk pilihan kami dengan harga terbaik!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-6 md:-mt-8 px-4 relative z-10">
        <div className="card p-3 md:p-4 flex flex-col md:flex-row gap-3">
          <input
            className="form-input flex-1 min-w-0"
            placeholder="🔍 Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {KATEGORI.map(k => (
              <button
                key={k}
                onClick={() => setFilterKat(k)}
                className={`btn btn-sm flex-1 sm:flex-none ${filterKat === k ? 'btn-primary' : 'btn-secondary'}`}
              >{k}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto my-6 md:my-8 px-4 pb-10">
        {loading ? (
          <div className="flex justify-center p-14">
            <div className="spinner w-10 h-10 border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card my-5">
            <div className="empty-state-icon">🔍</div>
            <h3 className="text-base md:text-lg">Produk tidak ditemukan</h3>
            <p className="text-sm text-textMuted">Coba kata kunci lain atau pilih kategori berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {filtered.map(b => (
              <div key={b.id} 
                className={`card p-3 md:p-4 transition-transform duration-200 cursor-pointer flex flex-col ${b.stok > 0 ? 'hover:-translate-y-1' : 'opacity-60 bg-gray-50 grayscale-[0.8]'}`}
                onClick={() => setSelectedProduk(b)}
              >
                {b.gambar ? (
                  <div className="w-full h-28 md:h-36 rounded-xl mb-3 overflow-hidden border border-border shrink-0">
                    <img src={`${BACKEND_URL}uploads/${b.gambar}`} alt={b.nama} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-28 md:h-36 rounded-xl bg-input flex items-center justify-center text-5xl mb-3 border border-border shrink-0">
                    {b.kategori === 'Makanan' ? '🍔' : b.kategori === 'Minuman' ? '🥤' : b.kategori === 'Sembako' ? '🍚' : '📦'}
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <div className="mb-1.5"><span className="badge badge-neutral text-[10px] md:text-xs inline-block">{b.kategori}</span></div>
                  <h3 className="font-bold text-[13px] md:text-[14.5px] mb-1 text-textPrimary leading-snug line-clamp-2">{b.nama}</h3>
                  <div className="mt-auto">
                    <p className="font-black text-[15px] md:text-[17px] text-primary-600">Rp {fmt(b.harga_jual)}</p>
                    <p className={`text-[10.5px] md:text-[11.5px] mt-1.5 font-bold ${b.stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {b.stok > 0 ? `✅ Tersedia` : `❌ Tidak Tersedia`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-5 text-textMuted text-xs border-t border-border">
        Warung Adjie © {new Date().getFullYear()} — Sistem Kasir Digital
      </footer>

      {selectedProduk && (
        <div className="modal-overlay px-4" onClick={(e) => e.target === e.currentTarget && setSelectedProduk(null)}>
          <div className="modal-box w-full max-w-[380px] p-0 overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-border bg-white">
              <h3 className="font-extrabold text-[15px]">Detail Produk</h3>
              <button className="btn btn-secondary !px-2 !py-1" onClick={() => setSelectedProduk(null)}>✕</button>
            </div>
            <div className="p-5 text-center bg-white">
              {selectedProduk.gambar ? (
                <img src={`${BACKEND_URL}uploads/${selectedProduk.gambar}`} alt={selectedProduk.nama} className="w-full h-44 md:h-52 object-cover rounded-xl mb-4 border border-border" />
              ) : (
                <div className="w-full h-44 md:h-52 bg-input rounded-xl flex items-center justify-center text-7xl mb-4 border border-border">
                  {selectedProduk.kategori === 'Makanan' ? '🍔' : selectedProduk.kategori === 'Minuman' ? '🥤' : selectedProduk.kategori === 'Sembako' ? '🍚' : '📦'}
                </div>
              )}
              <span className="badge badge-neutral text-xs mb-2 inline-block">{selectedProduk.kategori}</span>
              <h2 className="text-[19px] font-extrabold text-textPrimary mb-1.5 leading-snug">{selectedProduk.nama}</h2>
              <div className="text-[22px] font-black text-primary-600 mb-4">
                Rp {fmt(selectedProduk.harga_jual)}
              </div>
              <div className={`p-2.5 rounded-lg font-bold text-[13.5px] ${selectedProduk.stok > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {selectedProduk.stok > 0 ? '✅ Status: Tersedia' : '❌ Status: Habis'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-border">
              <button className="btn btn-primary w-full py-2.5" onClick={() => setSelectedProduk(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}