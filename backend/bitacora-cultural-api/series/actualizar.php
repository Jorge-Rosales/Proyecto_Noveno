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

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    header('Allow: PUT');

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

foreach (['creador' => 255, 'genero' => 100] as $campo => $maximo) {
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

$estado = $datos['estado'] ?? null;

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
        'mensaje' => 'El estado de la serie no es válido'
    ]);
}

$progreso = [];

foreach (
    ['total_temporadas', 'temporada_actual', 'ultimo_episodio']
    as $campo
) {
    $valor = $datos[$campo] ?? null;

    if (
        $valor !== null
        && (
            !is_int($valor)
            || $valor < 1
            || $valor > 65535
        )
    ) {
        responder(422, [
            'estado' => 'error',
            'mensaje' => "El campo {$campo} debe ser un entero positivo entre 1 y 65535"
        ]);
    }

    $progreso[$campo] = $valor;
}

if (
    $progreso['temporada_actual'] !== null
    && $progreso['total_temporadas'] !== null
    && $progreso['temporada_actual'] > $progreso['total_temporadas']
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'La temporada actual no puede superar el total de temporadas'
    ]);
}

if (
    $progreso['ultimo_episodio'] !== null
    && $progreso['temporada_actual'] === null
) {
    responder(422, [
        'estado' => 'error',
        'mensaje' => 'Debes indicar una temporada actual para registrar un episodio'
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

    $consultaSerie = $conexion->prepare(
        'SELECT id
         FROM series
         WHERE id = :id
           AND usuario_id = :usuario_id
         LIMIT 1'
    );

    $consultaSerie->execute([
        'id' => $id,
        'usuario_id' => $usuarioId
    ]);

    if (!$consultaSerie->fetch()) {
        responder(404, [
            'estado' => 'error',
            'mensaje' => 'Serie no encontrada'
        ]);
    }

    $consulta = $conexion->prepare(
        'UPDATE series
         SET
            titulo = :titulo,
            creador = :creador,
            genero = :genero,
            calificacion = :calificacion,
            estado = :estado,
            total_temporadas = :total_temporadas,
            temporada_actual = :temporada_actual,
            ultimo_episodio = :ultimo_episodio,
            fecha_inicio = :fecha_inicio,
            fecha_finalizacion = :fecha_finalizacion,
            opinion = :opinion,
            frase_favorita = :frase_favorita,
            fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = :id
           AND usuario_id = :usuario_id'
    );

    $consulta->execute([
        'id' => $id,
        'usuario_id' => $usuarioId,
        'titulo' => $titulo,
        'creador' => $valores['creador'],
        'genero' => $valores['genero'],
        'calificacion' => $calificacion,
        'estado' => $estado,
        'total_temporadas' => $progreso['total_temporadas'],
        'temporada_actual' => $progreso['temporada_actual'],
        'ultimo_episodio' => $progreso['ultimo_episodio'],
        'fecha_inicio' => $fechas['fecha_inicio'],
        'fecha_finalizacion' => $fechas['fecha_finalizacion'],
        'opinion' => $valores['opinion'],
        'frase_favorita' => $valores['frase_favorita']
    ]);

    $consultaActualizada = $conexion->prepare(
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
         WHERE id = :id
           AND usuario_id = :usuario_id
         LIMIT 1'
    );

    $consultaActualizada->execute([
        'id' => $id,
        'usuario_id' => $usuarioId
    ]);

    $serie = $consultaActualizada->fetch();

    responder(200, [
        'estado' => 'correcto',
        'mensaje' => 'Serie actualizada correctamente',
        'serie' => $serie
    ]);

} catch (PDOException $error) {
    error_log('Error de base de datos al actualizar la serie');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible actualizar la serie'
    ]);

} catch (Throwable $error) {
    error_log('Error interno al actualizar la serie');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible actualizar la serie'
    ]);
}
