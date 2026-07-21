<?php
/**
 * Warung Adjie - Backend API Layer Automated Integration Test Suite
 * Verifies HTTP Status Codes, Content-Type (charset=UTF-8), JSON parsing, and Endpoint Data Integrity.
 */

require_once __DIR__ . '/../config/database.php';

echo "\n=======================================================\n";
echo "   WARUNG ADJIE - BACKEND API AUTOMATED TEST SUITE      \n";
echo "=======================================================\n\n";

$baseUrl = "http://localhost/project/warung-adjie/backend/index.php?route=";
$passed = 0;
$failed = 0;

function runApiTest($testName, $callback) {
    global $passed, $failed;
    echo str_pad("Testing API: {$testName} ", 60, ".", STR_PAD_RIGHT) . " ";
    try {
        $callback();
        echo " [ PASS ]\n";
        $passed++;
    } catch (Throwable $e) {
        echo " [ FAIL ]\n";
        echo "   -> Error: " . $e->getMessage() . "\n";
        $failed++;
    }
}

function makeRequest($route, $method = 'GET', $data = null) {
    global $baseUrl;
    $url = $baseUrl . $route;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if (is_array($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }
    }

    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'headers' => $headers,
        'body' => $body,
        'json' => json_decode($body, true)
    ];
}

// 1. Test GET /produk
runApiTest("GET /produk endpoint & UTF-8 header", function() {
    $res = makeRequest('produk');
    if ($res['code'] !== 200) {
        throw new Exception("Expected HTTP 200, got {$res['code']}");
    }
    if (stripos($res['headers'], 'Content-Type: application/json; charset=UTF-8') === false &&
        stripos($res['headers'], 'content-type: application/json; charset=utf-8') === false) {
        throw new Exception("Missing 'charset=UTF-8' in Content-Type header!");
    }
    if (!isset($res['json']['success']) || $res['json']['success'] !== true) {
        throw new Exception("API success flag is false or missing.");
    }
    if (!is_array($res['json']['data'])) {
        throw new Exception("API data structure is not an array.");
    }
});

// 2. Test GET /transaksi
runApiTest("GET /transaksi endpoint response", function() {
    $res = makeRequest('transaksi');
    if ($res['code'] !== 200) {
        throw new Exception("Expected HTTP 200, got {$res['code']}");
    }
    if (!isset($res['json']['success']) || $res['json']['success'] !== true) {
        throw new Exception("API success flag is false.");
    }
});

// 3. Test GET /laporan
runApiTest("GET /laporan structure & metric fields", function() {
    $res = makeRequest('laporan');
    if ($res['code'] !== 200) {
        throw new Exception("Expected HTTP 200, got {$res['code']}");
    }
    $data = $res['json']['data'] ?? [];
    $requiredKeys = ['total_pendapatan', 'total_modal', 'laba_kotor', 'per_hari', 'per_kategori', 'top_produk'];
    foreach ($requiredKeys as $key) {
        if (!array_key_exists($key, $data)) {
            throw new Exception("Missing required field '{$key}' in laporan payload.");
        }
    }
});

// 4. Test 404 Not Found Route
runApiTest("GET /invalid_route 404 handling", function() {
    $res = makeRequest('invalid_route');
    if ($res['code'] !== 404) {
        throw new Exception("Expected HTTP 404 for invalid route, got {$res['code']}");
    }
    if ($res['json']['success'] !== false) {
        throw new Exception("Expected success=false on 404 route.");
    }
});

// 5. Test POST /produk_create and UTF-8 Emoji JSON payload check
runApiTest("POST /produk_create with UTF-8 emojis & cleanup", function() {
    $testName = "[API TEST] Paket Snack Rempah 🍿🍹🔥";
    $postData = [
        'nama' => $testName,
        'kategori' => 'Makanan',
        'harga_modal' => 8000,
        'harga_jual' => 12000,
        'stok' => 25
    ];

    $createRes = makeRequest('produk_create', 'POST', $postData);
    if ($createRes['code'] !== 201 && $createRes['code'] !== 200) {
        throw new Exception("Expected 201/200 when creating product, got {$createRes['code']}: " . ($createRes['json']['message'] ?? ''));
    }

    // Verify it appears cleanly via GET /produk without mojibake
    $listRes = makeRequest('produk');
    $found = false;
    $createdId = null;
    foreach ($listRes['json']['data'] as $item) {
        if ($item['nama'] === $testName) {
            $found = true;
            $createdId = $item['id'];
            break;
        }
    }

    if (!$found) {
        throw new Exception("Created UTF-8 product not found in GET /produk or suffered encoding corruption!");
    }

    // Clean up created test row directly via PDO to leave DB clean
    if ($createdId) {
        $database = new Database();
        $db = $database->getConnection();
        $stmt = $db->prepare("DELETE FROM produk WHERE id_produk = :id");
        $stmt->execute([':id' => $createdId]);
    }
});

echo "\n-------------------------------------------------------\n";
echo "Summary: {$passed} Passed | {$failed} Failed\n";
echo "-------------------------------------------------------\n\n";

exit($failed > 0 ? 1 : 0);
