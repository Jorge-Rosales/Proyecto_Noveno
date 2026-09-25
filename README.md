# Bitácora Cultural

Aplicación privada para registrar libros, series y películas. Cada usuario administra su propia bitácora mediante una interfaz Ionic, con datos persistentes en MySQL/MariaDB.

## Tecnologías

- Ionic y Angular
- TypeScript
- Axios
- PHP
- MySQL o MariaDB
- XAMPP
- Git y GitHub

## Arquitectura

```text
Ionic / Angular → Axios → API PHP → MySQL / MariaDB
```

Angular presenta los formularios y las listas. Los servicios usan una instancia compartida de Axios para comunicarse con PHP. La API valida la sesión, CSRF, datos y propiedad de los registros antes de acceder a la base de datos.

## Funcionalidades

- Registro e inicio de sesión.
- Sesión PHP y protección de rutas.
- Cierre de sesión.
- CRUD persistente de libros, series y películas.
- Búsqueda por título y ordenamiento.
- Calificaciones, estados, fechas y notas personales.
- Seguimiento de temporadas y episodios para series.

## Estructura

| Directorio | Contenido |
|---|---|
| `src/` | Aplicación Ionic/Angular, vistas, modelos, guard y servicios. |
| `backend/` | Copia versionada de la API PHP. |
| `database/` | Esquema SQL sin datos personales. |
| `docs/` | Modelo, arquitectura, instalación y documentación académica. |

## Requisitos

- Una versión de Node.js compatible con `package.json`.
- npm.
- Ionic CLI 7 o posterior.
- XAMPP con Apache, PHP y MySQL/MariaDB.

## Instalación

1. Clonar el repositorio y entrar en su directorio.
2. Ejecutar `npm install`.
3. Copiar `backend/bitacora-cultural-api` a `C:\xampp\htdocs\bitacora-cultural-api`.
4. Importar `database/schema.sql` mediante phpMyAdmin o el cliente de MySQL/MariaDB.
5. Iniciar Apache y MySQL desde XAMPP.
6. Ejecutar `ionic serve`.
7. Abrir la URL indicada por Ionic, normalmente `http://localhost:8100`.

La API debe quedar disponible en `http://localhost/bitacora-cultural-api`.

## Base de datos

La base se llama `bitacora_cultural`. El archivo `database/schema.sql` contiene solamente la estructura de `usuarios`, `libros`, `series` y `peliculas`, incluidas sus restricciones y relaciones. No contiene cuentas ni registros culturales.

## Ejecución

```bash
ionic serve
```

## Seguridad

- Contraseñas protegidas con `password_hash` y comprobadas con `password_verify`.
- Sesiones PHP mediante su cookie de sesión.
- Token CSRF en operaciones que modifican datos.
- Consultas preparadas.
- Aislamiento por `usuario_id` en cada operación cultural.
- Guard de Angular y manejo global de respuestas HTTP 401.

## Persistencia

Los registros se guardan en MySQL/MariaDB. Permanecen disponibles después de recargar la aplicación o cerrar sesión y solo se consultan para el usuario autenticado.

Consulta [docs/instalacion.md](docs/instalacion.md) para el procedimiento detallado.
