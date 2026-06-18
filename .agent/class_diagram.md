# Class Diagram Lengkap "Warung Adjie"

Dokumen ini memetakan arsitektur lengkap aplikasi "Warung Adjie" mulai dari entitas Database (PostgreSQL), arsitektur layanan Backend (PHP Native), struktur Servis Frontend, hingga kaitan antar halaman (React Pages).

## 1. Entity Relationship & Database Diagram

Struktur inti database PostgreSQL beserta relasinya yang menghubungkan produk, transaksi, dan detail riwayat pembelian.

```mermaid
classDiagram
    class Produk {
        +UUID id_produk
        +String nama_produk
        +String kategori
        +Numeric harga_modal
        +Numeric harga_jual
        +Integer stok
    }

    class Transaksi {
        +UUID id_transaksi
        +DateTime tanggal
        +Numeric total_bayar
    }

    class DetailTransaksi {
        +UUID id_detail
        +UUID id_transaksi
        +UUID id_produk
        +Integer jumlah_beli
        +Numeric subtotal_harga
    }

    Transaksi "1" *-- "many" DetailTransaksi : Terdiri dari
    DetailTransaksi "many" --> "1" Produk : Merujuk pada
```

## 2. Backend Architecture (PHP Native)

Menggambarkan abstraksi _procedural_ PHP kita seolah-olah berinteraksi sebagai Class/Module, dengan konektor PDO sebagai jembatannya.

```mermaid
classDiagram
    class DatabaseConfig {
        -String host
        -String port
        -String db_name
        -String username
        -String password
        +PDO conn
        +getConnection() PDO
    }
    
    class ResponseHelper {
        <<Helper>>
        +sendResponse(success: Boolean, data: Array, message: String, statusCode: Int)
    }

    class ProdukAPI {
        <<Endpoint /api/produk.php>>
        +GET() JSON
    }
    
    class TransaksiAPI {
        <<Endpoint /api/transaksi.php>>
        +POST(data) JSON
    }

    ProdukAPI --> DatabaseConfig : Mengambil Koneksi
    TransaksiAPI --> DatabaseConfig : Mengambil Koneksi (Transaction)
    ProdukAPI --> ResponseHelper : Format JSON
    TransaksiAPI --> ResponseHelper : Format JSON
```

## 3. Frontend Architecture (React SPA)

### A. Services / Axios Integration
Struktur ini menjembatani komunikasi Frontend dengan Backend API.

```mermaid
classDiagram
    class Axios_Instance {
        <<src/services/api.js>>
        +String BASE_URL
        +Object interceptors
    }
    class BarangService {
        +getBarang() Promise
        +createBarang(data) Promise
        +updateBarang(data) Promise
        +deleteBarang(id) Promise
        +restockBarang(id, tambahan) Promise
    }
    class TransaksiService {
        +createTransaksi(data) Promise
        +getRiwayatTransaksi() Promise
    }
    class LaporanService {
        +getLaporan() Promise
    }

    BarangService --> Axios_Instance : Menggunakan
    TransaksiService --> Axios_Instance : Menggunakan
    LaporanService --> Axios_Instance : Menggunakan
```

### B. React Components & Pages
Hierarki UI React, pengelolaan _state_, serta servis yang dikonsumsi oleh setiap halamannya.

```mermaid
classDiagram
    class App {
        <<Router Utama>>
        +RenderRoutes()
    }
    
    class Dashboard {
        <<Page>>
        -fetchStatistik()
    }
    
    class DaftarBarang {
        <<Page>>
        -List~Barang~ state
        -handleTambah()
        -handleHapus()
    }
    
    class TransaksiKasir {
        <<Page: Transaksi.jsx>>
        -List~Barang~ barangList
        -List~CartItem~ keranjang
        +tambahKeKeranjang(item)
        +ubahJumlah(id, delta)
        +hapus(id)
        +handleBayar(kembalian)
    }
    
    class RiwayatTransaksi {
        <<Page>>
        -List~Transaksi~ riwayat
    }
    
    class LaporanKeuangan {
        <<Page>>
        -RenderChart()
    }
    
    class KatalogPelanggan {
        <<Page>>
        -List~Barang~ katalog
    }

    App --> Dashboard : Route /dashboard
    App --> DaftarBarang : Route /barang
    App --> TransaksiKasir : Route /transaksi
    App --> RiwayatTransaksi : Route /riwayat-transaksi
    App --> LaporanKeuangan : Route /laporan
    App --> KatalogPelanggan : Route /katalog

    DaftarBarang --> BarangService : Memanggil API
    TransaksiKasir --> BarangService : Load Produk
    TransaksiKasir --> TransaksiService : Post Transaksi
    RiwayatTransaksi --> TransaksiService : Load Riwayat
    LaporanKeuangan --> LaporanService : Load Statistik
    KatalogPelanggan --> BarangService : Load Produk
```
