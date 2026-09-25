# Arquitectura de Bitácora Cultural

## Vista general

```text
Ionic / Angular
       ↓
     Axios
       ↓
    API PHP
       ↓
MySQL / MariaDB
```

## Frontend

El código de `src/app` contiene las páginas de Login, Libros, Series y Películas. Los formularios reactivos validan la entrada y los componentes mantienen el estado visual de cada lista. `authGuard` comprueba la sesión antes de permitir el acceso a las páginas culturales.

Los servicios `AuthService`, `BookService`, `SeriesService` y `MovieService` separan la interfaz de la comunicación HTTP. Todos usan la instancia Axios de `services/api.ts`, configurada con `withCredentials: true`.

## Backend

La API de `backend/bitacora-cultural-api` expone autenticación, sesión, CSRF y endpoints CRUD. PHP vuelve a validar los datos, utiliza consultas preparadas y obtiene el usuario desde la sesión. El backend activo debe copiarse a `C:\xampp\htdocs\bitacora-cultural-api`.

## Base de datos

`database/schema.sql` crea la base `bitacora_cultural` y las tablas `usuarios`, `libros`, `series` y `peliculas`. Cada tabla cultural incluye `usuario_id` como clave foránea hacia `usuarios.id`.

## Sesión y CSRF

Después del login, PHP conserva la identidad en la sesión. Axios envía la cookie automáticamente. Las operaciones POST, PUT y DELETE protegidas obtienen un token desde `/csrf-token.php` y lo envían en `X-CSRF-Token`. Un interceptor redirige a Login cuando una operación protegida devuelve 401.

## CRUD

Cada servicio cultural implementa cuatro operaciones asíncronas: listar, crear, actualizar y eliminar. Los componentes esperan la respuesta y vuelven a consultar la lista después de cada modificación, de modo que la interfaz refleja el estado confirmado por MySQL.
