<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "=======================================================\n";
    echo "       WARUNG ADJIE - DATABASE SEEDER (RESTORE)        \n";
    echo "=======================================================\n\n";

    // 1. Kosongkan tabel (TRUNCATE) dengan menonaktifkan sementara foreign key check
    echo "[1/4] Menghapus data lama (Produk, Transaksi, Detail Transaksi)...\n";
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $db->exec("TRUNCATE TABLE detail_transaksi;");
    $db->exec("TRUNCATE TABLE transaksi;");
    $db->exec("TRUNCATE TABLE produk;");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "      ✔ Tabel berhasil dikosongkan dan ID direset ke 1.\n\n";

    // 2. Seeder 9 Produk Baru yang sesuai dengan file gambar di frontend/public/image/ & backend/uploads/
    echo "[2/4] Memasukkan 9 data produk baru beserta gambar...\n";
    $produkData = [
        [
            'nama_produk' => 'Es Kosong / Es Batu',
            'kategori' => 'Minuman',
            'harga_modal' => 1000,
            'harga_jual' => 2000,
            'stok' => 85,
            'gambar' => 'esKosong-image.jpg'
        ],
        [
            'nama_produk' => 'Es Teh Manis Segar',
            'kategori' => 'Minuman',
            'harga_modal' => 2000,
            'harga_jual' => 5000,
            'stok' => 120,
            'gambar' => 'esTeh-image.jpg'
        ],
        [
            'nama_produk' => 'Kopi Hitam / Kopi Susu Panas',
            'kategori' => 'Minuman',
            'harga_modal' => 2500,
            'harga_jual' => 6000,
            'stok' => 95,
            'gambar' => 'kopi-image.jpg'
        ],
        [
            'nama_produk' => 'Indomie Goreng Telur Sayur',
            'kategori' => 'Makanan',
            'harga_modal' => 6000,
            'harga_jual' => 12000,
            'stok' => 60,
            'gambar' => 'indomieGoreng-image.jpg'
        ],
        [
            'nama_produk' => 'Indomie Rebus Kuah Kari + Telur',
            'kategori' => 'Makanan',
            'harga_modal' => 6000,
            'harga_jual' => 12000,
            'stok' => 55,
            'gambar' => 'indomieRebus-image.jpg'
        ],
        [
            'nama_produk' => 'Minas (Mie Nasi Goreng Spesial)',
            'kategori' => 'Makanan',
            'harga_modal' => 9000,
            'harga_jual' => 17000,
            'stok' => 45,
            'gambar' => 'minas-image.webp'
        ],
        [
            'nama_produk' => 'Nasi Ayam Cabe Ijo Komplit',
            'kategori' => 'Makanan',
            'harga_modal' => 12000,
            'harga_jual' => 22000,
            'stok' => 40,
            'gambar' => 'nasiAyamCabeIjo-image.webp'
        ],
        [
            'nama_produk' => 'Nasi Ayam Kremes Renyah',
            'kategori' => 'Makanan',
            'harga_modal' => 11000,
            'harga_jual' => 20000,
            'stok' => 50,
            'gambar' => 'nasiAyamKremes-image.jpg'
        ],
        [
            'nama_produk' => 'Nasi Goreng Spesial Warung Adjie',
            'kategori' => 'Makanan',
            'harga_modal' => 9000,
            'harga_jual' => 18000,
            'stok' => 70,
            'gambar' => 'nasiGoreng-image.jpg'
        ]
    ];

    $stmtProduk = $db->prepare("INSERT INTO produk (nama_produk, kategori, harga_modal, harga_jual, stok, gambar) VALUES (:nama_produk, :kategori, :harga_modal, :harga_jual, :stok, :gambar)");
    
    $insertedProdukIds = [];
    foreach ($produkData as $idx => $p) {
        $stmtProduk->execute($p);
        $id = $db->lastInsertId();
        $insertedProdukIds[] = [
            'id' => $id,
            'nama' => $p['nama_produk'],
            'harga_jual' => $p['harga_jual']
        ];
        echo "      ✔ Produk #$id: {$p['nama_produk']} [Rp " . number_format($p['harga_jual'], 0, ',', '.') . "] ({$p['gambar']})\n";
    }
    echo "\n";

    // 3. Seeder Transaksi 14 Hari Terakhir (naik turun / berfluktuasi secara realistis)
    echo "[3/4] Memasukkan riwayat transaksi 14 hari terakhir (fluktuasi realistis untuk grafik)...\n";

    // Jadwal dan rencana transaksi harian: [Tanggal, Jam, Array of [index_produk, jumlah]]
    $dailyPlan = [
        // Hari 1: Rabu 8 Juli 2026 (Rendah - 3 transaksi)
        ['2026-07-08 10:15:00', [[0, 2], [3, 1]]], // Es Kosong x2, Indomie Goreng x1
        ['2026-07-08 13:30:00', [[1, 2], [8, 1]]], // Es Teh x2, Nasi Goreng x1
        ['2026-07-08 19:10:00', [[2, 2], [4, 1]]], // Kopi x2, Indomie Rebus x1

        // Hari 2: Kamis 9 Juli 2026 (Naik sedikit - 4 transaksi)
        ['2026-07-09 09:20:00', [[2, 3], [5, 1]]], // Kopi x3, Minas x1
        ['2026-07-09 12:15:00', [[1, 3], [6, 2]]], // Es Teh x3, Nasi Ayam Cabe Ijo x2
        ['2026-07-09 16:45:00', [[0, 4], [7, 1]]], // Es Kosong x4, Nasi Ayam Kremes x1
        ['2026-07-09 20:30:00', [[1, 2], [8, 2]]], // Es Teh x2, Nasi Goreng x2

        // Hari 3: Jumat 10 Juli 2026 (Lonjakan Jumat - 6 transaksi)
        ['2026-07-10 11:00:00', [[1, 4], [6, 2]]], // Es Teh x4, Nasi Ayam Cabe Ijo x2
        ['2026-07-10 12:30:00', [[1, 5], [7, 3]]], // Es Teh x5, Nasi Ayam Kremes x3
        ['2026-07-10 14:15:00', [[2, 2], [5, 2]]], // Kopi x2, Minas x2
        ['2026-07-10 17:00:00', [[0, 3], [3, 3]]], // Es Kosong x3, Indomie Goreng x3
        ['2026-07-10 19:40:00', [[1, 4], [8, 3]]], // Es Teh x4, Nasi Goreng x3
        ['2026-07-10 21:15:00', [[2, 3], [4, 2]]], // Kopi x3, Indomie Rebus x2

        // Hari 4: Sabtu 11 Juli 2026 (Puncak Akhir Pekan 1 - 7 transaksi besar)
        ['2026-07-11 10:30:00', [[1, 4], [6, 3], [7, 2]]],
        ['2026-07-11 12:00:00', [[1, 6], [8, 4], [5, 2]]],
        ['2026-07-11 14:20:00', [[2, 4], [3, 4]]],
        ['2026-07-11 16:10:00', [[0, 5], [7, 3]]],
        ['2026-07-11 18:30:00', [[1, 5], [6, 4]]],
        ['2026-07-11 20:00:00', [[2, 5], [8, 4]]],
        ['2026-07-11 21:30:00', [[1, 3], [4, 3], [5, 2]]],

        // Hari 5: Minggu 12 Juli 2026 (Puncak Akhir Pekan 2 - 6 transaksi besar)
        ['2026-07-12 11:15:00', [[1, 5], [6, 3]]],
        ['2026-07-12 13:00:00', [[1, 6], [7, 4], [8, 3]]],
        ['2026-07-12 15:45:00', [[2, 4], [5, 3]]],
        ['2026-07-12 17:30:00', [[0, 4], [3, 4], [4, 2]]],
        ['2026-07-12 19:20:00', [[1, 5], [8, 4]]],
        ['2026-07-12 21:00:00', [[2, 3], [6, 2]]],

        // Hari 6: Senin 13 Juli 2026 (Turun drastis di awal minggu - 3 transaksi)
        ['2026-07-13 10:45:00', [[2, 2], [3, 1]]],
        ['2026-07-13 13:15:00', [[1, 2], [8, 2]]],
        ['2026-07-13 18:50:00', [[0, 2], [4, 2]]],

        // Hari 7: Selasa 14 Juli 2026 (Naik moderat - 4 transaksi)
        ['2026-07-14 11:30:00', [[1, 3], [7, 2]]],
        ['2026-07-14 14:00:00', [[2, 3], [5, 2]]],
        ['2026-07-14 17:20:00', [[1, 4], [6, 2]]],
        ['2026-07-14 20:10:00', [[0, 3], [8, 3]]],

        // Hari 8: Rabu 15 Juli 2026 (Stabil - 4 transaksi)
        ['2026-07-15 09:40:00', [[2, 2], [3, 2]]],
        ['2026-07-15 12:50:00', [[1, 4], [8, 3]]],
        ['2026-07-15 16:30:00', [[1, 3], [7, 2]]],
        ['2026-07-15 19:15:00', [[2, 3], [4, 3]]],

        // Hari 9: Kamis 16 Juli 2026 (Mulai naik - 5 transaksi)
        ['2026-07-16 10:20:00', [[1, 3], [6, 2]]],
        ['2026-07-16 12:40:00', [[1, 5], [7, 3]]],
        ['2026-07-16 15:10:00', [[2, 4], [5, 2]]],
        ['2026-07-16 18:00:00', [[0, 4], [3, 3], [4, 2]]],
        ['2026-07-16 20:45:00', [[1, 4], [8, 3]]],

        // Hari 10: Jumat 17 Juli 2026 (Lonjakan Jumat malam - 6 transaksi)
        ['2026-07-17 11:10:00', [[1, 4], [6, 3]]],
        ['2026-07-17 13:20:00', [[1, 6], [7, 4], [8, 2]]],
        ['2026-07-17 16:00:00', [[2, 3], [5, 3]]],
        ['2026-07-17 18:30:00', [[1, 5], [8, 4]]],
        ['2026-07-17 20:15:00', [[2, 4], [4, 3]]],
        ['2026-07-17 21:50:00', [[0, 5], [3, 4]]],

        // Hari 11: Sabtu 18 Juli 2026 (Puncak Akhir Pekan Terbesar - 8 transaksi)
        ['2026-07-18 10:00:00', [[1, 5], [6, 4]]],
        ['2026-07-18 11:45:00', [[1, 6], [7, 4], [8, 3]]],
        ['2026-07-18 13:30:00', [[2, 5], [5, 4]]],
        ['2026-07-18 15:15:00', [[1, 4], [3, 4], [4, 3]]],
        ['2026-07-18 17:00:00', [[0, 6], [8, 5]]],
        ['2026-07-18 18:45:00', [[1, 6], [6, 4], [7, 3]]],
        ['2026-07-18 20:30:00', [[2, 5], [8, 4]]],
        ['2026-07-18 22:00:00', [[1, 4], [4, 3], [5, 2]]],

        // Hari 12: Minggu 19 Juli 2026 (Puncak Minggu - 7 transaksi)
        ['2026-07-19 11:00:00', [[1, 5], [6, 3], [7, 3]]],
        ['2026-07-19 12:45:00', [[1, 7], [8, 5]]],
        ['2026-07-19 14:30:00', [[2, 4], [5, 3]]],
        ['2026-07-19 16:45:00', [[0, 5], [3, 4]]],
        ['2026-07-19 18:30:00', [[1, 5], [7, 4]]],
        ['2026-07-19 20:15:00', [[2, 4], [8, 4]]],
        ['2026-07-19 21:40:00', [[1, 4], [6, 3]]],

        // Hari 13: Senin 20 Juli 2026 (Turun kembali - 4 transaksi)
        ['2026-07-20 09:30:00', [[2, 2], [3, 2]]],
        ['2026-07-20 12:15:00', [[1, 3], [8, 2]]],
        ['2026-07-20 16:00:00', [[1, 3], [7, 2]]],
        ['2026-07-20 19:20:00', [[0, 3], [4, 2], [5, 1]]],

        // Hari 14: Selasa 21 Juli 2026 (Hari ini sampai jam 11 pagi - 5 transaksi pagi yang meriah)
        ['2026-07-21 08:15:00', [[2, 4], [0, 2]]], // Kopi pagi x4, Es Kosong x2
        ['2026-07-21 09:00:00', [[2, 3], [3, 2]]], // Kopi x3, Indomie Goreng x2
        ['2026-07-21 09:45:00', [[1, 3], [8, 2]]], // Es Teh x3, Nasi Goreng x2
        ['2026-07-21 10:20:00', [[1, 4], [7, 2], [6, 1]]], // Es Teh x4, Nasi Ayam Cabe Ijo x2, Minas x1
        ['2026-07-21 10:50:00', [[2, 3], [8, 3], [5, 2]]]  // Kopi x3, Nasi Goreng x3, Indomie Rebus x2
    ];

    $stmtTrx = $db->prepare("INSERT INTO transaksi (tanggal, total_bayar) VALUES (:tanggal, :total_bayar)");
    $stmtDetail = $db->prepare("INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah_beli, subtotal_harga) VALUES (:id_transaksi, :id_produk, :jumlah_beli, :subtotal_harga)");

    $txCount = 0;
    foreach ($dailyPlan as $plan) {
        $tanggal = $plan[0];
        $items = $plan[1];

        $totalBayar = 0;
        $detailRows = [];

        foreach ($items as $itemPair) {
            $prodIdx = $itemPair[0];
            $qty = $itemPair[1];

            $prodObj = $insertedProdukIds[$prodIdx];
            $subtotal = $prodObj['harga_jual'] * $qty;
            $totalBayar += $subtotal;

            $detailRows[] = [
                'id_produk' => $prodObj['id'],
                'jumlah_beli' => $qty,
                'subtotal_harga' => $subtotal
            ];
        }

        // Insert transaksi
        $stmtTrx->execute([
            ':tanggal' => $tanggal,
            ':total_bayar' => $totalBayar
        ]);
        $idTrx = $db->lastInsertId();

        // Insert detail_transaksi
        foreach ($detailRows as $d) {
            $stmtDetail->execute([
                ':id_transaksi' => $idTrx,
                ':id_produk' => $d['id_produk'],
                ':jumlah_beli' => $d['jumlah_beli'],
                ':subtotal_harga' => $d['subtotal_harga']
            ]);
        }
        $txCount++;
    }

    echo "      ✔ $txCount transaksi berhasil dimasukkan untuk 14 hari terakhir (8 Juli - 21 Juli 2026 jam 11:00)!\n\n";

    // 4. Verifikasi Agregasi Harian (untuk memastikan fluktuasi grafik)
    echo "[4/4] Verifikasi fluktuasi harian (sampel ringkasan pendapatan per hari):\n";
    $stmtDaily = $db->query("SELECT DATE(tanggal) as tgl, COUNT(*) as jml_trx, SUM(total_bayar) as total FROM transaksi GROUP BY DATE(tanggal) ORDER BY tgl ASC");
    while ($r = $stmtDaily->fetch(PDO::FETCH_ASSOC)) {
        $bar = str_repeat("█", max(1, round($r['total'] / 15000)));
        echo "      📅 {$r['tgl']} | {$r['jml_trx']} Trx | Rp " . str_pad(number_format($r['total'], 0, ',', '.'), 8, ' ', STR_PAD_LEFT) . " | $bar\n";
    }

    echo "\n=======================================================\n";
    echo "            SEEDING SELESAI DENGAN SUKSES!             \n";
    echo "=======================================================\n";

} catch (Exception $e) {
    echo "Error Seeder: " . $e->getMessage() . "\n";
}
