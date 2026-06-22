# 🛒 Warung Adjie - Sistem Kasir Digital

Selamat datang di repositori **Warung Adjie**! Ini adalah aplikasi Point of Sales (POS) atau Sistem Kasir Digital sederhana namun *powerful* yang dirancang khusus untuk mempermudah operasional warung kecil hingga menengah.

Aplikasi ini dibangun menggunakan kombinasi **React (Vite)** di sisi frontend untuk memastikan antarmuka yang cepat dan modern, serta **PHP Native (PDO)** di sisi backend untuk pengolahan API yang ringan, ditenagai oleh database **PostgreSQL (Supabase)**.

---

## 🚀 Fitur Unggulan

- **💻 Dashboard Informatif**  
  Pantau performa warungmu dalam satu pandangan. Tersedia ringkasan pendapatan, grafik harian, hingga peringatan otomatis untuk produk yang stoknya hampir habis.
- **📦 Manajemen Inventaris & Restock Cepat**  
  Kelola data barang dengan mudah (tambah, edit, hapus, upload foto). Tersedia fitur *Restock Cepat* langsung dari form edit untuk menghemat waktu.
- **💵 Transaksi Kasir (Point of Sales)**  
  Sistem kasir cerdas dengan kalkulasi kembalian otomatis dan kemampuan mencetak struk untuk pelanggan (mendukung thermal printer).
- **📝 Laporan Keuangan & Export PDF**  
  Lacak pergerakan uangmu! Fitur laporan menyajikan laba bersih, pendapatan harian, analisis performa per kategori, hingga *Top 5 Produk Terlaris*. Bisa dicetak langsung ke PDF untuk arsip laporan bulanan.
- **🛍️ Katalog Publik Responsif**  
  Pelanggan bisa melihat daftar produk beserta foto, harga, dan ketersediaan stok *(real-time)* langsung dari layar HP mereka dengan desain antarmuka yang mulus. Otomatis menampilkan gaya *grayscale* jika produk kehabisan stok.
- **🌙 Dark Mode Support**  
  Nyaman digunakan seharian penuh siang maupun malam dengan fitur *toggle* dark mode di header aplikasi admin.

---

## 🛠️ Teknologi yang Digunakan

**Frontend:**
- [React.js](https://reactjs.org/) (dengan Vite build tool)
- [Tailwind CSS](https://tailwindcss.com/) (untuk styling yang super cepat, konsisten, dan responsif)
- React Router DOM (Routing navigasi halaman Single Page Application)

**Backend:**
- PHP 8+ (Native, OOP, PDO Database Abstraction)
- Custom Routing & CORS Handling System

**Database:**
- [PostgreSQL](https://www.postgresql.org/) (Di-host secara online via Supabase)

---

## ⚙️ Cara Menjalankan Project (Local Development)

Ingin mencoba menjalankan dan mengembangkan kode ini di komputermu sendiri? Ikuti langkah-langkah berikut:

### Persiapan
Pastikan kamu sudah menginstal **Node.js**, **PHP** (via XAMPP/Laragon), dan **Git**.

### 1. Kloning Repositori
```bash
git clone https://github.com/username-kamu/warung-adjie.git
cd warung-adjie
```

### 2. Setup Backend (PHP)
Karena database langsung terhubung ke cloud Supabase, kamu tidak perlu repot melakukan import file `.sql`. Cukup jalankan PHP server-nya:
- Jika menggunakan Laragon/XAMPP, pindahkan folder project ini ke dalam folder `www` atau `htdocs`.
- Pastikan folder backend bisa diakses via browser, contoh: `http://localhost/project/warung-adjie/backend/index.php`.

### 3. Setup Frontend (React)
Buka terminal baru dan masuk ke folder frontend:
```bash
cd frontend
```

Install semua dependensi Javascript yang dibutuhkan:
```bash
npm install
```

Sesuaikan URL backend jika diperlukan. Buat file `.env` di dalam folder `frontend`:
```env
VITE_API_URL=http://localhost/project/warung-adjie/backend/index.php?route=
```
*(Ingat: Sesuaikan path URL dengan letak struktur foldermu di htdocs/www).*

Jalankan server *development* Vite:
```bash
npm run dev
```

Buka `http://localhost:5173` di browser-mu dan selamat mengelola Warung Adjie! 🎉

---

## 📸 Tampilan Layar (Screenshots)

*(Tambahkan beberapa screenshot dashboard, kasir, dan katalog versi mobile di sini untuk membuat profil repositorimu semakin profesional!)*

---

## 🤝 Kontribusi

Aplikasi ini terus dikembangkan agar lebih sempurna. Jika ada masukan, penemuan *bug*, atau ide fitur baru yang keren, silakan buka *Issue* atau buat *Pull Request*. Segala bentuk kontribusi sangat dihargai!

> Dibuat dengan sakit kepala dan pusing melintir ☕.
