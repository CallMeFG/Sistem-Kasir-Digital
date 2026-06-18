import { useState, useEffect, useMemo } from 'react';
import { getBarang, createBarang, updateBarang, deleteBarang, restockBarang } from '../services/barangService';
import { BACKEND_URL } from '../services/api';
import { useToast } from '../components/Toast';
import { SkeletonCard } from '../components/Skeleton';
import InputField from '../components/InputField';

function ModalRestock({ barang, onClose, onSuccess, toast }) {
  const [jumlah, setJumlah] = useState('');
  const [loading, setLoading] = useState(false);
  const quickAmounts = [5, 10, 20, 50];

  const handleRestock = async () => {
    if (!jumlah || Number(jumlah) <= 0) return toast.warning('Input tidak valid', 'Masukkan jumlah restock > 0');
    setLoading(true);
    try {
      await restockBarang(barang.id, Number(jumlah));
      toast.success('Restock berhasil!', `Stok "${barang.nama}" bertambah ${jumlah}. Total: ${Number(barang.stok) + Number(jumlah)}`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Gagal restock', 'Terjadi kesalahan saat menambah stok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-[380px]">
        <div className="modal-header">
          <h3 className="font-extrabold text-[15px]">📦 Restock Produk</h3>
          <button className="btn btn-secondary !px-2 !py-1" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="bg-input rounded-xl px-3.5 py-2.5 mb-4">
            <div className="font-bold text-sm">{barang.nama}</div>
            <div className="text-[12.5px] text-textMuted mt-0.5">Stok saat ini: <strong className={barang.stok < 5 ? 'text-errorText' : 'text-textPrimary'}>{barang.stok}</strong></div>
          </div>
          <InputField 
            label="Jumlah Tambahan" 
            type="number" 
            placeholder="Masukkan jumlah..." 
            value={jumlah} 
            onChange={e => setJumlah(e.target.value)} 
          />
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {quickAmounts.map(q => (
              <button key={q} onClick={() => setJumlah(q)} className={`btn btn-sm ${Number(jumlah) === q ? 'btn-primary' : 'btn-secondary'}`}>+{q}</button>
            ))}
          </div>
          {jumlah > 0 && (
            <div className="bg-successBg border border-successBorder rounded-lg px-3 py-2 text-[13px] text-successText font-semibold">
              Stok baru: {Number(barang.stok) + Number(jumlah)}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Batal</button>
          <button onClick={handleRestock} disabled={loading || !jumlah} className="btn btn-primary">
            {loading ? <><span className="spinner" /> Menyimpan...</> : '✅ Tambah Stok'}
          </button>
        </div>
      </div>
    </div>
  );
}

const KATEGORI_LIST = ['Semua', 'Makanan', 'Minuman', 'Sembako', 'Lainnya'];
const SORT_OPTIONS  = [
  { value: 'newest',   label: 'Terbaru' },
  { value: 'name',     label: 'Nama A-Z' },
  { value: 'price_asc', label: 'Harga Termurah' },
  { value: 'price_desc', label: 'Harga Termahal' },
  { value: 'stock_asc',  label: 'Stok Sedikit' },
];

const EMPTY_FORM = { id: '', nama: '', kategori: 'Makanan', harga_modal: '', harga_jual: '', stok: '', gambar: null, gambarFile: null };

export default function DaftarBarang() {
  const toast = useToast();
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterKat, setFilterKat]       = useState('Semua');
  const [sortBy, setSortBy]             = useState('newest');
  const [restockTarget, setRestockTarget] = useState(null);

  useEffect(() => { fetchData(); }, []);

  // Debounce search implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getBarang();
      setDaftarBarang(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data', 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(p => ({ ...p, gambarFile: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = new FormData();
    if (formData.id) payload.append('id', formData.id);
    payload.append('nama', formData.nama);
    payload.append('kategori', formData.kategori);
    payload.append('harga_modal', formData.harga_modal);
    payload.append('harga_jual', formData.harga_jual);
    payload.append('stok', formData.stok);
    if (formData.gambarFile) {
      payload.append('gambar', formData.gambarFile);
    }

    try {
      if (formData.id) {
        await updateBarang(payload);
        toast.success('Berhasil!', `Produk "${formData.nama}" berhasil diupdate.`);
      } else {
        await createBarang(payload);
        toast.success('Berhasil!', `Produk "${formData.nama}" berhasil ditambahkan.`);
      }
      setFormData(EMPTY_FORM);
      fetchData();
    } catch {
      toast.error('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (barang) => {
    setFormData({ ...barang, gambarFile: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus produk "${nama}"?`)) return;
    try {
      await deleteBarang(id);
      toast.success('Dihapus!', `Produk "${nama}" berhasil dihapus.`);
      fetchData();
    } catch {
      toast.error('Gagal menghapus', 'Terjadi kesalahan saat menghapus data.');
    }
  };

  const filtered = useMemo(() => {
    let result = [...daftarBarang];
    if (filterKat !== 'Semua') result = result.filter(b => b.kategori === filterKat);
    if (debouncedSearch) result = result.filter(b => b.nama.toLowerCase().includes(debouncedSearch.toLowerCase()));
    switch (sortBy) {
      case 'name':       result.sort((a, b) => a.nama.localeCompare(b.nama)); break;
      case 'price_asc':  result.sort((a, b) => a.harga_jual - b.harga_jual); break;
      case 'price_desc': result.sort((a, b) => b.harga_jual - a.harga_jual); break;
      case 'stock_asc':  result.sort((a, b) => a.stok - b.stok); break;
      default: break;
    }
    return result;
  }, [daftarBarang, filterKat, debouncedSearch, sortBy]);

  const margin = (b) => {
    const m = b.harga_jual - b.harga_modal;
    const pct = b.harga_modal > 0 ? Math.round((m / b.harga_modal) * 100) : 0;
    return { m, pct };
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar: Search, Filter, Sort */}
      <div className="flex gap-2.5 flex-wrap items-center">
        <input
          className="form-input flex-1 min-w-[200px]"
          placeholder="🔍 Cari nama produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-input form-select w-auto" value={filterKat} onChange={e => setFilterKat(e.target.value)}>
          {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <select className="form-input form-select w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-textMuted text-[12.5px] whitespace-nowrap">
          {filtered.length} produk
        </span>
      </div>

      <div className="flex gap-5 items-start flex-col md:flex-row">
        {/* FORM PANEL */}
        <div className="w-full md:w-[280px] shrink-0">
          <div className="card p-6 sticky top-[84px]">
            <h2 className="font-extrabold text-[15px] text-textPrimary mb-4">
              {formData.id ? '✏️ Edit Produk' : '➕ Tambah Produk'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <InputField label="Nama Produk" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: Indomie Goreng" />
              
              <div className="form-group mb-4">
                <label className="form-label">Kategori</label>
                <select name="kategori" value={formData.kategori} onChange={handleChange} className="form-input form-select">
                  <option value="Makanan">🍔 Makanan</option>
                  <option value="Minuman">🥤 Minuman</option>
                  <option value="Sembako">🍚 Sembako</option>
                  <option value="Lainnya">📦 Lainnya</option>
                </select>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-1"><InputField label="Modal (Rp)" type="number" name="harga_modal" value={formData.harga_modal} onChange={handleChange} required placeholder="0" /></div>
                <div className="flex-1"><InputField label="Jual (Rp)" type="number" name="harga_jual" value={formData.harga_jual} onChange={handleChange} required placeholder="0" /></div>
              </div>

              {/* Conditional Rendering Margin preview */}
              {!formData.harga_modal || !formData.harga_jual ? (
                <div className="bg-warningBg border border-warningBorder rounded-lg px-3 py-2 text-xs text-warningText font-medium">
                  Harap lengkapi harga modal dan jual.
                </div>
              ) : (
                <div className="bg-successBg border border-successBorder rounded-lg px-3 py-2 text-xs">
                  <span className="text-successText font-bold">
                    Margin: Rp {Number(formData.harga_jual - formData.harga_modal).toLocaleString('id-ID')}
                    {' '}({formData.harga_modal > 0 ? Math.round(((formData.harga_jual - formData.harga_modal) / formData.harga_modal) * 100) : 0}%)
                  </span>
                </div>
              )}

              <InputField label="Stok" type="number" name="stok" value={formData.stok} onChange={handleChange} required placeholder="0" />

              <div className="form-group mb-1">
                <label className="form-label">Foto Produk (Opsional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {formData.gambarFile && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-textSecondary">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                    File dipilih: {formData.gambarFile.name}
                  </div>
                )}
                {!formData.gambarFile && formData.gambar && (
                  <div className="mt-2 text-xs text-textSecondary flex items-center gap-2">
                    <img src={`${BACKEND_URL}uploads/${formData.gambar}`} alt="preview" className="w-8 h-8 rounded object-cover" />
                    Biarkan kosong jika tidak ingin mengubah foto lama.
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-1">
                <button type="submit" disabled={saving} className={`btn flex-1 ${formData.id ? 'bg-amber-500 text-white hover:bg-amber-600' : 'btn-primary'}`}>
                  {saving ? <><span className="spinner border-t-white" /> Menyimpan...</> : formData.id ? '💾 Simpan' : '➕ Tambah'}
                </button>
                {formData.id && (
                  <button type="button" onClick={() => setFormData(EMPTY_FORM)} className="btn btn-secondary">Batal</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* GRID BARANG */}
        <div className="flex-1 w-full">
          {restockTarget && (
            <ModalRestock barang={restockTarget} onClose={() => setRestockTarget(null)} onSuccess={fetchData} toast={toast} />
          )}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📦</div>
              <h3 className="text-base text-textSecondary mb-2">Belum ada produk</h3>
              <p className="text-[13.5px]">{search || filterKat !== 'Semua' ? 'Tidak ada produk yang cocok dengan filter.' : 'Tambahkan produk pertama Anda!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filtered.map(b => {
                const { m, pct } = margin(b);
                return (
                  <div key={b.id} className="card p-[18px] flex flex-col gap-2.5 transition-all duration-200 cursor-default hover:-translate-y-0.5">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">{b.kategori}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 border ${
                        b.stok === 0 ? 'bg-red-50 text-red-600 border-red-200' : 
                        b.stok < 10 ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current block" />
                        {b.stok === 0 ? 'Habis' : `Stok: ${b.stok}`}
                      </span>
                    </div>

                    {b.gambar ? (
                      <img src={`${BACKEND_URL}uploads/${b.gambar}`} alt={b.nama} className="w-full h-32 object-cover rounded-lg mt-1 mb-0.5 border border-border" />
                    ) : (
                      <div className="w-full h-32 bg-input rounded-lg flex items-center justify-center border border-border mt-1 mb-0.5 text-textMuted text-xs flex-col gap-1">
                        <span className="text-2xl">📦</span>
                        <span>Tanpa Gambar</span>
                      </div>
                    )}

                    <div className="mt-1">
                      <h3 className="font-bold text-[14.5px] text-textPrimary mb-0.5 leading-snug">{b.nama}</h3>
                      <p className="font-extrabold text-[17px] text-primary-600">
                        Rp {Number(b.harga_jual).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex justify-between text-[11.5px] text-textMuted">
                      <span>Modal: Rp {Number(b.harga_modal).toLocaleString('id-ID')}</span>
                      <span className={`font-semibold ${m > 0 ? 'text-successText' : 'text-textMuted'}`}>+{pct}%</span>
                    </div>

                    <div className="flex gap-2 mt-1 flex-wrap">
                      <button onClick={() => handleEdit(b)} className="btn btn-secondary btn-sm flex-1">✏️ Edit</button>
                      <button onClick={() => setRestockTarget(b)} className="btn btn-sm flex-1 bg-infoBg text-infoText border border-infoBorder">📦 Restock</button>
                      <button onClick={() => handleDelete(b.id, b.nama)} className="btn btn-danger btn-sm w-full">🗑️ Hapus</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}