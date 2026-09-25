# Modelo de datos de Bitácora Cultural

## Estado actual

Bitácora Cultural usa una API PHP y una base MySQL/MariaDB persistente. El esquema real se encuentra en `database/schema.sql` y contiene cuatro entidades: Usuario, Libro, Serie y Película.

## Entidades

### Usuario

| Campo SQL | Tipo | Regla |
|---|---|---|
| `id` | `CHAR(36)` | Clave primaria. |
| `email` | `VARCHAR(254)` | Obligatorio y único. |
| `password_hash` | `VARCHAR(255)` | Hash exclusivo del backend. |
| `created_at` | `DATETIME` | Fecha de creación. |

La contraseña original no se almacena. PHP usa `password_hash` y `password_verify`.

### Libro

Contiene título, autor, género, calificación, estado, fechas de lectura, opinión, frase favorita y fechas de auditoría. `usuario_id` vincula el registro con su propietario.

### Serie

Además de los datos culturales comunes, contiene creador, total de temporadas, temporada actual y último episodio. Las restricciones SQL validan valores positivos y la coherencia del progreso.

### Película

Contiene título, director, género, calificación, estado, fechas de visualización, opinión, frase favorita y fechas de auditoría.

## Reglas compartidas

- Los títulos son obligatorios.
- La calificación es nula o está entre 1 y 5.
- Los estados permitidos son `En progreso`, `Terminado` y `Abandonado`.
- La fecha final no puede ser anterior a la inicial.
- Los identificadores culturales son UUID generados en el backend.
- PHP valida cada solicitud aunque el formulario Angular ya la haya validado.
- Cada consulta cultural se limita al `usuario_id` obtenido de la sesión.

## Correspondencia con TypeScript

Los modelos `Book`, `SeriesEntry` y `MovieEntry` usan nombres en inglés para la interfaz. Los servicios transforman esos objetos a los nombres en español de la API y convierten valores SQL `NULL` en cadenas vacías o `null`, según el tipo del modelo.

`usuario_id` no forma parte de los modelos culturales enviados por Angular. El backend lo obtiene de la sesión para impedir que el cliente elija al propietario de un registro.

## Persistencia

MySQL/MariaDB conserva los datos entre recargas y sesiones. Las marcas `fecha_creacion` y `fecha_actualizacion` son administradas por la base de datos y se devuelven al frontend como `createdAt` y `updatedAt`.
