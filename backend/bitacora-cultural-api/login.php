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

$tipoContenido = $_SERVER['CONTENT_TYPE'] ?? '';

if (!preg_match('~^application/json(?:\s*;|$)~i', $tipoContenido)) {
    responder(415, [
        'estado' => 'error',
        'mensaje' => 'El contenido debe ser JSON'
    ]);
}

$contenido = file_get_contents('php://input');

try {
    $datos = json_decode(
        $contenido,
        true,
        512,
        JSON_THROW_ON_ERROR
    );
} catch (JsonException $error) {
    responder(400, [
        'estado' => 'error',
        'mensaje' => 'El JSON enviado no es válido'
    ]);
}

if (!is_array($datos) || array_is_list($datos)) {
    responder(400, [
        'estado' => 'error',
        'mensaje' => 'Se esperaba un objeto JSON'
    ]);
}

$email = $datos['email'] ?? null;
$contrasena = $datos['contrasena'] ?? null;

if (!is_string($email) || !is_string($contrasena)) {
    responder(400, [
        'estado' => 'error',
        'mensaje' => 'El correo y la contraseña son obligatorios'
    ]);
}

$email = strtolower(trim($email));

if (
    $email === ''
    || strlen($email) > 254
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || $contrasena === ''
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'El correo o la contraseña no son válidos'
    ]);
}

require_once __DIR__ . '/config/conexion.php';

try {
    $conexion = obtenerConexion();

    $consulta = $conexion->prepare(
        'SELECT id, email, password_hash
         FROM usuarios
         WHERE email = :email
         LIMIT 1'
    );

    $consulta->execute([
        'email' => $email
    ]);

    $usuario = $consulta->fetch();

    if (
        !$usuario
        || !password_verify($contrasena, $usuario['password_hash'])
    ) {
        responder(401, [
            'estado' => 'error',
            'mensaje' => 'Correo o contraseña incorrectos'
        ]);
    }

    // La sesión identificará al usuario en solicitudes posteriores.
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

    // Renovar el identificador de sesión después de autenticar.
    session_regenerate_id(true);

    $_SESSION['usuario_id'] = $usuario['id'];

    responder(200, [
        'estado' => 'correcto',
        'mensaje' => 'Inicio de sesión correcto',
        'usuario' => [
            'id' => $usuario['id'],
            'email' => $usuario['email']
        ]
    ]);

} catch (PDOException $error) {
    error_log('Error de base de datos durante el inicio de sesión');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible iniciar sesión'
    ]);

} catch (Throwable $error) {
    error_log('Error interno durante el inicio de sesión');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible iniciar sesión'
    ]);
}