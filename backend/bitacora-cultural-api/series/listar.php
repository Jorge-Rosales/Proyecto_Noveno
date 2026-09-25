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

$usuarioId = obtenerUsuarioAutenticado();

try {
    $conexion = obtenerConexion();

    $consulta = $conexion->prepare(
        'SELECT
            id,
            titulo,
            creador,
            genero,
            calificacion,
            estado,
            total_temporadas,
            temporada_actual,
            ultimo_episodio,
            fecha_inicio,
            fecha_finalizacion,
            opinion,
            frase_favorita,
            fecha_creacion,
            fecha_actualizacion
         FROM series
         WHERE usuario_id = :usuario_id
         ORDER BY fecha_creacion DESC, id DESC'
    );

    $consulta->execute([
        'usuario_id' => $usuarioId
    ]);

    http_response_code(200);

    echo json_encode([
        'estado' => 'correcto',
        'mensaje' => 'Series consultadas correctamente',
        'series' => $consulta->fetchAll()
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

} catch (PDOException $error) {
    error_log('Error al consultar las series');

    http_response_code(500);

    echo json_encode([
        'estado' => 'error',
        'mensaje' => 'No fue posible consultar las series'
    ], JSON_UNESCAPED_UNICODE);
}
