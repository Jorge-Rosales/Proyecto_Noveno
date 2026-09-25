# Uso de inteligencia artificial en Bitácora Cultural

## Objetivo

La inteligencia artificial se utilizó como apoyo durante el diseño, implementación, revisión y documentación de Bitácora Cultural. Su función fue ayudar a analizar requisitos, proponer código, detectar inconsistencias y preparar comprobaciones reproducibles.

## Herramienta utilizada

Se utilizó **Codex** como asistente de programación. Codex inspeccionó el proyecto existente antes de proponer cambios y trabajó sobre la arquitectura Ionic/Angular, Axios, PHP y MySQL/MariaDB elegida para la actividad.

## Trabajo apoyado por IA

La asistencia incluyó:

- diseño inicial de las vistas y modelos culturales;
- generación y revisión de interfaces TypeScript;
- organización de servicios Angular;
- integración de Axios con la API PHP;
- mapeo entre campos TypeScript y JSON en español;
- diseño y revisión de endpoints CRUD;
- autenticación, sesión, CSRF, guard y logout;
- depuración de compilación y pruebas;
- revisión de medidas de seguridad;
- diagramas y documentación técnica.

## Revisión humana

Las sugerencias no se aceptaron automáticamente. Se compararon con el código real, los requisitos de cada paso y los resultados de compilación, lint y pruebas. El estudiante conserva la responsabilidad de revisar la interfaz, administrar su entorno XAMPP, validar los resultados académicos y decidir qué cambios incorpora mediante control de versiones.

## Pruebas y evidencia

Se realizaron compilaciones y pruebas automatizadas durante el desarrollo. Las pruebas unitarias actuales usan mocks y spies para no ejecutar solicitudes HTTP reales. La persistencia se verificó durante la integración de los CRUD con PHP/MySQL y la arquitectura conserva una copia versionada del backend y del esquema.

Las comprobaciones visuales o manuales solo deben declararse cuando se ejecuten expresamente. Los resultados concretos de la limpieza final se reportan al terminar este paso y no se anticipan en este documento.

## Seguridad y limitaciones

La IA ayudó a revisar el uso de `password_hash` y `password_verify`, sesiones PHP, CSRF, consultas preparadas y aislamiento por `usuario_id`. No se incluyeron contraseñas, cookies ni tokens en la documentación. La revisión humana sigue siendo necesaria para configuración de despliegue, credenciales del entorno y pruebas de aceptación.

## Conclusión

Codex permitió acelerar tareas de análisis, implementación y documentación manteniendo evidencia verificable. El estudiante mantuvo la responsabilidad sobre la validación, la ejecución de pruebas, el control de versiones y la aceptación final del proyecto.
