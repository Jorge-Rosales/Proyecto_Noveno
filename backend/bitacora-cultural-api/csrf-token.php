<?php

declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
aplicarCors();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    http_response_code(405);

    echo json_encode([
        'estado' => 'error',
        'mensaje' => 'Método HTTP no permitido'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

require_once __DIR__ . '/config/autenticacion.php';
require_once __DIR__ . '/config/csrf.php';

// Comprueba la sesión y obtiene el identificador del usuario.
obtenerUsuarioAutenticado();

// Genera un token si la sesión todavía no tiene uno.
$token = obtenerTokenCsrf();

http_response_code(200);

echo json_encode([
    'estado' => 'correcto',
    'mensaje' => 'Token CSRF obtenido correctamente',
    'csrf_token' => $token
], JSON_UNESCAPED_UNICODE);
