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

// Este endpoint utiliza PUT porque recibe todos los campos
// editables del libro.
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

// La identidad del usuario se obtiene de la sesión PHP.
$usuarioId = obtenerUsuarioAutenticado();

// Toda actualización debe incluir un token CSRF válido.
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

if (
    !is_array($datos)
    || array_is_list($datos)
) {
    responder(400, [
        'estado' => 'error',
        'mensaje' => 'Se esperaba un objeto JSON'
    ]);
}

// Identificador del libro que se desea editar.
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
        'mensaje' => 'El identificador del libro no es válido'
    ]);
}

// El título es obligatorio.
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

// Validación de campos opcionales de texto.
$valores = [];

foreach (['autor' => 255, 'genero' => 100] as $campo => $maximo) {
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

// Calificación opcional: número entero del 1 al 5.
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

// Estado permitido.
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
        'mensaje' => 'El estado del libro no es válido'
    ]);
}

// Fechas opcionales.
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

    // Comprobar que el libro existe Y pertenece al usuario
    // autenticado. No basta con conocer el ID del libro.
    $consultaLibro = $conexion->prepare(
        'SELECT id
         FROM libros
         WHERE id = :id
           AND usuario_id = :usuario_id
         LIMIT 1'
    );

    $consultaLibro->execute([
        'id' => $id,
        'usuario_id' => $usuarioId
    ]);

    if (!$consultaLibro->fetch()) {
        responder(404, [
            'estado' => 'error',
            'mensaje' => 'Libro no encontrado'
        ]);
    }

    // Se actualizan únicamente los campos editables.
    // El id, usuario_id y fecha_creacion no se modifican.
    $consulta = $conexion->prepare(
        'UPDATE libros
         SET
            titulo = :titulo,
            autor = :autor,
            genero = :genero,
            calificacion = :calificacion,
            estado = :estado,
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
        'autor' => $valores['autor'],
        'genero' => $valores['genero'],
        'calificacion' => $calificacion,
        'estado' => $estado,
        'fecha_inicio' => $fechas['fecha_inicio'],
        'fecha_finalizacion' => $fechas['fecha_finalizacion'],
        'opinion' => $valores['opinion'],
        'frase_favorita' => $valores['frase_favorita']
    ]);

    // Recuperar la versión guardada, incluidas las fechas.
    $consultaActualizada = $conexion->prepare(
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
         WHERE id = :id
           AND usuario_id = :usuario_id
         LIMIT 1'
    );

    $consultaActualizada->execute([
        'id' => $id,
        'usuario_id' => $usuarioId
    ]);

    $libro = $consultaActualizada->fetch();

    responder(200, [
        'estado' => 'correcto',
        'mensaje' => 'Libro actualizado correctamente',
        'libro' => $libro
    ]);

} catch (PDOException $error) {
    error_log('Error de base de datos al actualizar el libro');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible actualizar el libro'
    ]);

} catch (Throwable $error) {
    error_log('Error interno al actualizar el libro');

    responder(500, [
        'estado' => 'error',
        'mensaje' => 'No fue posible actualizar el libro'
    ]);
}
