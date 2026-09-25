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

// El registro solamente acepta solicitudes POST.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    responder(405, [
        'estado' => 'error',
        'mensaje' => 'Método HTTP no permitido'
    ]);
}

// Solamente aceptamos cuerpos JSON.
$tipoContenido = $_SERVER['CONTENT_TYPE'] ?? '';

if (
    !preg_match(
        '~^application/json(?:\s*;|$)~i',
        $tipoContenido
    )
) {
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

if (
    !is_array($datos)
    || array_is_list($datos)
) {
    responder(400, [
        'estado' => 'error',
        'mensaje' => 'Se esperaba un objeto JSON'
    ]);
}

$email = $datos['email'] ?? null;
$contrasena = $datos['contrasena'] ?? null;

// Comprobar que ambos datos sean cadenas.
if (!is_string($email) || !is_string($contrasena)) {
    responder(400, [
        'estado' => 'error',
        'mensaje' => 'El correo y la contraseña son obligatorios'
    ]);
}

$email = strtolower(trim($email));

// Validar el correo.
if (
    $email === ''
    || strlen($email) > 254
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'El correo electrónico no es válido'
    ]);
}

// Validar una longitud mínima y máxima de contraseña.
if (
    strlen($contrasena) < 12
    || strlen($contrasena) > 128
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'La contraseña debe tener entre 12 y 128 bytes'
    ]);
}

require_once __DIR__ . '/config/conexion.php';

try {
    // Crear un UUID para el identificador del usuario.
    $bytes = random_bytes(16);

    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

    $hexadecimal = bin2hex($bytes);

    $id = sprintf(
        '%s-%s-%s-%s-%s',
        substr($hexadecimal, 0, 8),
        substr($hexadecimal, 8, 4),
        substr($hexadecimal, 12, 4),
        substr($hexadecimal, 16, 4),
        substr($hexadecimal, 20, 12)
    );

    // Nunca almacenar la contraseña original.
    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    $conexion = obtenerConexion();

    $consulta = $conexion->prepare(
        'INSERT INTO usuarios (id, email, password_hash)
         VALUES (:id, :email, :password_hash)'
    );

    $consulta->execute([
        'id' => $id,
        'email' => $email,
        'password_hash' => $hash
    ]);

    responder(201, [
        'estado' => 'correcto',
        'mensaje' => 'Usuario registrado correctamente',
        'usuario' => [
            'id' => $id,
            'email' => $email
        ]
    ]);

} catch (PDOException $error) {

    // MySQL utiliza 23000 para errores de integridad,
    // incluidos los correos duplicados.
    if (
        $error->getCode() === '23000'
        && isset($error->errorInfo[1])
        && (int) $error->errorInfo[1] === 1062
    ) {
        responder(409, [
            'estado' => 'error',
            'mensaje' => 'El correo electrónico ya está registrado'
        ]);
    }

    error_log('Error de base de datos durante el registro');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible registrar el usuario'
    ]);

} catch (Throwable $error) {

    error_log('Error interno durante el registro');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible registrar el usuario'
    ]);
}
