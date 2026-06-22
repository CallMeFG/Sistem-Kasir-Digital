<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $env = parse_ini_file($envFile);
            if ($env !== false) {
                foreach ($env as $key => $value) {
                    $_ENV[$key] = $value;
                    putenv("$key=$value");
                }
            }
        }

        $this->host = getenv('DB_HOST') ?: $_ENV['DB_HOST'] ?? '';
        $this->port = getenv('DB_PORT') ?: $_ENV['DB_PORT'] ?? '';
        $this->db_name = getenv('DB_NAME') ?: $_ENV['DB_NAME'] ?? '';
        $this->username = getenv('DB_USER') ?: $_ENV['DB_USER'] ?? '';
        $this->password = getenv('DB_PASS') ?: $_ENV['DB_PASS'] ?? '';
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";sslmode=require;user=" . $this->username . ";password=" . $this->password;
            $this->conn = new PDO($dsn);
            
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
