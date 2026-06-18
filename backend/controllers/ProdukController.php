<?php
require_once 'models/Produk.php';
require_once 'views/JsonView.php';

class ProdukController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            JsonView::render(false, null, "Method not allowed. Only GET is allowed.", 405);
        }

        try {
            $produkModel = new Produk($this->db);
            $data = $produkModel->getAll();

            if (count($data) > 0) {
                JsonView::render(true, $data, "Data produk berhasil diambil");
            } else {
                JsonView::render(true, [], "Tidak ada data produk");
            }
        } catch (Exception $e) {
            JsonView::render(false, null, "Gagal mengambil data produk: " . $e->getMessage(), 500);
        }
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed.", 405);
        }
        
        $nama = $_POST['nama'] ?? '';
        $kategori = $_POST['kategori'] ?? '';
        $harga_modal = $_POST['harga_modal'] ?? '';
        $harga_jual = $_POST['harga_jual'] ?? '';
        $stok = isset($_POST['stok']) ? $_POST['stok'] : '';
        
        $gambarPath = null;
        if (!empty($_FILES['gambar']['name'])) {
            $uploadDir = 'uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileName = time() . '_' . basename($_FILES['gambar']['name']);
            $targetFilePath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['gambar']['tmp_name'], $targetFilePath)) {
                $gambarPath = $fileName;
            }
        }

        if (!empty($nama) && !empty($harga_modal) && !empty($harga_jual) && $stok !== '') {
            $produk = new Produk($this->db);
            if ($produk->create($nama, $kategori, $harga_modal, $harga_jual, $stok, $gambarPath)) {
                JsonView::render(true, null, "Produk berhasil ditambahkan.", 201);
            } else {
                JsonView::render(false, null, "Gagal menambahkan produk.", 500);
            }
        } else {
            JsonView::render(false, null, "Data tidak lengkap.", 400);
        }
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed.", 405);
        }
        
        $id = $_POST['id'] ?? '';
        $nama = $_POST['nama'] ?? '';
        $kategori = $_POST['kategori'] ?? '';
        $harga_modal = $_POST['harga_modal'] ?? '';
        $harga_jual = $_POST['harga_jual'] ?? '';
        $stok = isset($_POST['stok']) ? $_POST['stok'] : '';

        $gambarPath = null;
        if (!empty($_FILES['gambar']['name'])) {
            $uploadDir = 'uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileName = time() . '_' . basename($_FILES['gambar']['name']);
            $targetFilePath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['gambar']['tmp_name'], $targetFilePath)) {
                $gambarPath = $fileName;
            }
        }

        if (!empty($id) && !empty($nama) && !empty($harga_modal) && !empty($harga_jual) && $stok !== '') {
            $produk = new Produk($this->db);
            if ($produk->update($id, $nama, $kategori, $harga_modal, $harga_jual, $stok, $gambarPath)) {
                JsonView::render(true, null, "Produk berhasil diupdate.");
            } else {
                JsonView::render(false, null, "Gagal mengupdate produk.", 500);
            }
        } else {
            JsonView::render(false, null, "Data tidak lengkap.", 400);
        }
    }

    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed.", 405);
        }
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) {
            $produk = new Produk($this->db);
            if ($produk->delete($data->id)) {
                JsonView::render(true, null, "Produk berhasil dihapus.");
            } else {
                JsonView::render(false, null, "Gagal menghapus produk.", 500);
            }
        } else {
            JsonView::render(false, null, "ID tidak ditemukan.", 400);
        }
    }

    public function restock() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed.", 405);
        }
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id) && !empty($data->tambahan)) {
            $produk = new Produk($this->db);
            if ($produk->restock($data->id, $data->tambahan)) {
                JsonView::render(true, null, "Stok berhasil ditambah.");
            } else {
                JsonView::render(false, null, "Gagal menambah stok.", 500);
            }
        } else {
            JsonView::render(false, null, "Data tidak lengkap.", 400);
        }
    }
}
