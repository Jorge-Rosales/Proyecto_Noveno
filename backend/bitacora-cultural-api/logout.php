<?php

declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
aplicarCors();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder(int $codigo, array $datos): never
{
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    responder(405, [
        'estado' => 'error',
        'mensaje' => 'Método HTTP no permitido'
    ]);
}

require_once __DIR__ . '/config/autenticacion.php';
require_once __DIR__ . '/config/csrf.php';

obtenerUsuarioAutenticado();
verificarTokenCsrf();

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();

    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $parametros['path'],
        'domain' => $parametros['domain'],
        'secure' => $parametros['secure'],
        'httponly' => $parametros['httponly'],
        'samesite' => $parametros['samesite'] ?? 'Lax',
    ]);
}

session_destroy();

responder(200, [
    'estado' => 'correcto',
    'mensaje' => 'Sesión cerrada correctamente'
]);
