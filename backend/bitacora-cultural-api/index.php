<?php

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'mensaje' => 'API de Bitácora Cultural funcionando',
    'estado' => 'correcto'
], JSON_UNESCAPED_UNICODE);
