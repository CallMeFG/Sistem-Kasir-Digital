# PRD: Sistem Manajemen Warung Adjie

## 1. Overview
Sistem kasir dan manajemen inventaris berbasis web (mobile-first) untuk pencatatan stok dan keuangan. Menggantikan sistem manual (buku) agar pemilik dapat memantau stok kritis dan menghitung laba bersih bulanan secara otomatis.
**User Personas:** Pemilik (mengelola produk, transaksi, laporan) dan Pelanggan (melihat katalog produk).

## 2. Tech Stack
* **Frontend:** React (Vite) - SPA (Single Page Application).
* **Backend:** PHP Native dengan arsitektur ketat **MVC (Model-View-Controller)**.
* **Database:** PostgreSQL (via Supabase online).
* **Environment:** Laragon (Local server).

## 3. Features
**MVP (Wajib Ada):**
* [MVP] Manajemen Produk (CRUD produk: nama, kategori, harga_modal, harga_jual, stok).
* [MVP] Transaksi Penjualan (Memotong stok otomatis saat transaksi berhasil).
* [MVP] Dashboard & Laporan (Agregasi total penjualan harian, stok kritis, laba-rugi bulanan).
* [MVP] Katalog Produk (Untuk pelanggan).

**Nice-to-have (Fase Selanjutnya):**
* Export laporan (PDF/Excel).
* Autentikasi/Login sederhana untuk Pemilik.

## 4. Data Model
* **produk:** id_produk (UUID, PK), nama_produk, kategori, harga_modal, harga_jual, stok.
* **transaksi:** id_transaksi (UUID, PK), tanggal, total_bayar.
* **detail_transaksi:** id_detail (UUID, PK), id_transaksi (FK), id_produk (FK), jumlah_beli, subtotal_harga.

## 5. Phases
* **Phase 1:** Refactor backend ke struktur MVC murni & koneksi PDO Supabase.
* **Phase 2:** Pembuatan endpoint API (Controllers & Models) untuk Produk dan Transaksi.
* **Phase 3:** Integrasi Frontend React dengan endpoint API.
* **Phase 4:** Debug, testing, tambahan fitur, dan lain lain.