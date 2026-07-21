# Warung Adjie - Sistem Kasir Digital (Point of Sales)

**Warung Adjie** adalah aplikasi Point of Sales (POS) dan manajemen inventaris berbasis web yang dirancang untuk mengotomatisasi operasional transaksi, pengelolaan stok, serta analisis laporan keuangan pada toko atau warung secara cepat, akurat, dan terstruktur.

Aplikasi ini dibangun menggunakan arsitektur terpisah (*decoupled architecture*):
- **Frontend:** React.js (Vite + Tailwind CSS) untuk antarmuka yang responsif, interaktif, dan berkecepatan tinggi.
- **Backend:** PHP 8 Native (OOP) dengan PDO Database Abstraction Layer dan Custom Front Controller (`index.php`) yang berkomunikasi melalui protokol REST API berformat JSON.
- **Database:** MySQL dengan relasi antar-tabel dan dukungan transaksi ACID.

---

## Fitur Utama Sistem

### 1. Transaksi Kasir (Point of Sales) & Tombol Nominal Cepat
- **Kalkulasi Uang Pas Dinamis:** Kasir tidak perlu mengetik nominal pembayaran secara manual. Sistem secara otomatis menghasilkan tombol pecahan nominal (*Uang Pas*, kelipatan terdekat, serta pecahan uang kertas standar Rp 20.000 / Rp 50.000) berdasarkan total belanja saat itu.
- **Integritas Transaksi (ACID Database Transaction):** Setiap pembayaran diproses menggunakan mekanisme *Database Transaction* (`beginTransaction()`, `commit()`, `rollBack()`). Penyimpanan nota penjualan dan pemotongan stok barang dieksekusi sebagai satu kesatuan kerja yang atomik untuk mencegah ketidakkonsistenan data atau stok minus di gudang.
- **Cetak Struk Thermal 58mm:** Dilengkapi utilitas cetak struk berbasis tabel HTML klasik (`<table>`) dan CSS `@page { size: 50mm 210mm; }` yang kompatibel dengan berbagai driver printer thermal ESC/POS.

### 2. Manajemen Inventaris & Restock Stok Cepat
- **Pengelolaan Katalog Produk (CRUD):** Admin dapat menambahkan barang baru, mengedit informasi harga modal, harga jual, kategori, stok, serta mengunggah gambar produk.
- **Restock Cepat langsung di Kartu Produk:** Tombol khusus **`+ Stok`** pada kartu produk memungkinkan admin menambahkan stok barang masuk dalam hitungan detik (via input mini yang muncul langsung di kartu) tanpa harus membuka atau mengisi ulang seluruh formulir edit barang.

### 3. Analisis Keuangan & Perhitungan Laba Kotor Otomatis
- **Agregasi Multi-Tabel (`JSON_ARRAYAGG`):** Backend menggunakan query SQL modern `JSON_ARRAYAGG(JSON_OBJECT(...))` untuk mengambil riwayat transaksi beserta seluruh detail item dalam satu kali eksekusi query (menghindari *N+1 Query Problem*).
- **Komputasi Laba Bersih di Browser (`useMemo`):** Sistem secara otomatis menghitung **Laba Kotor (*Gross Profit*)** (`Pendapatan Kotor - Total Harga Modal`) untuk setiap item terjual, menyajikan rincian penjualan per kategori barang, serta mengidentifikasi produk terlaris (*Top Products*) tanpa membebani pemrosesan server.
- **Visualisasi Data Interaktif:** Integrasi pustaka grafik `recharts` (`BarChart` & `LineChart`) untuk menyajikan tren pendapatan harian dan kontribusi laba per kategori.

### 4. Katalog Publik Responsif dengan Indikator Ketersediaan
- **Akses Cepat Pelanggan (`/katalog`):** Pelanggan dapat mengecek daftar barang, harga, serta ketersediaan produk secara langsung melalui perangkat seluler maupun desktop.
- **Indikator Stok Habis:** Jika stok produk bernilai `0`, kartu produk otomatis dirender dengan penanda visual *badge* **"Tidak Tersedia"** dan visual yang non-aktif (*grayscale*), mencegah pemesanan pada barang yang kosong.

---

## Arsitektur & Teknologi

| Lapisan | Teknologi & Pustaka | Deskripsi Teknis |
| :--- | :--- | :--- |
| **Frontend** | **React.js 18** (Vite) | Library utama antarmuka pengguna berbasis komponen modular (*Single Page Application*). |
| | **Tailwind CSS** | Styling utility-first untuk desain responsif dan tata letak yang konsisten. |
| | **Axios & React Router DOM** | Komunikasi HTTP REST API ke backend dan manajemen navigasi rute internal. |
| | **Recharts** | Rendering visualisasi grafik analitik keuangan di dasbor dan laporan. |
| **Backend** | **PHP 8+ Native OOP** | Arsitektur MVC (*Model-View-Controller*) tanpa framework berat dengan penanganan rute terpusat (`index.php`). |
| | **PDO MySQL** | Database abstraction layer dengan **Prepared Statements** (`bindParam`) untuk keamanan 100% dari SQL Injection. |
| | **JsonView Helper** | Standardisasi format keluaran respons HTTP (`status`, `message`, `data`). |
| **Database** | **MySQL / MariaDB** | Sistem manajemen basis data relasional (`users`, `produk`, `transaksi`, `detail_transaksi`). |

---

## Struktur Direktori Proyek

```text
warung-adjie/
├── backend/                  # Server PHP Native REST API
│   ├── config/               # Konfigurasi koneksi database (database.php, .env)
│   ├── controllers/          # Logika pengatur alur (ProdukController, TransaksiController, dll.)
│   ├── models/               # Query PDO & transaksi ACID database (Produk, Transaksi, User)
│   ├── views/                # Helper standardisasi output JSON (JsonView.php)
│   ├── uploads/              # Direktori penyimpanan gambar produk
│   └── index.php             # Front Controller / Custom Router
│
├── frontend/                 # Aplikasi Antarmuka React (Vite)
│   ├── src/
│   │   ├── components/       # Komponen UI modular (Navbar, Modal, Card, Toast, Chart)
│   │   ├── pages/            # Halaman utama (Dashboard, Katalog, Kasir, Laporan, DaftarProduk)
│   │   ├── services/         # Penghubung endpoint API Axios (produkService, transaksiService)
│   │   ├── utils/            # Utilitas tambahan (printReceipt.js untuk cetak struk thermal)
│   │   └── App.jsx           # Root komponen & definisi React Router
│   ├── package.json          # Daftar dependensi Javascript & skrip build
│   └── vite.config.js        # Konfigurasi server Vite
│
└── warung_adjie.sql          # Skema basis data & data awal (dump SQL)
```

---

## Panduan Instalasi dan Menjalankan Sistem Secara Lokal

### 1. Persiapan Lingkungan Server (Backend)
1. Pastikan Anda telah menginstal **PHP 8+** dan **MySQL** (misalnya menggunakan Laragon atau XAMPP).
2. Buat basis data baru di MySQL dengan nama `warung_adjie`.
3. Impor berkas struktur database `warung_adjie.sql` ke dalam basis data tersebut.
4. Periksa dan sesuaikan kredensial koneksi database pada berkas `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_NAME=warung_adjie
   DB_USER=root
   DB_PASS=
   ```
5. Pastikan direktori proyek berada di dalam folder `www` (Laragon) atau `htdocs` (XAMPP). Backend API harus dapat diakses melalui browser pada alamat URL: `http://localhost/project/warung-adjie/backend/index.php`.

### 2. Persiapan Antarmuka Pengguna (Frontend)
1. Buka terminal/command prompt dan arahkan ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Instal seluruh dependensi pustaka JavaScript:
   ```bash
   npm install
   ```
3. Sesuaikan alamat URL API pada berkas lingkungan `.env` (atau `.env.local`) di dalam direktori `frontend`:
   ```env
   VITE_API_URL=http://localhost/project/warung-adjie/backend/index.php?route=
   ```
   *(Catatan: Sesuaikan path `project/warung-adjie` dengan nama direktori dan lokasi penyimpanan di server web lokal Anda).*
4. Jalankan server pengembangan (*development server*) Vite:
   ```bash
   npm run dev
   ```
5. Akses aplikasi melalui browser pada alamat yang ditampilkan di terminal (secara default `http://localhost:5173`).

---

## Rincian Tabel Basis Data

1. **`produk`**: Menyimpan master data barang warung (kolom: `id_produk`, `nama_produk`, `kategori`, `harga_modal`, `harga_jual`, `stok`, `gambar`).
2. **`transaksi`**: Menyimpan data nota atau riwayat pembayaran utama (kolom: `id_transaksi`, `tanggal`, `total_bayar`).
3. **`detail_transaksi`**: Menyimpan item rincian dari setiap nota transaksi (kolom: `id_detail`, `id_transaksi`, `id_produk`, `jumlah_beli`, `subtotal_harga`).
4. **`users`**: Menyimpan kredensial admin/kasir warung (kolom: `id_user`, `email`, `password`).

---
*Proyek ini dikembangkan sebagai implementasi sistem kasir digital (POS) yang mengutamakan kecepatan operasional, keakuratan kalkulasi keuangan, dan kebersihan arsitektur kode.*
