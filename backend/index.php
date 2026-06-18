<?php
// CORS Headers (Global for all routes)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';
require_once 'views/JsonView.php';

// Menangkap route dari URL atau param 'route' hasil dari .htaccess
$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';

if ($route === '') {
    JsonView::render(false, null, "Warung Adjie API is running.", 200);
}

// Inisialisasi Database
$database = new Database();
$db = $database->getConnection();

try {
    switch ($route) {
        case 'produk':
            require_once 'controllers/ProdukController.php';
            $controller = new ProdukController($db);
            $controller->index();
            break;
            
        case 'produk_create':
            require_once 'controllers/ProdukController.php';
            $controller = new ProdukController($db);
            $controller->create();
            break;

        case 'produk_update':
            require_once 'controllers/ProdukController.php';
            $controller = new ProdukController($db);
            $controller->update();
            break;

        case 'produk_delete':
            require_once 'controllers/ProdukController.php';
            $controller = new ProdukController($db);
            $controller->delete();
            break;

        case 'produk_restock':
            require_once 'controllers/ProdukController.php';
            $controller = new ProdukController($db);
            $controller->restock();
            break;
            
        case 'transaksi':
            require_once 'controllers/TransaksiController.php';
            $controller = new TransaksiController($db);
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->index();
            } else {
                $controller->store();
            }
            break;

        case 'transaksi_create':
            require_once 'controllers/TransaksiController.php';
            $controller = new TransaksiController($db);
            $controller->store();
            break;

        case 'laporan':
            require_once 'controllers/LaporanController.php';
            $controller = new LaporanController($db);
            $controller->index();
            break;
            
        default:
            JsonView::render(false, null, "Route '{$route}' not found.", 404);
            break;
    }
} catch (Throwable $e) {
    JsonView::render(false, null, "Fatal Server Error: " . $e->getMessage(), 500);
}
