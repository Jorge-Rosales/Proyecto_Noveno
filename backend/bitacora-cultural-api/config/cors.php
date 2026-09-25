<?php

declare(strict_types=1);

function aplicarCors(): void
{
    $origenesPermitidos = [
        'http://localhost:8100',
        'http://localhost:8101',
    ];

    $origenRecibido = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origenRecibido, $origenesPermitidos, true)) {
        header('Access-Control-Allow-Origin: ' . $origenRecibido);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Max-Age: 600');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}