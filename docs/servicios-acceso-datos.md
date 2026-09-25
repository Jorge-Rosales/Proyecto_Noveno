# Servicios de acceso a datos

## Organización

La aplicación separa la presentación de la persistencia mediante cuatro servicios:

| Servicio | Responsabilidad |
|---|---|
| `AuthService` | Login, comprobación de sesión, CSRF y logout. |
| `BookService` | CRUD persistente de libros. |
| `SeriesService` | CRUD persistente de series. |
| `MovieService` | CRUD persistente de películas. |

Todos usan la instancia `api` definida en `src/app/services/api.ts`. Esta instancia apunta a `http://localhost/bitacora-cultural-api` y habilita `withCredentials` para la cookie de sesión.

## Operaciones culturales

| Entidad | Listar | Crear | Actualizar | Eliminar |
|---|---|---|---|---|
| Libros | `listarLibros()` | `crearLibro()` | `actualizarLibro()` | `eliminarLibro()` |
| Series | `listarSeries()` | `crearSerie()` | `actualizarSerie()` | `eliminarSerie()` |
| Películas | `listarPeliculas()` | `crearPelicula()` | `actualizarPelicula()` | `eliminarPelicula()` |

Las consultas GET devuelven arreglos tipados. Antes de POST, PUT o DELETE, el servicio solicita un token mediante `AuthService.obtenerCsrfToken()` y lo envía en `X-CSRF-Token`.

## Mapeo

Cada servicio contiene funciones privadas para transformar los campos de PHP a los modelos TypeScript y para construir el JSON en español que espera el backend. Los identificadores y fechas de auditoría de las respuestas provienen de la persistencia confirmada.

## Manejo del estado

Los servicios ya no mantienen colecciones temporales. Cada página conserva una señal local para renderizar y vuelve a ejecutar la consulta GET después de crear, actualizar o eliminar. Si una operación falla, no se simula un resultado local.

## Sesión y errores

`AuthService` instala un interceptor sobre la instancia compartida. Una respuesta 401 en una operación protegida redirige al Login. Las comprobaciones normales de sesión y el propio login se excluyen de esa redirección automática para que el guard y el formulario administren sus resultados.
