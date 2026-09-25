<?php

declare(strict_types=1);

function obtenerConexion(): PDO
{
    $servidor = '127.0.0.1';
    $puerto = '3306';
    $baseDeDatos = 'bitacora_cultural';

    // Datos habituales de una instalación local de XAMPP.
    // Ajusta estos valores si configuraste otras credenciales.
    $usuario = 'root';
    $contrasena = '';

    $dsn = "mysql:host={$servidor};port={$puerto};dbname={$baseDeDatos};charset=utf8mb4";

    return new PDO(
        $dsn,
        $usuario,
        $contrasena,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
}