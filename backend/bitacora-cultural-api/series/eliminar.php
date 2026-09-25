<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
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

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    header('Allow: DELETE');

    responder(405, [
        'estado' => 'error',
        'mensaje' => 'Método HTTP no permitido'
    ]);
}

require_once __DIR__ . '/../config/autenticacion.php';
require_once __DIR__ . '/../config/csrf.php';
require_once __DIR__ . '/../config/conexion.php';

$usuarioId = obtenerUsuarioAutenticado();
verificarTokenCsrf();

$tipoContenido = $_SERVER['CONTENT_TYPE'] ?? '';

if (!preg_match('~^application/json(?:\s*;|$)~i', $tipoContenido)) {
    responder(415, [
        'estado' => 'error',
        'mensaje' => 'El contenido debe ser JSON'
    ]);
}

try {
    $datos = json_decode(
        file_get_contents('php://input'),
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

$id = $datos['id'] ?? null;

if (
    !is_string($id)
    || !preg_match(
        '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
        $id
    )
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'El identificador de la serie no es válido'
    ]);
}

try {
    $conexion = obtenerConexion();

    $consulta = $conexion->prepare(
        'DELETE FROM series
         WHERE id = :id
           AND usuario_id = :usuario_id'
    );

    $consulta->execute([
        'id' => $id,
        'usuario_id' => $usuarioId
    ]);

    if ($consulta->rowCount() === 0) {
        responder(404, [
            'estado' => 'error',
            'mensaje' => 'Serie no encontrada'
        ]);
    }

    responder(200, [
        'estado' => 'correcto',
        'mensaje' => 'Serie eliminada correctamente'
    ]);

} catch (PDOException $error) {
    error_log('Error de base de datos al eliminar la serie');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible eliminar la serie'
    ]);

} catch (Throwable $error) {
    error_log('Error interno al eliminar la serie');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible eliminar la serie'
    ]);
}
