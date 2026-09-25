# Interfaces TypeScript

## Objetivo

Las interfaces de `src/app/models` tipan los datos que muestran los componentes y devuelven los servicios Angular. No representan directamente las filas SQL: cada servicio realiza el mapeo entre nombres TypeScript y nombres PHP.

## Libro

`Book` incluye `id`, `title`, `author`, `genre`, `rating`, `status`, `startDate`, `finishDate`, `opinion`, `favoriteQuote`, `createdAt` y `updatedAt`. Los campos de texto opcionales se presentan como cadena vacía y `rating` usa `number | null`.

## Serie

`SeriesEntry` añade `creator`, `totalSeasons`, `currentSeason` y `lastEpisode`. Los valores de progreso opcionales usan `number | null`. `SeriesDraft` excluye `id`, `createdAt` y `updatedAt` para las operaciones de creación.

## Película

`MovieEntry` usa `director` y los campos culturales compartidos. `MovieDraft` excluye los datos administrados por el backend.

## Estados

`ReadingStatus`, `SeriesStatus` y `MovieStatus` limitan el valor a:

```text
En progreso | Terminado | Abandonado
```

## Relación con la API

Los servicios convierten, por ejemplo, `title` a `titulo`, `rating` a `calificacion` y `createdAt` a `fecha_creacion`. Los valores opcionales vacíos se envían como `null` cuando corresponde.

No se expone `usuario_id` en estos modelos. La API determina la propiedad con la sesión PHP, lo cual evita confiar en un identificador proporcionado por el navegador.
