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

ini_set('session.use_strict_mode', '1');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/bitacora-cultural-api/',
    'secure' => !empty($_SERVER['HTTPS'])
        && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

$usuarioId = $_SESSION['usuario_id'] ?? null;

if (!is_string($usuarioId) || $usuarioId === '') {
    http_response_code(401);

    echo json_encode([
        'estado' => 'error',
        'mensaje' => 'No hay una sesión activa'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

require_once __DIR__ . '/config/conexion.php';

try {
    $conexion = obtenerConexion();

    $consulta = $conexion->prepare(
        'SELECT id, email
         FROM usuarios
         WHERE id = :id
         LIMIT 1'
    );

    $consulta->execute(['id' => $usuarioId]);

    $usuario = $consulta->fetch();

    if (!$usuario) {
        $_SESSION = [];
        session_destroy();

        http_response_code(401);

        echo json_encode([
            'estado' => 'error',
            'mensaje' => 'La sesión ya no es válida'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    http_response_code(200);

    echo json_encode([
        'estado' => 'correcto',
        'mensaje' => 'Sesión activa',
        'usuario' => [
            'id' => $usuario['id'],
            'email' => $usuario['email']
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $error) {
    error_log('Error al consultar la sesión');

    http_response_code(500);

    echo json_encode([
        'estado' => 'error',
        'mensaje' => 'No fue posible comprobar la sesión'
    ], JSON_UNESCAPED_UNICODE);
}
