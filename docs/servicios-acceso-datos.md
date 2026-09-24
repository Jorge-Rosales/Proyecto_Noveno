# Servicios de acceso a datos de Bitácora Cultural

## 1. Objetivo de la capa de acceso a datos

La capa de acceso a datos permite que las vistas de Libros, Series y Películas consulten y modifiquen registros sin administrar directamente las colecciones internas. En la versión actual, esta capa está formada por servicios Angular con almacenamiento temporal en memoria.

La organización comprobada es:

```text
Modelos TypeScript → describen la forma de los datos
Servicios Angular  → conservan las colecciones y ejecutan operaciones CRUD
Componentes        → presentan datos, validan formularios y solicitan operaciones
```

Esta implementación es temporal. Posteriormente los servicios podrán sustituir sus operaciones en memoria por solicitudes hacia una API PHP conectada a MySQL o MariaDB.

## 2. Servicios revisados

| Servicio | Archivo | Modelo principal | Alcance |
|---|---|---|---|
| `BookService` | `src/app/services/book.service.ts` | `Book` | Registros de libros. |
| `SeriesService` | `src/app/services/series.service.ts` | `SeriesEntry` y `SeriesDraft` | Registros de series y su progreso. |
| `MovieService` | `src/app/services/movie.service.ts` | `MovieEntry` y `MovieDraft` | Registros de películas. |

Los tres servicios usan `providedIn: 'root'`, por lo que Angular mantiene una instancia de cada uno durante la ejecución normal de la aplicación.

`PhotoService` también existe en el proyecto, pero pertenece a la plantilla original de galería y no forma parte del acceso a datos culturales documentado en este entregable.

## 3. BookService

### Colección

```ts
private readonly bookList = signal<Book[]>([]);
readonly books = this.bookList.asReadonly();
```

`bookList` es privada y comienza vacía. Los componentes únicamente reciben `books`, una señal de solo lectura. No pueden llamar `set` o `update` sobre la colección interna.

### API pública

| Miembro | Entrada | Salida | Operación |
|---|---|---|---|
| `books` | Ninguna | Señal de solo lectura con `Book[]` | Consulta de la colección. |
| `addBook` | Datos de `Book` sin `id`, `createdAt` ni `updatedAt` | `Book` creado | Crear. |
| `updateBook` | `id` y cambios del libro | `void` | Actualizar el registro seleccionado. |
| `deleteBook` | `id` | `void` | Eliminar el registro seleccionado. |

Al crear, el servicio añade el registro al principio de la colección. Al actualizar, usa `map` y conserva intactos los libros cuyo identificador no coincide. Al eliminar, usa `filter` para retirar únicamente el identificador recibido.

## 4. SeriesService

### Colección

```ts
private readonly seriesList = signal<SeriesEntry[]>([]);
readonly series = this.seriesList.asReadonly();
```

La colección es privada y la señal pública es de solo lectura.

### API pública

| Miembro | Entrada | Salida | Operación |
|---|---|---|---|
| `series` | Ninguna | Señal de solo lectura con `SeriesEntry[]` | Consulta de la colección. |
| `addSeries` | `SeriesDraft` | `SeriesEntry` creado | Crear. |
| `updateSeries` | `id` y `SeriesDraft` | `void` | Actualizar la serie seleccionada. |
| `deleteSeries` | `id` | `void` | Eliminar la serie seleccionada. |

`SeriesDraft` incluye los datos comunes y `totalSeasons`, `currentSeason` y `lastEpisode`, pero excluye los campos administrados por el servicio. La actualización reemplaza solamente los datos del registro coincidente y conserva su identificador y fecha de creación.

## 5. MovieService

### Colección

```ts
private readonly movieList = signal<MovieEntry[]>([]);
readonly movies = this.movieList.asReadonly();
```

La colección comienza vacía y solo puede modificarse mediante los métodos del servicio.

### API pública

| Miembro | Entrada | Salida | Operación |
|---|---|---|---|
| `movies` | Ninguna | Señal de solo lectura con `MovieEntry[]` | Consulta de la colección. |
| `addMovie` | `MovieDraft` | `MovieEntry` creado | Crear. |
| `updateMovie` | `id` y `MovieDraft` | `void` | Actualizar la película seleccionada. |
| `deleteMovie` | `id` | `void` | Eliminar la película seleccionada. |

Este servicio no comparte estado con Libros o Series. Sus operaciones actúan exclusivamente sobre `movieList`.

## 6. Operaciones disponibles

| Operación | Libros | Series | Películas |
|---|---:|---:|---:|
| Crear | Sí | Sí | Sí |
| Consultar colección | Sí, mediante señal | Sí, mediante señal | Sí, mediante señal |
| Consultar un registro por identificador | Sin método específico | Sin método específico | Sin método específico |
| Actualizar por identificador | Sí | Sí | Sí |
| Eliminar por identificador | Sí | Sí | Sí |

No se añadió un método público `getById`. Las vistas actuales obtienen el registro seleccionado de la colección ya expuesta y lo entregan directamente a las acciones de detalles, edición y eliminación. Un método adicional duplicaría esa operación sin un consumidor real.

Si se intenta actualizar un identificador inexistente, `map` conserva la colección sin cambios. Si se intenta eliminar un identificador inexistente, `filter` también conserva la colección.

## 7. Flujo entre componentes y servicios

### Consulta

Cada componente expone la señal de su servicio:

```text
Tab1Page → BookService.books
Tab2Page → SeriesService.series
Tab3Page → MovieService.movies
```

Las listas filtradas y ordenadas se calculan en los componentes sin modificar la colección original. La búsqueda y el ordenamiento son responsabilidades de presentación en esta versión.

### Creación y edición

1. El formulario reactivo valida la entrada.
2. El componente normaliza textos y valores opcionales.
3. El componente crea el objeto de entrada correspondiente.
4. El servicio genera el identificador y las marcas de tiempo al crear.
5. Al editar, el servicio localiza el registro por identificador y actualiza solo ese elemento.
6. La señal notifica automáticamente a la interfaz.

### Eliminación

1. El componente presenta una confirmación de Ionic.
2. Solo después de confirmar invoca el método `delete` correspondiente.
3. El servicio filtra exclusivamente el registro con el identificador indicado.

Los componentes nunca reciben acceso a las señales privadas modificables.

## 8. Identificadores

Los tres servicios usan la misma estrategia:

```ts
globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
```

Cuando `crypto.randomUUID()` está disponible, genera un UUID. El segundo mecanismo es una compatibilidad temporal para entornos que no dispongan de esa función.

Las pruebas crean registros consecutivos y comprueban que sus identificadores son diferentes. La estrategia futura deberá coordinarse con PHP y MySQL para decidir si los UUID se conservan o si el servidor asignará otro tipo de identificador.

## 9. Fechas de creación y modificación

Al crear un registro, cada servicio obtiene una única fecha ISO 8601:

```ts
const now = new Date().toISOString();
```

Ese valor se asigna tanto a `createdAt` como a `updatedAt`. Al actualizar:

- `createdAt` permanece sin cambios.
- `updatedAt` recibe un nuevo valor ISO 8601.
- `id` permanece sin cambios.

Las pruebas comprueban que la fecha inicial puede analizarse como fecha válida y que, al crear, `createdAt` y `updatedAt` coinciden.

## 10. Validaciones y consistencia

### Responsabilidad de los formularios

Los componentes validan:

- Título obligatorio y distinto de espacios.
- Calificación entera entre 1 y 5 cuando existe.
- Orden correcto de las fechas.
- Progreso numérico positivo de Series.
- Temporada actual no superior al total.
- Episodio acompañado de una temporada actual.

### Responsabilidad de los servicios

Los servicios administran:

- Generación del identificador.
- Generación de `createdAt` y `updatedAt`.
- Inserción en la colección correcta.
- Actualización por coincidencia exacta del identificador.
- Eliminación por coincidencia exacta del identificador.
- Conservación de los demás registros.
- Separación entre las tres colecciones culturales.

Los servicios reciben tipos compatibles con los modelos, pero no reemplazan la validación de formularios. Cuando exista la API, PHP deberá validar nuevamente todo dato recibido porque los tipos TypeScript no existen en tiempo de ejecución ni protegen al servidor.

## 11. Almacenamiento temporal

Las colecciones viven únicamente en la memoria del proceso de la aplicación:

- Comienzan vacías.
- Permanecen disponibles mientras se conserva la instancia del servicio.
- Actualizan las vistas de forma reactiva mediante señales.
- Pueden perderse al recargar completamente la aplicación.
- No se comparten con un servidor.
- No están asociadas con usuarios.

No se utiliza `localStorage`, `sessionStorage`, IndexedDB, SQLite, archivos JSON ni servicios HTTP ficticios.

## 12. Acceso actual frente a la futura API

| Aspecto | Servicios actuales | API PHP y MySQL futura |
|---|---|---|
| Fuente de datos | Señales en memoria. | Tablas persistentes. |
| Duración | Sesión actual de la aplicación. | Persistencia entre sesiones. |
| Operaciones | Métodos síncronos sobre arreglos. | Solicitudes HTTP GET, POST, PUT o PATCH y DELETE. |
| Identificadores | Generados en el navegador. | Estrategia coordinada con el servidor. |
| Fechas de auditoría | Generadas en el navegador. | Generadas o validadas por el backend. |
| Validación | Formularios y tipos TypeScript. | Validación obligatoria en PHP y restricciones de base de datos. |
| Propiedad | Sin usuarios. | Registros vinculados al usuario autenticado. |
| Errores | No existen fallos de red. | Estados de carga, errores HTTP y respuestas del servidor. |
| Consulta individual | El componente usa la colección cargada. | Podrá existir un endpoint de detalle si el flujo lo requiere. |

La interfaz puede conservar la separación actual: los componentes seguirán llamando a servicios, mientras la implementación interna cambiará a comunicación HTTP. Los contratos concretos se definirán después de probar los endpoints mediante Postman.

## 13. Modificaciones realizadas

No fue necesario modificar `BookService`, `SeriesService`, `MovieService`, los modelos ni las vistas.

Se realizaron únicamente estos cambios relacionados con la verificación:

- Se creó `src/app/services/book.service.spec.ts`.
- Se ampliaron `series.service.spec.ts` y `movie.service.spec.ts`.
- Se añadieron comprobaciones de identificadores diferentes y fechas iniciales válidas.
- Se documentó la capa en este archivo.

No se añadieron métodos de acceso sin un consumidor actual ni se introdujeron abstracciones adicionales.

## 14. Verificación técnica real

Fecha de revisión: 23 de septiembre de 2026.

### Compilación

`npm run build` no pudo iniciar porque NVM bloqueó el ejecutable delegado de npm con el código `NVM4306`. El mensaje indicó que el script no era confiable y sugirió `nvm reshim` o `nvm doctor --autofix`. No se modificó Node.js, npm ni NVM.

Se ejecutó la alternativa equivalente permitida por el enunciado:

```text
node node_modules/@angular/cli/bin/ng.js build
```

Resultado: **compilación correcta**, sin errores de importación, modelos, servicios o componentes.

Advertencias no bloqueantes de estilos:

- `tab1.page.scss`: 3.97 kB frente al presupuesto recomendado de 2 kB.
- `tab2.page.scss`: 4.00 kB frente al presupuesto recomendado de 2 kB.
- `tab3.page.scss`: 3.92 kB frente al presupuesto recomendado de 2 kB.

No se modificaron los presupuestos de Angular.

### Lint

```text
node node_modules/@angular/cli/bin/ng.js lint
```

Resultado: **todos los archivos superaron el lint**.

### Pruebas automatizadas

La ejecución normal de ChromeHeadless requiere desactivar la aceleración GPU en este entorno. Se utilizó un lanzador temporal con `--disable-gpu`, `--disable-software-rasterizer` y `--no-sandbox`; la configuración temporal se eliminó después de ejecutar las pruebas.

Resultado: **21 de 21 pruebas superadas**.

Las pruebas de servicios verifican:

- Creación de registros.
- Identificadores distintos.
- Fechas iniciales válidas.
- Actualización únicamente del registro seleccionado.
- Eliminación únicamente del registro seleccionado.
- Conservación de los demás registros.

### Accesibilidad de rutas

Con el servidor de desarrollo iniciado, se obtuvieron estos resultados:

| Ruta | Resultado |
|---|---:|
| `/login` | HTTP 200 |
| `/tabs/tab1` | HTTP 200 |
| `/tabs/tab2` | HTTP 200 |
| `/tabs/tab3` | HTTP 200 |

## 15. Uso de inteligencia artificial

La IA se utilizó para inspeccionar los modelos, servicios, consumidores y pruebas; identificar las operaciones disponibles; comprobar la separación de responsabilidades; evaluar si era necesario añadir una consulta individual; ampliar las pruebas de consistencia; ejecutar verificaciones; y redactar este documento.

Se conservó la implementación de los tres servicios porque ya satisface las necesidades actuales. Se descartó añadir métodos o abstracciones sin un uso concreto y no se modificaron modelos, vistas, autenticación ni persistencia.

## 16. Limitaciones y trabajo pendiente

1. Los registros se pierden al recargar la aplicación.
2. No existe consulta, persistencia ni sincronización con un servidor.
3. No existen estados de carga ni manejo de errores HTTP.
4. Las fechas e identificadores se generan todavía en el navegador.
5. Los registros no pertenecen a usuarios autenticados.
6. La validación de los formularios debe repetirse en PHP.
7. Los contratos de endpoints y DTO permanecen pendientes.
8. La API deberá probarse mediante Postman antes de conectarse con Angular.
