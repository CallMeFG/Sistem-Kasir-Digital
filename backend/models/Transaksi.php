<?php
class Transaksi {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createTransaksi($total_bayar, $details) {
        try {
            $this->db->beginTransaction();

            $queryTransaksi = "INSERT INTO transaksi (total_bayar) VALUES (:total_bayar) RETURNING id_transaksi, tanggal";
            $stmtTransaksi = $this->db->prepare($queryTransaksi);
            $stmtTransaksi->bindParam(':total_bayar', $total_bayar);
            $stmtTransaksi->execute();
            
            $transaksiRow = $stmtTransaksi->fetch();
            $id_transaksi = $transaksiRow['id_transaksi'];
            $tanggal = $transaksiRow['tanggal'];

            $queryDetail = "INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah_beli, subtotal_harga) 
                            VALUES (:id_transaksi, :id_produk, :jumlah_beli, :subtotal_harga)";
            $stmtDetail = $this->db->prepare($queryDetail);

            $queryUpdateStok = "UPDATE produk SET stok = stok - :jumlah_beli 
                                WHERE id_produk = :id_produk AND stok >= :jumlah_beli";
            $stmtUpdateStok = $this->db->prepare($queryUpdateStok);

            foreach ($details as $item) {
                if (!isset($item->id_produk) || !isset($item->jumlah_beli) || !isset($item->subtotal_harga)) {
                    throw new Exception("Incomplete detail data.");
                }

                $stmtUpdateStok->bindParam(':jumlah_beli', $item->jumlah_beli);
                $stmtUpdateStok->bindParam(':id_produk', $item->id_produk);
                $stmtUpdateStok->execute();

                if ($stmtUpdateStok->rowCount() == 0) {
                    throw new Exception("Stok tidak mencukupi atau produk tidak ditemukan untuk ID: " . $item->id_produk);
                }

                $stmtDetail->bindParam(':id_transaksi', $id_transaksi);
                $stmtDetail->bindParam(':id_produk', $item->id_produk);
                $stmtDetail->bindParam(':jumlah_beli', $item->jumlah_beli);
                $stmtDetail->bindParam(':subtotal_harga', $item->subtotal_harga);
                $stmtDetail->execute();
            }

            $this->db->commit();
            return [
                "id_transaksi" => $id_transaksi,
                "tanggal" => $tanggal,
                "total_bayar" => $total_bayar,
                "details" => $details
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getAll() {
        $query = "SELECT t.id_transaksi as id, t.tanggal, t.total_bayar as total_harga, 
                         json_agg(json_build_object('nama_barang', p.nama_produk, 'jumlah', dt.jumlah_beli, 'harga_satuan', dt.subtotal_harga / dt.jumlah_beli)) as detail
                  FROM transaksi t
                  JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
                  JOIN produk p ON dt.id_produk = p.id_produk
                  GROUP BY t.id_transaksi
                  ORDER BY t.tanggal DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        $arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['detail'] = json_decode($row['detail']);
            array_push($arr, $row);
        }
        return $arr;
    }
}
