<?php

declare(strict_types=1);

/**
 * Debe llamarse después de iniciar la sesión PHP.
 */
function obtenerTokenCsrf(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        throw new RuntimeException('La sesión no está iniciada');
    }

    if (
        !isset($_SESSION['csrf_token'])
        || !is_string($_SESSION['csrf_token'])
    ) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

/**
 * Comprueba el token enviado en el encabezado X-CSRF-Token.
 * Debe llamarse después de verificar la autenticación.
 */
function verificarTokenCsrf(): void
{
    $tokenEsperado = obtenerTokenCsrf();
    $tokenRecibido = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (
        !is_string($tokenRecibido)
        || !hash_equals($tokenEsperado, $tokenRecibido)
    ) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');

        echo json_encode([
            'estado' => 'error',
            'mensaje' => 'Token CSRF inválido o ausente'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }
}