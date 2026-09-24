# Interfaces TypeScript de Bitácora Cultural

## 1. Objetivo

Las interfaces TypeScript describen la forma de los registros culturales utilizados por las vistas y servicios de Bitácora Cultural. Su finalidad es proporcionar contratos estáticos para Libros, Series y Películas, detectar incompatibilidades durante la compilación y separar los datos administrados por los formularios de los campos generados por los servicios.

La revisión se realizó tomando como referencia `docs/modelo-de-datos.md`, los tres archivos de `src/app/models`, sus servicios en memoria y los componentes `tab1`, `tab2` y `tab3`.

## 2. Resultado general de la revisión

Las interfaces existentes representan correctamente las funcionalidades actuales. No fue necesario modificar los modelos, servicios ni vistas.

Se conservaron estas decisiones:

- Identificadores de tipo `string`.
- Fechas representadas como `string`.
- Calificaciones mediante `number | null`.
- Estados restringidos mediante uniones de cadenas.
- Progreso de series mediante `number | null`.
- Fechas de creación y modificación como propiedades independientes.
- Interfaces independientes para cada tipo cultural.

No se añadió Usuario, `userId`, autenticación ni un modelo cultural genérico.

## 3. Libro

Archivo: `src/app/models/book.model.ts`.

### Tipos existentes

```ts
export type ReadingStatus = 'En progreso' | 'Terminado' | 'Abandonado';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number | null;
  status: ReadingStatus;
  startDate: string;
  finishDate: string;
  opinion: string;
  favoriteQuote: string;
  createdAt: string;
  updatedAt: string;
}
```

| Grupo | Propiedades | Representación |
|---|---|---|
| Identidad | `id` | Cadena única generada por `BookService`. |
| Información principal | `title`, `author`, `genre` | Cadenas; título obligatorio en el formulario. |
| Valoración y estado | `rating`, `status` | Calificación anulable y estado restringido. |
| Fechas de lectura | `startDate`, `finishDate` | Cadenas vacías cuando no se proporcionan. |
| Contenido personal | `opinion`, `favoriteQuote` | Cadenas vacías cuando no se proporcionan. |
| Auditoría | `createdAt`, `updatedAt` | Cadenas ISO 8601 distintas. |

`BookService` recibe actualmente `Omit<Book, 'id' | 'createdAt' | 'updatedAt'>` en sus operaciones de creación y actualización. Este tipo impide que el formulario proporcione identificadores o marcas de tiempo administradas por el servicio.

No se creó un alias `BookDraft`, porque hacerlo no aporta una corrección funcional y requeriría modificar un contrato que ya compila correctamente.

## 4. Serie

Archivo: `src/app/models/series.model.ts`.

### Tipos existentes

```ts
export type SeriesStatus = 'En progreso' | 'Terminado' | 'Abandonado';

export interface SeriesEntry {
  id: string;
  title: string;
  creator: string;
  genre: string;
  rating: number | null;
  status: SeriesStatus;
  totalSeasons: number | null;
  currentSeason: number | null;
  lastEpisode: number | null;
  startDate: string;
  finishDate: string;
  opinion: string;
  favoriteQuote: string;
  createdAt: string;
  updatedAt: string;
}

export type SeriesDraft = Omit<SeriesEntry, 'id' | 'createdAt' | 'updatedAt'>;
```

| Grupo | Propiedades | Representación |
|---|---|---|
| Identidad | `id` | Cadena única generada por `SeriesService`. |
| Información principal | `title`, `creator`, `genre` | Cadenas; título obligatorio en el formulario. |
| Valoración y estado | `rating`, `status` | Calificación anulable y estado restringido. |
| Progreso | `totalSeasons`, `currentSeason`, `lastEpisode` | `number | null`, por lo que la ausencia queda representada sin valores ficticios. |
| Fechas | `startDate`, `finishDate` | Cadenas vacías cuando no existen. |
| Contenido personal | `opinion`, `favoriteQuote` | Cadenas vacías cuando no existen. |
| Auditoría | `createdAt`, `updatedAt` | Cadenas ISO 8601 distintas. |

`SeriesDraft` representa los datos que el formulario puede enviar a `SeriesService`. Las reglas de enteros positivos, temporada actual no superior al total y episodio acompañado de temporada pertenecen a los validadores; la interfaz conserva únicamente la forma de los datos.

## 5. Película

Archivo: `src/app/models/movie.model.ts`.

### Tipos existentes

```ts
export type MovieStatus = 'En progreso' | 'Terminado' | 'Abandonado';

export interface MovieEntry {
  id: string;
  title: string;
  director: string;
  genre: string;
  rating: number | null;
  status: MovieStatus;
  startDate: string;
  finishDate: string;
  opinion: string;
  favoriteQuote: string;
  createdAt: string;
  updatedAt: string;
}

export type MovieDraft = Omit<MovieEntry, 'id' | 'createdAt' | 'updatedAt'>;
```

| Grupo | Propiedades | Representación |
|---|---|---|
| Identidad | `id` | Cadena única generada por `MovieService`. |
| Información principal | `title`, `director`, `genre` | Cadenas; título obligatorio en el formulario. |
| Valoración y estado | `rating`, `status` | Calificación anulable y estado restringido. |
| Fechas | `startDate`, `finishDate` | Cadenas vacías cuando no existen. |
| Contenido personal | `opinion`, `favoriteQuote` | Cadenas vacías cuando no existen. |
| Auditoría | `createdAt`, `updatedAt` | Cadenas ISO 8601 distintas. |

`MovieDraft` se utiliza tanto al crear como al actualizar. El servicio conserva `id` y `createdAt` durante una edición y genera un nuevo `updatedAt`.

## 6. Representación de campos opcionales

Las interfaces no utilizan propiedades opcionales con `?`. Cada registro completo siempre contiene todas sus propiedades, lo cual evita comprobaciones por propiedades inexistentes en las vistas.

La ausencia se representa de esta forma:

| Categoría | Representación actual |
|---|---|
| Calificación | `null`. |
| Total de temporadas | `null`. |
| Temporada actual | `null`. |
| Último episodio | `null`. |
| Autor, creador, director y género | Cadena vacía. |
| Fechas de consumo | Cadena vacía. |
| Opinión y frase favorita | Cadena vacía. |

Esta convención coincide con los formularios reactivos actuales. Cambiar los textos y fechas a `string | null` exigiría modificar formularios, plantillas y servicios sin resolver un problema presente, por lo que se conservaron como `string`.

## 7. Compatibilidad con las reglas del modelo

| Regla | Soporte de tipos | Validación complementaria |
|---|---|---|
| Título obligatorio | `title` es una propiedad `string` requerida. | Los formularios rechazan cadenas vacías o compuestas solamente por espacios. |
| Calificación opcional | `number | null`. | El formulario limita el valor a enteros entre 1 y 5. |
| Estados permitidos | Uniones de cadenas específicas. | Los selectores muestran únicamente los tres valores permitidos. |
| Fechas opcionales | `string`, con cadena vacía para ausencia. | Los formularios comparan inicio y finalización. |
| Progreso opcional de series | `number | null`. | Los validadores comprueban enteros positivos y coherencia del progreso. |
| Fechas de auditoría | `createdAt` y `updatedAt` son propiedades separadas. | Los servicios asignan y actualizan sus valores. |

TypeScript valida la estructura durante el desarrollo, pero no valida datos recibidos en tiempo de ejecución. La futura API PHP deberá aplicar nuevamente todas las reglas.

## 8. Relación con las vistas

- `Tab1Page` importa `Book` y `ReadingStatus`. Usa `Book` para la selección, edición, detalles y eliminación; `ReadingStatus` tipa el control de estado.
- `Tab2Page` importa `SeriesEntry`, `SeriesDraft` y `SeriesStatus`. El formulario construye un `SeriesDraft`, mientras que las tarjetas y detalles consumen `SeriesEntry`.
- `Tab3Page` importa `MovieEntry`, `MovieDraft` y `MovieStatus`. El formulario construye un `MovieDraft`, y el historial trabaja con registros completos.

Las propiedades de los modelos coinciden con los nombres de los controles reactivos y con las expresiones utilizadas en las plantillas. No se detectaron conversiones incompatibles ni importaciones rotas.

## 9. Relación con los servicios Angular

| Servicio | Colección interna | Entrada para crear o editar | Salida al crear |
|---|---|---|---|
| `BookService` | `signal<Book[]>([])` | `Omit<Book, 'id' | 'createdAt' | 'updatedAt'>` | `Book` |
| `SeriesService` | `signal<SeriesEntry[]>([])` | `SeriesDraft` | `SeriesEntry` |
| `MovieService` | `signal<MovieEntry[]>([])` | `MovieDraft` | `MovieEntry` |

Los servicios generan identificadores `string`, asignan fechas ISO 8601 y exponen las colecciones como señales de solo lectura. Las interfaces son compatibles con altas, consultas, ediciones y eliminaciones en memoria.

## 10. Tipos compartidos evaluados

Los tres modelos repiten campos y los tres tipos de estado contienen los mismos valores. Sería posible crear en el futuro tipos como `CulturalStatus`, `Rating` o una interfaz base para marcas de tiempo.

No se realizó esa refactorización porque:

- La aplicación es pequeña y los contratos actuales son claros.
- Los modelos contienen diferencias propias de cada medio.
- No existe un error que la abstracción deba corregir.
- Cambiar importaciones en componentes y servicios incrementaría el alcance del entregable.
- Una calificación limitada a 1–5 requiere validación en tiempo de ejecución aunque se exprese mediante una unión numérica.

Las interfaces independientes se conservaron tal como solicitó el modelo conceptual.

## 11. Usuario y autenticación

No existe una interfaz pública de Usuario. Tampoco existen `userId`, hashes, tokens ni datos de autenticación en los registros culturales.

La interfaz pública futura deberá definirse después de diseñar el contrato de la API. No deberá incluir `passwordHash`. La relación entre usuario y registros se resolverá mediante autenticación y autorización en el backend, sin asignar propietarios ficticios en Angular.

## 12. Diferencias con el futuro modelo MySQL

| Interfaces Angular actuales | Modelo futuro de MySQL y API |
|---|---|
| Identificadores `string` generados en el navegador. | La estrategia de identificadores deberá acordarse con el backend; puede conservar UUID. |
| Fechas de formulario como cadenas `AAAA-MM-DD`. | Columnas `DATE NULL` y serialización definida por la API. |
| Marcas de tiempo como cadenas ISO 8601. | Columnas `DATETIME` o `TIMESTAMP` administradas por el servidor. |
| Textos opcionales como cadenas vacías. | Preferentemente `NULL` cuando el dato no existe. |
| Estados restringidos solo por TypeScript y formularios. | Restricciones y validación obligatoria en PHP y MySQL. |
| Colecciones independientes sin propietario. | Registros relacionados con un usuario mediante una clave foránea. |
| Tipos `Draft` internos de la aplicación. | DTO de solicitudes y respuestas definidos por el contrato HTTP. |

Las interfaces actuales no deben considerarse automáticamente iguales a las filas de base de datos. La API será responsable de convertir nombres, fechas, valores nulos y respuestas JSON.

## 13. Modificaciones realizadas

No se modificó ninguna interfaz, servicio, vista, ruta o configuración. Se creó únicamente este documento.

Se conservaron sin cambios:

- `Book` y `ReadingStatus`.
- `SeriesEntry`, `SeriesDraft` y `SeriesStatus`.
- `MovieEntry`, `MovieDraft` y `MovieStatus`.
- Los identificadores `string`.
- Las representaciones actuales de fechas y campos opcionales.

## 14. Verificación real

Fecha de la revisión: 23 de septiembre de 2026.

### Compilación

El comando solicitado `npm run build` no pudo iniciarse porque NVM bloqueó el ejecutable delegado de npm con el código `NVM4306`. NVM indicó que el script no era confiable y sugirió ejecutar `nvm reshim` o `nvm doctor --autofix`. No se modificó la instalación del sistema durante este entregable.

Se ejecutó la compilación equivalente directamente mediante Angular CLI:

```text
node node_modules/@angular/cli/bin/ng.js build
```

Resultado: **compilación correcta**, sin errores TypeScript, TS2307 ni errores de importación entre modelos, servicios y componentes.

La compilación mantuvo advertencias no bloqueantes por el presupuesto recomendado de estilos:

- `tab1.page.scss`: 3.97 kB frente al presupuesto recomendado de 2 kB.
- `tab2.page.scss`: 4.00 kB frente al presupuesto recomendado de 2 kB.
- `tab3.page.scss`: 3.92 kB frente al presupuesto recomendado de 2 kB.

No se aumentaron ni modificaron los presupuestos de Angular.

### Análisis estático

Se ejecutó:

```text
node node_modules/@angular/cli/bin/ng.js lint
```

Resultado: **todos los archivos superaron el lint**.

## 15. Trabajo pendiente

1. Definir el contrato de la API PHP y sus DTO.
2. Decidir la representación definitiva de identificadores en MySQL.
3. Definir la interfaz pública de Usuario después del contrato de autenticación.
4. Añadir propiedad de registros por usuario únicamente cuando exista autenticación real.
5. Definir la conversión entre cadenas vacías de Angular y `NULL` de MySQL.
6. Validar en PHP títulos, calificaciones, estados, fechas y progreso.
7. Sustituir los servicios en memoria por comunicación HTTP después de probar la API con Postman.
