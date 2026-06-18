arsitektur database: produk: id_produk (PK), nama_produk, kategori, harga_modal, harga_jual, stok
transaksi: id_transaksi (PK), tanggal, total_bayar
detail_transaksi (tabel penghubung Many-to-Many): id_transaksi (FK), id_produk (FK), jumlah_beli, subtotal_harga.
Relasi: satu transaksi bisa memiliki banyak baris di detail_transaksi, dan satu produk bisa muncul di banyak detail_transaksi → ini relasi many-to-many antara produk dan transaksi, dijembatani oleh detail_transaksi. Sebelumnya saya hanya menyebut ini "many-to-many" secara umum tanpa nama tabel penghubung — sekarang sudah eksplisit sesuai ERD.
Tech Stack :Laragon (server lokal) + PHP native (backend/API) + Supabase Online (database) + React (frontend).
DATABASE_URL=postgresql://postgres.mtzmvoeuotkuygsvjhvf:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
host:
aws-1-ap-northeast-2.pooler.supabase.com

port:
6543

database:
postgres

user:
postgres.mtzmvoeuotkuygsvjhvf

password:
998776554Fathur_
