<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$produk = [
    // 
];

foreach($produk as $p) {
    $stmt = $db->prepare("INSERT INTO produk (nama_produk, kategori, harga_modal, harga_jual, stok) VALUES (:nama_produk, :kategori, :harga_modal, :harga_jual, :stok)");
    $stmt->execute($p);
}
echo "Dummy data berhasil dimasukkan ke MySQL.\n";
?>
