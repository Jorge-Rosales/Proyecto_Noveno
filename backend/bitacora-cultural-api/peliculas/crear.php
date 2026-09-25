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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

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

$titulo = $datos['titulo'] ?? null;

if (
    !is_string($titulo)
    || trim($titulo) === ''
    || mb_strlen(trim($titulo)) > 255
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'El título es obligatorio y debe tener máximo 255 caracteres'
    ]);
}

$titulo = trim($titulo);

$valores = [];

foreach (['director' => 255, 'genero' => 100] as $campo => $maximo) {
    $valor = $datos[$campo] ?? null;

    if (
        $valor !== null
        && (
            !is_string($valor)
            || mb_strlen(trim($valor)) > $maximo
        )
    ) {
        responder(422, [
            'estado' => 'error',
            'mensaje' => "El campo {$campo} no es válido"
        ]);
    }

    $valores[$campo] = is_string($valor) && trim($valor) !== ''
        ? trim($valor)
        : null;
}

foreach (['opinion', 'frase_favorita'] as $campo) {
    $valor = $datos[$campo] ?? null;

    if ($valor !== null && !is_string($valor)) {
        responder(422, [
            'estado' => 'error',
            'mensaje' => "El campo {$campo} no es válido"
        ]);
    }

    $valores[$campo] = is_string($valor) && trim($valor) !== ''
        ? trim($valor)
        : null;
}

$calificacion = $datos['calificacion'] ?? null;

if (
    $calificacion !== null
    && (
        !is_int($calificacion)
        || $calificacion < 1
        || $calificacion > 5
    )
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'La calificación debe ser un entero entre 1 y 5'
    ]);
}

$estado = $datos['estado'] ?? 'En progreso';

if (
    !is_string($estado)
    || !in_array(
        $estado,
        ['En progreso', 'Terminado', 'Abandonado'],
        true
    )
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'El estado de la película no es válido'
    ]);
}

$fechas = [];

foreach (['fecha_inicio', 'fecha_finalizacion'] as $campo) {
    $valor = $datos[$campo] ?? null;

    if ($valor === '') {
        $valor = null;
    }

    if ($valor !== null) {
        if (
            !is_string($valor)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $valor)
        ) {
            responder(422, [
                'estado' => 'error',
                'mensaje' => "La fecha {$campo} no es válida"
            ]);
        }

        $fecha = DateTimeImmutable::createFromFormat('!Y-m-d', $valor);
        $erroresFecha = DateTimeImmutable::getLastErrors();

        if (
            $fecha === false
            || $fecha->format('Y-m-d') !== $valor
            || (
                $erroresFecha !== false
                && (
                    $erroresFecha['warning_count'] > 0
                    || $erroresFecha['error_count'] > 0
                )
            )
        ) {
            responder(422, [
                'estado' => 'error',
                'mensaje' => "La fecha {$campo} no es válida"
            ]);
        }
    }

    $fechas[$campo] = $valor;
}

if (
    $fechas['fecha_inicio'] !== null
    && $fechas['fecha_finalizacion'] !== null
    && $fechas['fecha_finalizacion'] < $fechas['fecha_inicio']
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'La fecha de finalización no puede ser anterior a la de inicio'
    ]);
}

try {
    $conexion = obtenerConexion();

    $consultaUsuario = $conexion->prepare(
        'SELECT id FROM usuarios WHERE id = :id LIMIT 1'
    );

    $consultaUsuario->execute(['id' => $usuarioId]);

    if (!$consultaUsuario->fetch()) {
        responder(401, [
            'estado' => 'error',
            'mensaje' => 'La sesión ya no es válida'
        ]);
    }

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

    $consulta = $conexion->prepare(
        'INSERT INTO peliculas (
            id,
            usuario_id,
            titulo,
            director,
            genero,
            calificacion,
            estado,
            fecha_inicio,
            fecha_finalizacion,
            opinion,
            frase_favorita
        ) VALUES (
            :id,
            :usuario_id,
            :titulo,
            :director,
            :genero,
            :calificacion,
            :estado,
            :fecha_inicio,
            :fecha_finalizacion,
            :opinion,
            :frase_favorita
        )'
    );

    $consulta->execute([
        'id' => $id,
        'usuario_id' => $usuarioId,
        'titulo' => $titulo,
        'director' => $valores['director'],
        'genero' => $valores['genero'],
        'calificacion' => $calificacion,
        'estado' => $estado,
        'fecha_inicio' => $fechas['fecha_inicio'],
        'fecha_finalizacion' => $fechas['fecha_finalizacion'],
        'opinion' => $valores['opinion'],
        'frase_favorita' => $valores['frase_favorita']
    ]);

    responder(201, [
        'estado' => 'correcto',
        'mensaje' => 'Película registrada correctamente',
        'pelicula' => [
            'id' => $id,
            'titulo' => $titulo,
            'director' => $valores['director'],
            'genero' => $valores['genero'],
            'calificacion' => $calificacion,
            'estado' => $estado,
            'fecha_inicio' => $fechas['fecha_inicio'],
            'fecha_finalizacion' => $fechas['fecha_finalizacion'],
            'opinion' => $valores['opinion'],
            'frase_favorita' => $valores['frase_favorita']
        ]
    ]);

} catch (Throwable $error) {
    error_log('Error al crear la película');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible registrar la película'
    ]);
}
