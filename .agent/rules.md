SYSTEM DIRECTIVE: Kamu adalah Lead Developer untuk "Warung Adjie". Tumpukan teknologi strictly dibatasi pada: PHP Native (Backend/API), React SPA (Frontend), dan PostgreSQL via Supabase (Database). DILARANG KERAS menggunakan framework PHP seperti Laravel. Lingkungan lokal menggunakan Laragon. Semua pembuatan tabel, endpoint, dan state React harus merujuk pada Class Diagram, ERD (khususnya tabel detail_transaksi), dan Sequence Diagram yang tertera di dokumen ini.
Use Case:
Aktor: Pemilik dan Pelanggan. Use case: "Mengelola Data Produk", "Mencatat Transaksi Penjualan", "Melihat Dashboard", "Mengelola Keuangan" (Pemilik), "Melihat Katalog Produk" (Pelanggan).
Pemilik → "Mengelola Data Produk" (Create/Update/Delete)
Pemilik → "Mencatat Transaksi Penjualan"
Pemilik → "Melihat Dashboard"
Pemilik → "Mengelola Keuangan" (laporan laba-rugi)
Pelanggan → "Melihat Katalog Produk"
Class Diagram :Pemilik: method kelolaDataProduk(): void, catatTransaksi(): void, lihatDashboard(): void, kelolaKeuangan(): void
Produk: atribut idProduk: UUID, namaProduk: String, kategori: String, hargaModal: Integer, hargaJual: Integer, stok: Integer; method tambahData(): void, updateData(): void, kurangiStok(jumlah: Integer): void, getStatusKetersediaan(): String
Transaksi: atribut idTransaksi: UUID, tanggalTransaksi: DateTime, totalBayar: Integer; method prosesPembayaran(): void, generateStrukDigital(): void
DetailTransaksi: atribut idDetail: UUID, jumlahBeli: Integer, subTotalHarga: Integer; method hitungSubTotal(): void; relasi "Terdiri dari" ke Transaksi dan "Merujuk pada" ke Produk
Dashboard: atribut totalPenjualanHarian: Integer, daftarStokKritis: List<Produk>; method hitungPenjualanHarian(): void, filterStokMenipis(): void
LaporanKeuangan: atribut bulan: Integer, tahun: Integer, totalPendapatan: Integer, totalModal: Integer, labaRugiBersih: Integer; method kalkulasiLabaRugi(): void, generateGrafik(): void
Pelanggan: method lihatKatalogProduk(): void, terimaStrukDigital(): void
Katalog: method muatDaftarProduk(): List<Produk>
Relasi penting class diagram: Pemilik → "Mengakses" → LaporanKeuangan dan "Melihat" → Dashboard
Pemilik → "Mencatat" / "Mengelola" → Transaksi dan Produk
Dashboard & LaporanKeuangan → "Mengambil data (Harian/Bulanan)" dari Transaksi
Dashboard → "Mengambil data (Stok)" dari Produk
Pelanggan → "Membayar & Menerima Struk" via Transaksi, dan "Mengakses" → Katalog → memuat data dari Produk
Struktur Direktori Proyek (Strict Enforcement):
/warung-adjie
│
├── .agent/
│   └── rules.md               # File instruksi ini (Master Context)
│
├── backend/                   # Backend PHP Native & Config
│   ├── api/                   # Endpoint PHP Native (REST API)
│   │   ├── produk.php             
│   │   ├── transaksi.php          
│   │   └── dashboard.php          
│   ├── config/                # Konfigurasi Backend
│   │   ├── database.php           
│   │   └── env.php                
│   └── helpers/               # Fungsi bantuan PHP (Reusable)
│       ├── response.php           
│       └── auth.php               
│
└── frontend/                  # Proyek React SPA (Vite)
    ├── index.html
    ├── package.json
    ├── src/
    │   ├── assets/            # Gambar, icon, css global
    │   ├── components/        # UI Reusable (Button, Card, Modal Konfirmasi)
    │   ├── pages/             # Halaman utama (Dashboard, Kasir, Produk, Katalog)
    │   ├── services/          # Fungsi fetch/axios untuk memanggil API PHP
    │   └── App.jsx            # Routing utama aplikasi