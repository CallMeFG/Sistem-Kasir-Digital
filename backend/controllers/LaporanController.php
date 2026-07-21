<?php
require_once 'views/JsonView.php';

class LaporanController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            JsonView::render(false, null, "Method not allowed. Only GET is allowed.", 405);
        }

        try {
            $bulan = $_GET['bulan'] ?? date('m');
            $tahun = $_GET['tahun'] ?? date('Y');

            // Handle if bulan passed in YYYY-MM format
            if (strpos($bulan, '-') !== false) {
                $parts = explode('-', $bulan);
                $tahun = $parts[0];
                $bulan = $parts[1];
            }

            $targetMonth = sprintf('%04d-%02d', (int)$tahun, (int)$bulan);

            // Fetch all transactions and details for this month
            $query = "SELECT t.id_transaksi, t.tanggal, t.total_bayar,
                             dt.jumlah_beli, dt.subtotal_harga,
                             p.nama_produk, p.kategori, p.harga_modal,
                             (dt.subtotal_harga / dt.jumlah_beli) as harga_satuan
                      FROM transaksi t
                      JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
                      JOIN produk p ON dt.id_produk = p.id_produk
                      WHERE DATE_FORMAT(t.tanggal, '%Y-%m') = :targetMonth";

            $stmt = $this->db->prepare($query);
            $stmt->execute([':targetMonth' => $targetMonth]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $total_pendapatan = 0;
            $total_modal = 0;
            $laba_kotor = 0;
            $harian = [];
            $kategoriMap = [];
            $produkMap = [];

            // Process rows
            foreach ($rows as $row) {
                $subtotal = (float)$row['subtotal_harga'];
                $jumlah = (int)$row['jumlah_beli'];
                $hModal = (float)$row['harga_modal'];
                $modalItem = $hModal * $jumlah;
                $labaItem = $subtotal - $modalItem;

                $total_pendapatan += $subtotal;
                $total_modal += $modalItem;
                $laba_kotor += $labaItem;

                // Per hari
                $hari = (string)(int)date('d', strtotime($row['tanggal']));
                if (!isset($harian[$hari])) $harian[$hari] = 0;
                $harian[$hari] += $subtotal;

                // Per kategori
                $kat = $row['kategori'] ?? 'Lainnya';
                if (!isset($kategoriMap[$kat])) $kategoriMap[$kat] = ['pendapatan' => 0, 'laba' => 0];
                $kategoriMap[$kat]['pendapatan'] += $subtotal;
                $kategoriMap[$kat]['laba'] += $labaItem;

                // Top produk
                $nama = $row['nama_produk'];
                if (!isset($produkMap[$nama])) $produkMap[$nama] = ['jumlah' => 0, 'pendapatan' => 0];
                $produkMap[$nama]['jumlah'] += $jumlah;
                $produkMap[$nama]['pendapatan'] += $subtotal;
            }

            // Format per_hari
            ksort($harian, SORT_NUMERIC);
            $per_hari = [];
            foreach ($harian as $hari => $pendapatan) {
                $per_hari[] = ['hari' => (string)$hari, 'pendapatan' => $pendapatan];
            }

            // Format per_kategori
            $per_kategori = [];
            foreach ($kategoriMap as $kat => $vals) {
                $per_kategori[] = [
                    'kategori' => $kat,
                    'pendapatan' => $vals['pendapatan'],
                    'laba' => $vals['laba']
                ];
            }

            // Format top_produk
            $top_produk = [];
            foreach ($produkMap as $nama => $vals) {
                $top_produk[] = [
                    'nama' => $nama,
                    'total_terjual' => $vals['jumlah'],
                    'total_pendapatan' => $vals['pendapatan']
                ];
            }
            usort($top_produk, function($a, $b) {
                return $b['total_terjual'] <=> $a['total_terjual'];
            });
            $top_produk = array_slice($top_produk, 0, 5);

            $data = [
                'total_pendapatan' => $total_pendapatan,
                'total_modal' => $total_modal,
                'laba_kotor' => $laba_kotor,
                'per_hari' => $per_hari,
                'per_kategori' => $per_kategori,
                'top_produk' => $top_produk
            ];

            JsonView::render(true, $data, "Data laporan berhasil diambil.");
        } catch (Exception $e) {
            JsonView::render(false, null, "Gagal mengambil data laporan: " . $e->getMessage(), 500);
        }
    }
}
