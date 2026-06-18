<?php
require_once 'models/Transaksi.php';
require_once 'views/JsonView.php';

class TransaksiController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            JsonView::render(false, null, "Method not allowed. Only GET is allowed.", 405);
        }

        try {
            $transaksiModel = new Transaksi($this->db);
            $data = $transaksiModel->getAll();
            JsonView::render(true, $data, "Data transaksi berhasil diambil.");
        } catch (Exception $e) {
            JsonView::render(false, null, "Gagal mengambil data transaksi: " . $e->getMessage(), 500);
        }
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed. Only POST is allowed.", 405);
        }

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->total_bayar) || !isset($data->details) || !is_array($data->details) || empty($data->details)) {
            JsonView::render(false, null, "Incomplete data. total_bayar and details array are required.", 400);
        }

        try {
            $transaksiModel = new Transaksi($this->db);
            $result = $transaksiModel->createTransaksi($data->total_bayar, $data->details);
            JsonView::render(true, $result, "Transaksi berhasil diproses.", 201);
        } catch (Exception $e) {
            JsonView::render(false, null, "Transaksi gagal: " . $e->getMessage(), 500);
        }
    }
}
