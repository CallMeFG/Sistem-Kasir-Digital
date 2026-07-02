CREATE DATABASE IF NOT EXISTS `warung_adjie` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `warung_adjie`;

CREATE TABLE IF NOT EXISTS `produk` (
  `id_produk` int(11) NOT NULL AUTO_INCREMENT,
  `nama_produk` varchar(255) NOT NULL,
  `kategori` varchar(100) NOT NULL,
  `harga_modal` int(11) NOT NULL DEFAULT 0,
  `harga_jual` int(11) NOT NULL DEFAULT 0,
  `stok` int(11) NOT NULL DEFAULT 0,
  `gambar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `transaksi` (
  `id_transaksi` int(11) NOT NULL AUTO_INCREMENT,
  `tanggal` datetime NOT NULL DEFAULT current_timestamp(),
  `total_bayar` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_transaksi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `detail_transaksi` (
  `id_detail` int(11) NOT NULL AUTO_INCREMENT,
  `id_transaksi` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `jumlah_beli` int(11) NOT NULL DEFAULT 1,
  `subtotal_harga` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_detail`),
  KEY `fk_transaksi` (`id_transaksi`),
  KEY `fk_produk` (`id_produk`),
  CONSTRAINT `fk_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE,
  CONSTRAINT `fk_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `produk` (`nama_produk`, `kategori`, `harga_modal`, `harga_jual`, `stok`) VALUES
('Kopi Kapal Api', 'Minuman', 3000, 4000, 50),
('Indomie Goreng', 'Makanan', 2500, 3500, 100),
('Beras Pandan Wangi 5kg', 'Sembako', 60000, 65000, 20),
('Minyak Goreng Bimoli 1L', 'Sembako', 15000, 18000, 35),
('Gula Pasir 1kg', 'Sembako', 13000, 15000, 40),
('Teh Botol Sosro', 'Minuman', 3500, 5000, 60),
('Roti Tawar Kupas', 'Makanan', 12000, 15000, 15);
