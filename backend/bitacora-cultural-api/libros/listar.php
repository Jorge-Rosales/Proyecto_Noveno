<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
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

require_once __DIR__ . '/../config/autenticacion.php';
require_once __DIR__ . '/../config/conexion.php';

// Se obtiene el usuario de la sesión PHP, no de la URL ni del Body.
$usuarioId = obtenerUsuarioAutenticado();

try {
    $conexion = obtenerConexion();

    // Comprobar que la cuenta asociada con la sesión todavía existe.
    $consultaUsuario = $conexion->prepare(
        'SELECT id FROM usuarios WHERE id = :usuario_id LIMIT 1'
    );

    $consultaUsuario->execute([
        'usuario_id' => $usuarioId
    ]);

    if (!$consultaUsuario->fetch()) {
        http_response_code(401);

        echo json_encode([
            'estado' => 'error',
            'mensaje' => 'La sesión ya no es válida'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    // Mostrar únicamente los libros del usuario autenticado.
    $consulta = $conexion->prepare(
        'SELECT
            id,
            titulo,
            autor,
            genero,
            calificacion,
            estado,
            fecha_inicio,
            fecha_finalizacion,
            opinion,
            frase_favorita,
            fecha_creacion,
            fecha_actualizacion
         FROM libros
         WHERE usuario_id = :usuario_id
         ORDER BY fecha_creacion DESC, id DESC'
    );

    $consulta->execute([
        'usuario_id' => $usuarioId
    ]);

    $libros = $consulta->fetchAll();

    http_response_code(200);

    echo json_encode([
        'estado' => 'correcto',
        'mensaje' => 'Libros consultados correctamente',
        'libros' => $libros
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

} catch (PDOException $error) {
    error_log('Error al consultar los libros');

    http_response_code(500);

    echo json_encode([
        'estado' => 'error',
        'mensaje' => 'No fue posible consultar los libros'
    ], JSON_UNESCAPED_UNICODE);
}
