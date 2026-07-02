<?php
require_once 'models/User.php';
require_once 'views/JsonView.php';

class AuthController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    private function getInputData() {
        $json = json_decode(file_get_contents("php://input"), true);
        if ($json && is_array($json)) {
            return $json;
        }
        return $_POST;
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed. Only POST is allowed.", 405);
        }

        $input = $this->getInputData();
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            JsonView::render(false, null, "Email dan password wajib diisi.", 400);
        }

        try {
            $userModel = new User($this->db);
            $user = $userModel->findByEmail($email);

            if ($user && password_verify($password, $user['password'])) {
                $token = "mysql_token_" . md5($user['email'] . time());
                $userData = [
                    "id" => $user['id_user'],
                    "email" => $user['email'],
                    "access_token" => $token
                ];
                JsonView::render(true, ["user" => $userData], "Login berhasil.", 200);
            } else {
                JsonView::render(false, null, "Email atau password salah.", 401);
            }
        } catch (Exception $e) {
            JsonView::render(false, null, "Terjadi kesalahan sistem: " . $e->getMessage(), 500);
        }
    }

    public function register() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed. Only POST is allowed.", 405);
        }

        $input = $this->getInputData();
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            JsonView::render(false, null, "Email dan password wajib diisi.", 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            JsonView::render(false, null, "Format email tidak valid.", 400);
        }

        if (strlen($password) < 6) {
            JsonView::render(false, null, "Password minimal 6 karakter.", 400);
        }

        try {
            $userModel = new User($this->db);
            $existing = $userModel->findByEmail($email);
            if ($existing) {
                JsonView::render(false, null, "Email sudah terdaftar.", 400);
            }

            if ($userModel->create($email, $password)) {
                $token = "mysql_token_" . md5($email . time());
                $userData = [
                    "email" => $email,
                    "access_token" => $token
                ];
                JsonView::render(true, ["user" => $userData], "Registrasi berhasil.", 201);
            } else {
                JsonView::render(false, null, "Gagal mendaftarkan user baru.", 500);
            }
        } catch (Exception $e) {
            JsonView::render(false, null, "Terjadi kesalahan sistem: " . $e->getMessage(), 500);
        }
    }

    public function forgot() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            JsonView::render(false, null, "Method not allowed. Only POST is allowed.", 405);
        }

        $input = $this->getInputData();
        $email = trim($input['email'] ?? '');

        if (empty($email)) {
            JsonView::render(false, null, "Email wajib diisi.", 400);
        }

        try {
            $userModel = new User($this->db);
            $user = $userModel->findByEmail($email);
            if (!$user) {
                JsonView::render(false, null, "Email tidak ditemukan dalam database.", 404);
            }

            $tempPassword = "admin" . rand(100, 999);
            if ($userModel->updatePassword($email, $tempPassword)) {
                JsonView::render(true, [
                    "email" => $email,
                    "temp_password" => $tempPassword
                ], "Password berhasil direset. Password sementara Anda: {$tempPassword}", 200);
            } else {
                JsonView::render(false, null, "Gagal mereset password.", 500);
            }
        } catch (Exception $e) {
            JsonView::render(false, null, "Terjadi kesalahan sistem: " . $e->getMessage(), 500);
        }
    }
}
?>
