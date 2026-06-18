import { useState, useEffect, useMemo } from 'react';
import { getBarang } from '../services/barangService';
import { createTransaksi } from '../services/transaksiService';
import { useToast } from '../components/Toast';

const fmt = (n) => Number(n).toLocaleString('id-ID');

function ModalBayar({ keranjang, totalHarga, onClose, onConfirm, loading }) {
  const [uangBayar, setUangBayar] = useState('');
  const kembalian = uangBayar ? Number(uangBayar) - totalHarga : 0;
  const quickAmounts = [totalHarga, Math.ceil(totalHarga / 5000) * 5000, Math.ceil(totalHarga / 10000) * 10000, Math.ceil(totalHarga / 50000) * 50000].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="font-extrabold text-base">🛒 Konfirmasi Pembayaran</h3>
          <button className="btn btn-secondary !px-2 !py-1" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="mb-4">
            {keranjang.map(item => (
              <div key={item.id} className="flex justify-between py-1.5 border-b border-border text-[13px]">
                <span>{item.nama} × {item.jumlah}</span>
                <span className="font-bold">Rp {fmt(item.harga_jual * item.jumlah)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-extrabold text-base mb-5 text-primary-600">
            <span>Total</span><span>Rp {fmt(totalHarga)}</span>
          </div>

          <div className="form-group mb-2.5">
            <label className="form-label">Uang Dibayar (Rp)</label>
            <input
              autoFocus
              type="number" min={totalHarga}
              className="form-input"
              placeholder="Masukkan nominal uang..."
              value={uangBayar}
              onChange={e => setUangBayar(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap mb-4">
            {quickAmounts.map(a => (
              <button key={a} onClick={() => setUangBayar(a)} className={`btn btn-sm ${Number(uangBayar) === a ? 'btn-primary' : 'btn-secondary'}`}>
                Rp {fmt(a)}
              </button>
            ))}
          </div>

          {uangBayar && (
            <div className={`rounded-xl px-4 py-3 text-center border ${kembalian >= 0 ? 'bg-successBg border-successBorder text-successText' : 'bg-errorBg border-errorBorder text-errorText'}`}>
              {kembalian >= 0 ? (
                <><div className="text-xs font-semibold">Kembalian</div>
                <div className="text-[22px] font-black">Rp {fmt(kembalian)}</div></>
              ) : (
                <div className="font-semibold">⚠️ Uang kurang Rp {fmt(Math.abs(kembalian))}</div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Batal</button>
          <button
            onClick={() => onConfirm(kembalian)}
            disabled={loading || !uangBayar || kembalian < 0}
            className="btn btn-primary"
          >  
            {loading ? <><span className="spinner border-t-white" /> Memproses...</> : '✅ Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalStruk({ struk, onClose }) {
  const handlePrint = () => window.print();
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-[360px]">
        <div className="modal-header">
          <h3 className="font-extrabold">🧾 Struk Transaksi</h3>
          <button className="btn btn-secondary !px-2 !py-1" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body struk-print" id="struk-area">
          <div className="text-center mb-4 border-b border-dashed border-border pb-3">
            <div className="text-xl">📦</div>
            <div className="font-black text-base">WARUNG ADJIE</div>
            <div className="text-[11px] text-textMuted">
              {new Date(struk.tanggal).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
            </div>
          </div>
          {struk.items.map((item, i) => (
            <div key={i} className="flex justify-between text-[13px] mb-1.5">
              <div>
                <div className="font-semibold">{item.nama}</div>
                <div className="text-[11px] text-textMuted">{item.jumlah} × Rp {fmt(item.harga_jual)}</div>
              </div>
              <span className="font-bold">Rp {fmt(item.harga_jual * item.jumlah)}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-border mt-2.5 pt-2.5">
            <div className="flex justify-between font-extrabold text-[15px] mb-1">
              <span>Total</span><span>Rp {fmt(struk.total)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span>Dibayar</span><span>Rp {fmt(struk.dibayar)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-successText font-bold">
              <span>Kembalian</span><span>Rp {fmt(struk.kembalian)}</span>
            </div>
          </div>
          <div className="text-center mt-4 text-[11px] text-textMuted">
            Terima kasih sudah berbelanja! 🙏
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Tutup</button>
          <button onClick={handlePrint} className="btn btn-primary">🖨️ Cetak Struk</button>
        </div>
      </div>
    </div>
  );
}

export default function Transaksi() {
  const toast = useToast();
  const [barangList, setBarangList]   = useState([]);
  const [keranjang, setKeranjang]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [paying, setPaying]           = useState(false);
  const [search, setSearch]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterKat, setFilterKat]     = useState('Semua');
  const [showModal, setShowModal]     = useState(false);
  const [struk, setStruk]             = useState(null);

  useEffect(() => { fetchBarang(); }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchBarang = async () => {
    try {
      const res = await getBarang();
      setBarangList(res.data.data || []);
    } catch { toast.error('Gagal memuat produk', ''); }
    finally { setLoading(false); }
  };

  const tambah = (item) => {
    if (item.stok <= 0) return toast.warning('Stok habis!', `Produk "${item.nama}" tidak tersedia.`);
    const exist = keranjang.find(x => x.id === item.id);
    if (exist) {
      if (exist.jumlah >= item.stok) return toast.warning('Stok tidak cukup!', `Sisa stok: ${item.stok}`);
      setKeranjang(k => k.map(x => x.id === item.id ? { ...x, jumlah: x.jumlah + 1 } : x));
    } else {
      setKeranjang(k => [...k, { ...item, jumlah: 1 }]);
    }
  };

  const ubahJumlah = (id, delta) => {
    setKeranjang(k => k.map(item => {
      if (item.id !== id) return item;
      const nq = item.jumlah + delta;
      if (nq < 1) return item;
      if (nq > item.stok) { toast.warning('Stok tidak cukup!', `Maks: ${item.stok}`); return item; }
      return { ...item, jumlah: nq };
    }));
  };

  const hapus = (id) => setKeranjang(k => k.filter(x => x.id !== id));

  const totalHarga = useMemo(() => keranjang.reduce((acc, c) => acc + c.harga_jual * c.jumlah, 0), [keranjang]);

  const handleBayar = async (kembalian) => {
    setPaying(true);
    try {
      await createTransaksi({
        total_bayar: totalHarga,
        details: keranjang.map(item => ({ 
          id_produk: item.id, 
          jumlah_beli: item.jumlah,
          subtotal_harga: item.harga_jual * item.jumlah
        })),
      });
      setStruk({
        items: keranjang,
        total: totalHarga,
        dibayar: totalHarga + kembalian,
        kembalian,
        tanggal: new Date().toISOString(),
      });
      setKeranjang([]);
      setShowModal(false);
      fetchBarang();
      toast.success('Transaksi berhasil!', `Total: Rp ${Number(totalHarga).toLocaleString('id-ID')}`);
    } catch {
      toast.error('Transaksi gagal', 'Periksa koneksi dan stok produk.');
    } finally {
      setPaying(false);
    }
  };

  const filteredBarang = useMemo(() => {
    let res = barangList;
    if (filterKat !== 'Semua') res = res.filter(b => b.kategori === filterKat);
    if (debouncedSearch) res = res.filter(b => b.nama.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return res;
  }, [barangList, filterKat, debouncedSearch]);

  return (
    <div className="flex gap-5 h-[calc(100vh-130px)] min-h-[500px] flex-col md:flex-row">
      {/* Modals */}
      {showModal && (
        <ModalBayar
          keranjang={keranjang}
          totalHarga={totalHarga}
          onClose={() => setShowModal(false)}
          onConfirm={handleBayar}
          loading={paying}
        />
      )}
      {struk && <ModalStruk struk={struk} onClose={() => setStruk(null)} />}

      {/* KIRI: Daftar Barang */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="p-4 px-5 border-b border-border">
          <h2 className="font-extrabold text-base mb-3">Pilih Produk</h2>
          <div className="flex gap-2 flex-wrap">
            <input className="form-input flex-1 min-w-[150px]" placeholder="🔍 Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-input form-select w-auto" value={filterKat} onChange={e => setFilterKat(e.target.value)}>
              {['Semua', 'Makanan', 'Minuman', 'Sembako', 'Lainnya'].map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="spinner w-8 h-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredBarang.map(item => {
                const inKeranjang = keranjang.find(x => x.id === item.id);
                const habis = item.stok <= 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => tambah(item)}
                    className={`border-[1.5px] rounded-xl px-3 py-3.5 relative transition-all duration-150 ${inKeranjang ? 'border-primary-500 bg-primary-50' : 'border-border bg-card'} ${habis ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                  >
                    {inKeranjang && (
                      <div className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-primary-600 rounded-full text-white text-[11px] font-black flex items-center justify-center shadow-md">
                        {inKeranjang.jumlah}
                      </div>
                    )}
                    <p className="font-bold text-[13.5px] text-textPrimary mb-1 leading-snug">{item.nama}</p>
                    <p className="font-extrabold text-primary-600 text-sm">Rp {fmt(item.harga_jual)}</p>
                    <p className={`text-[11px] font-medium mt-1 ${item.stok < 5 ? 'text-warningText' : 'text-textMuted'}`}>
                      {habis ? '❌ Habis' : `Stok: ${item.stok}`}
                    </p>
                  </div>
                );
              })}
              {filteredBarang.length === 0 && (
                <div className="empty-state col-span-full py-10">
                  <div className="empty-state-icon">🔍</div>
                  <p>Tidak ada produk ditemukan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KANAN: Keranjang */}
      <div className="card w-full md:w-[320px] flex flex-col overflow-hidden border-t-4 border-t-primary-600 shrink-0 h-full">
        <div className="p-4 px-5 border-b border-border">
          <h2 className="font-extrabold text-base flex items-center gap-2">
            🛒 Keranjang
            {keranjang.length > 0 && (
              <span className="bg-primary-600 text-white rounded-full text-[11px] font-extrabold px-2 py-0.5 shadow-sm">
                {keranjang.reduce((a, c) => a + c.jumlah, 0)} item
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 px-5">
          {keranjang.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon">🛒</div>
              <p className="text-xs">Keranjang masih kosong.<br />Klik produk untuk menambahkan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {keranjang.map(item => (
                <div key={item.id} className="border-b border-border pb-2.5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-[13.5px] flex-1 leading-snug">{item.nama}</span>
                    <button onClick={() => hapus(item.id)} className="bg-transparent border-none cursor-pointer text-errorText text-sm p-0 hover:scale-110 transition-transform">✕</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button onClick={() => ubahJumlah(item.id, -1)} className="btn btn-secondary !px-2.5 !py-0.5 text-base">−</button>
                      <span className="font-extrabold min-w-[20px] text-center">{item.jumlah}</span>
                      <button onClick={() => ubahJumlah(item.id, 1)}  className="btn btn-secondary !px-2.5 !py-0.5 text-base">+</button>
                    </div>
                    <span className="font-bold text-[13.5px]">Rp {fmt(item.harga_jual * item.jumlah)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Keranjang */}
        <div className="p-4 px-5 border-t-2 border-dashed border-border bg-bg-app">
          <div className="flex justify-between font-black text-lg mb-3.5 text-textPrimary">
            <span>Total</span>
            <span className="text-primary-600">Rp {fmt(totalHarga)}</span>
          </div>
          <button
            onClick={() => { if (keranjang.length === 0) return toast.warning('Keranjang kosong!', ''); setShowModal(true); }}
            className="btn btn-primary btn-lg btn-block"
            disabled={keranjang.length === 0}
          >
            💳 Proses Pembayaran
          </button>
          {keranjang.length > 0 && (
            <button onClick={() => setKeranjang([])} className="btn btn-secondary btn-sm btn-block mt-2 justify-center">
              🗑️ Kosongkan Keranjang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}