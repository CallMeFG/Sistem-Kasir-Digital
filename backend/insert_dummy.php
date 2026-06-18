<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$produk = [
    ['nama_produk' => 'Kopi Kapal Api', 'kategori' => 'Minuman', 'harga_modal' => 3000, 'harga_jual' => 4000, 'stok' => 50],
    ['nama_produk' => 'Indomie Goreng', 'kategori' => 'Makanan', 'harga_modal' => 2500, 'harga_jual' => 3500, 'stok' => 100],
    ['nama_produk' => 'Beras Pandan Wangi 5kg', 'kategori' => 'Sembako', 'harga_modal' => 60000, 'harga_jual' => 65000, 'stok' => 20]
];

foreach($produk as $p) {
    $stmt = $db->prepare("INSERT INTO produk (nama_produk, kategori, harga_modal, harga_jual, stok) VALUES (:nama_produk, :kategori, :harga_modal, :harga_jual, :stok)");
    $stmt->execute($p);
}
echo "Dummy data berhasil dimasukkan ke Supabase.\n";
?>
