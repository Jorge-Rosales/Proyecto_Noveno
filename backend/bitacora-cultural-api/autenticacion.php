<?php

declare(strict_types=1);

function obtenerUsuarioAutenticado(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        ini_set('session.use_strict_mode', '1');

        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/bitacora-cultural-api/',
            'secure' => !empty($_SERVER['HTTPS'])
                && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        session_start();
    }

    $usuarioId = $_SESSION['usuario_id'] ?? null;

    if (!is_string($usuarioId) || $usuarioId === '') {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'estado' => 'error',
            'mensaje' => 'Debes iniciar sesión'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    return $usuarioId;
}