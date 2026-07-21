<?php
/**
 * Warung Adjie - Database Layer Automated Test Suite
 * Verifies PDO Connection, Table Schema, utf8mb4 Collation, and ACID/UTF-8 Transaction Integrity.
 */

require_once __DIR__ . '/../config/database.php';

echo "\n=======================================================\n";
echo "   WARUNG ADJIE - DATABASE LAYER AUTOMATED TEST SUITE   \n";
echo "=======================================================\n\n";

$passed = 0;
$failed = 0;

function runTest($testName, $callback) {
    global $passed, $failed;
    echo str_pad("Testing: {$testName} ", 60, ".", STR_PAD_RIGHT) . " ";
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

// 1. Test PDO Connection
runTest("PDO Connection Establishment", function() {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db instanceof PDO) {
        throw new Exception("Connection did not return a valid PDO instance.");
    }
});

$database = new Database();
$db = $database->getConnection();

// 2. Test Tables Exist
$expectedTables = ['produk', 'transaksi', 'detail_transaksi', 'users'];
foreach ($expectedTables as $table) {
    runTest("Table Schema Existence: {$table}", function() use ($db, $table) {
        $stmt = $db->query("SHOW TABLES LIKE '{$table}'");
        if ($stmt->rowCount() === 0) {
            throw new Exception("Table '{$table}' does not exist in database.");
        }
    });
}

// 3. Test utf8mb4 Collation
runTest("Database Table Collation (utf8mb4 verification)", function() use ($db) {
    $stmt = $db->query("SHOW TABLE STATUS WHERE Name IN ('produk', 'transaksi', 'detail_transaksi', 'users')");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (stripos($row['Collation'], 'utf8mb4') === false) {
            throw new Exception("Table {$row['Name']} has collation {$row['Collation']} instead of utf8mb4.");
        }
    }
});

// 4. Test ACID Transaction & UTF-8 Emoji Storage/Retrieval
runTest("ACID Transaction & UTF-8 Storage Integrity", function() use ($db) {
    $db->beginTransaction();
    
    // Insert test product with emojis
    $testName = "[TEST] Kopi Spesial Nusantara ☕🍵✨";
    $stmt = $db->prepare("INSERT INTO produk (nama_produk, kategori, harga_modal, harga_jual, stok) VALUES (:nama, 'Minuman', 10000, 15000, 50)");
    $stmt->execute([':nama' => $testName]);
    
    $insertId = $db->lastInsertId();
    if (!$insertId) {
        $db->rollBack();
        throw new Exception("Failed to get last insert ID inside transaction.");
    }

    // Retrieve and check string match
    $stmtSelect = $db->prepare("SELECT nama_produk FROM produk WHERE id_produk = :id");
    $stmtSelect->execute([':id' => $insertId]);
    $retrieved = $stmtSelect->fetchColumn();

    if ($retrieved !== $testName) {
        $db->rollBack();
        throw new Exception("UTF-8 mismatch! Inserted: '{$testName}', Retrieved: '{$retrieved}'");
    }

    // Rollback so we don't pollute the production database
    $db->rollBack();

    // Verify rollback worked
    $stmtCheck = $db->prepare("SELECT COUNT(*) FROM produk WHERE id_produk = :id");
    $stmtCheck->execute([':id' => $insertId]);
    if ($stmtCheck->fetchColumn() > 0) {
        throw new Exception("ACID Rollback failed! Test row persisted.");
    }
});

echo "\n-------------------------------------------------------\n";
echo "Summary: {$passed} Passed | {$failed} Failed\n";
echo "-------------------------------------------------------\n\n";

exit($failed > 0 ? 1 : 0);
