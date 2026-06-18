<?php
class Database {
    private $host = "aws-1-ap-northeast-2.pooler.supabase.com";
    private $port = "6543";
    private $db_name = "postgres";
    private $username = "postgres.mtzmvoeuotkuygsvjhvf";
    private $password = "998776554fathur_";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";sslmode=require;user=" . $this->username . ";password=" . $this->password;
            $this->conn = new PDO($dsn);
            
            // Set error mode exception
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode([
                "success" => false, 
                "message" => "Connection error: " . $exception->getMessage()
            ]);
            exit;
        }

        return $this->conn;
    }
}
