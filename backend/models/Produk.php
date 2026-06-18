<?php
class Produk {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM produk ORDER BY nama_produk ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        $produkArr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $produk_item = array(
                "id" => $row['id_produk'],
                "nama" => $row['nama_produk'],
                "kategori" => $row['kategori'],
                "harga_modal" => $row['harga_modal'],
                "harga_jual" => $row['harga_jual'],
                "stok" => $row['stok'],
                "gambar" => $row['gambar']
            );
            array_push($produkArr, $produk_item);
        }
        return $produkArr;
    }

    public function create($nama, $kategori, $harga_modal, $harga_jual, $stok, $gambar = null) {
        $query = "INSERT INTO produk (nama_produk, kategori, harga_modal, harga_jual, stok, gambar) VALUES (:nama, :kategori, :modal, :jual, :stok, :gambar)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':nama', $nama);
        $stmt->bindParam(':kategori', $kategori);
        $stmt->bindParam(':modal', $harga_modal);
        $stmt->bindParam(':jual', $harga_jual);
        $stmt->bindParam(':stok', $stok);
        $stmt->bindParam(':gambar', $gambar);
        return $stmt->execute();
    }

    public function update($id, $nama, $kategori, $harga_modal, $harga_jual, $stok, $gambar = null) {
        if ($gambar !== null) {
            $query = "UPDATE produk SET nama_produk=:nama, kategori=:kategori, harga_modal=:modal, harga_jual=:jual, stok=:stok, gambar=:gambar WHERE id_produk=:id";
        } else {
            $query = "UPDATE produk SET nama_produk=:nama, kategori=:kategori, harga_modal=:modal, harga_jual=:jual, stok=:stok WHERE id_produk=:id";
        }
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':nama', $nama);
        $stmt->bindParam(':kategori', $kategori);
        $stmt->bindParam(':modal', $harga_modal);
        $stmt->bindParam(':jual', $harga_jual);
        $stmt->bindParam(':stok', $stok);
        if ($gambar !== null) {
            $stmt->bindParam(':gambar', $gambar);
        }
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM produk WHERE id_produk=:id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function restock($id, $tambahan) {
        $query = "UPDATE produk SET stok = stok + :tambahan WHERE id_produk = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':tambahan', $tambahan);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
