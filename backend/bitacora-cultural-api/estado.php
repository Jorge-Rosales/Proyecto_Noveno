<?php

declare(strict_types=1);

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

require_once __DIR__ . '/config/conexion.php';

try {
    $conexion = obtenerConexion();

    // Consulta sencilla que no modifica datos.
    $conexion->query('SELECT 1');

    http_response_code(200);

    echo json_encode([
        'estado' => 'correcto',
        'mensaje' => 'API y base de datos disponibles'
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $error) {
    http_response_code(503);

    echo json_encode([
        'estado' => 'error',
        'mensaje' => 'El servicio de base de datos no está disponible'
    ], JSON_UNESCAPED_UNICODE);
}