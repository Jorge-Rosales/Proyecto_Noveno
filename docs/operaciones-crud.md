# Verificación de las operaciones CRUD de Bitácora Cultural

**Fecha de revisión:** 24 de septiembre de 2026  
**Alcance:** Libros, Series y Películas en la versión Angular con almacenamiento temporal en memoria.

## 1. Objetivo

Esta revisión comprobó que las tres bitácoras culturales permiten crear, consultar, modificar y eliminar registros mediante una separación clara entre modelos, componentes y servicios. También se verificaron las validaciones principales, la independencia entre colecciones y que la búsqueda y el ordenamiento no alteran los datos originales.

No se implementaron PHP, MySQL, autenticación, endpoints HTTP ni almacenamiento persistente.

## 2. Arquitectura comprobada

```text
Plantilla Ionic
    ↕ muestra datos y recibe acciones
Componente Angular de la pestaña
    ↕ valida el formulario y solicita operaciones
Servicio Angular de la entidad
    ↕ administra una señal privada en memoria
Modelo TypeScript
    define la estructura y los tipos del registro
```

Las responsabilidades están distribuidas así:

| Capa | Responsabilidad |
|---|---|
| Modelo | Define campos obligatorios, opcionales, estados, calificación, identificadores y fechas. |
| Componente | Controla modales, formularios reactivos, validaciones, selección del registro, búsqueda, ordenamiento y confirmación de borrado. |
| Servicio | Mantiene la colección en memoria y ejecuta alta, actualización y eliminación por identificador. |
| Plantilla | Presenta estados vacíos, tarjetas, detalles, errores y acciones. |

## 3. Operaciones CRUD

CRUD corresponde a **Create, Read, Update y Delete**: crear, consultar, actualizar y eliminar.

| Operación | Libros | Series | Películas |
|---|---|---|---|
| Crear | `addBook(...)` | `addSeries(...)` | `addMovie(...)` |
| Consultar colección | `books` | `series` | `movies` |
| Actualizar | `updateBook(id, changes)` | `updateSeries(id, changes)` | `updateMovie(id, changes)` |
| Eliminar | `deleteBook(id)` | `deleteSeries(id)` | `deleteMovie(id)` |

### 3.1 Crear

El usuario abre el modal, completa el formulario y pulsa el botón de guardado. El componente marca los controles como tocados y detiene la operación cuando el formulario es inválido. Si los datos son válidos, limpia los espacios exteriores de los textos y construye el borrador tipado que entrega al servicio.

El servicio agrega:

- un identificador único generado con `crypto.randomUUID()` cuando está disponible, con una alternativa basada en tiempo y aleatoriedad;
- `createdAt` con una fecha ISO;
- `updatedAt` con la misma fecha inicial.

El nuevo registro se inserta al principio de su colección. El modal solo se cierra después de completar la creación válida.

### 3.2 Consultar

Cada servicio expone su colección mediante una señal de solo lectura. Las vistas reaccionan automáticamente cuando cambia la señal. Los componentes calculan una lista filtrada y ordenada para la presentación, pero conservan la colección original del servicio.

La consulta incluye:

- historial completo de la entidad;
- búsqueda parcial por título, sin distinguir mayúsculas y minúsculas;
- orden por fecha de registro o calificación;
- modal con los detalles del registro seleccionado.

No se añadió un método `getById`, ya que las vistas actuales reciben el objeto seleccionado desde la lista y no necesitan otra búsqueda en el servicio.

### 3.3 Actualizar

Al editar, el componente guarda el identificador seleccionado y carga una copia de sus valores en el mismo formulario utilizado para crear. Al confirmar, vuelve a ejecutar las mismas validaciones y llama al método de actualización.

El servicio recorre la colección y sustituye únicamente el elemento cuyo `id` coincide. Conserva el identificador y `createdAt`, y asigna una nueva fecha ISO a `updatedAt`. Los demás registros permanecen intactos. Como se actualiza el registro existente, la edición no crea duplicados.

Al cancelar, el formulario se restablece sin llamar al servicio; por eso el registro original no cambia.

### 3.4 Eliminar

La acción de eliminar abre una alerta de Ionic. El botón **Cancelar** no modifica los datos. El botón **Eliminar** llama al servicio con el identificador del registro confirmado.

Cada servicio usa `filter` para retirar solamente el registro con ese identificador. La señal resultante actualiza la vista de inmediato. Si se elimina el elemento cuyos detalles estaban abiertos, el componente también cierra ese modal.

## 4. Reglas verificadas por entidad

### Libros

- El título no puede estar vacío ni contener solo espacios.
- La creación y la edición utilizan el mismo formulario.
- Una edición conserva el identificador y no duplica el libro.
- Cancelar una edición conserva los datos originales.
- La búsqueda y el orden por calificación trabajan sobre una lista calculada.

### Series

- El título no puede estar vacío ni contener solo espacios.
- Los números de temporadas y episodios deben ser enteros positivos cuando existen.
- La temporada actual no puede superar el total de temporadas.
- No se admite un episodio sin una temporada actual.
- La fecha de finalización no puede preceder a la fecha de inicio.
- Crear, editar y cancelar siguen el mismo flujo que Libros.

### Películas

- El título no puede estar vacío ni contener solo espacios.
- La fecha de finalización no puede preceder a la fecha de inicio; la misma fecha sí es válida.
- Una edición actualiza la película original sin crear otra.
- Cancelar una edición conserva los datos originales.
- La búsqueda acepta espacios exteriores y no distingue mayúsculas y minúsculas.

## 5. Almacenamiento temporal

Cada servicio contiene una señal privada que comienza con un arreglo vacío:

```ts
private readonly itemList = signal<Item[]>([]);
readonly items = this.itemList.asReadonly();
```

La señal pública impide que los componentes reemplacen directamente la colección interna. Libros, Series y Películas usan servicios y arreglos distintos. Una operación aplicada a una entidad no modifica las otras dos.

Los datos viven únicamente en la memoria del proceso de la aplicación. Se mantienen mientras la instancia de Angular siga activa, pero se pierden al recargar completamente la página, cerrar la aplicación o reiniciar el servidor. No se usa `localStorage`, `sessionStorage`, IndexedDB ni SQLite.

## 6. Pruebas automatizadas ejecutadas

Se amplió la cobertura con pruebas de componentes, servicios e independencia entre entidades.

### Cobertura funcional relevante

| Área | Comprobaciones |
|---|---|
| Servicios | Identificadores distintos, fechas ISO válidas, orden de inserción, actualización aislada y eliminación por `id`. |
| Fechas técnicas | `createdAt` permanece estable y `updatedAt` cambia al editar. |
| Formularios | Rechazo de títulos en blanco y reglas propias de Series y Películas. |
| Edición | Se conserva el identificador, no se crea un duplicado y cancelar no altera el registro. |
| Consulta | Búsqueda parcial sin distinguir mayúsculas y orden por calificación. |
| Integridad | Filtrar u ordenar no cambia el orden de la colección fuente. |
| Independencia | Eliminar un libro y editar una serie no afecta las demás colecciones. |

### Resultado real

| Verificación | Resultado |
|---|---|
| Pruebas Jasmine/Karma | **27 de 27 aprobadas**. |
| Compilación con el CLI local | **Correcta** mediante `node node_modules/@angular/cli/bin/ng.js build`. |
| ESLint | **Correcto**, sin errores, mediante el CLI local. |
| Revisión de espacios y conflictos | **Correcta** con `git diff --check`. |
| Servidor de desarrollo | Compilación correcta en `http://127.0.0.1:4218/`. |
| Acceso HTTP | `/`, `/login`, `/tabs/tab1`, `/tabs/tab2` y `/tabs/tab3` respondieron con código 200. |

Las 27 pruebas incluyen las pruebas CRUD añadidas y las pruebas básicas ya existentes de la aplicación, pestañas, contenedor y servicio fotográfico de la plantilla.

La ejecución de Karma requirió temporalmente un lanzador `ChromeHeadless` con `--disable-gpu`, `--disable-software-rasterizer` y `--no-sandbox`, debido a que el navegador sin interfaz no podía inicializar la GPU en este entorno. El archivo temporal se eliminó después de la ejecución y no forma parte del proyecto.

### Advertencias y limitaciones de la verificación

La compilación mostró advertencias de presupuesto recomendado para los estilos SCSS de las tres pestañas: aproximadamente 3.97 kB en Libros, 4.00 kB en Series y 3.92 kB en Películas frente al límite recomendado de 2 kB. Ningún estilo superó el límite máximo que detiene la compilación, por lo que no se modificaron los presupuestos ni el diseño.

El comando solicitado `npm run build` no pudo iniciar porque NVM bloqueó el ejecutable delegado de npm con el código `NVM4306` y recomendó `nvm reshim` o `nvm doctor --autofix`. No se modificó NVM. Para comprobar el proyecto se invocó directamente el Angular CLI instalado en `node_modules`, y esa compilación sí terminó correctamente.

No se realizó una sesión visual interactiva controlada. Las respuestas HTTP comprueban que el servidor entrega la aplicación y las rutas, pero no sustituyen las pruebas manuales de botones, modales y diseño responsivo.

## 7. Procedimiento manual en el navegador

### Preparación

1. Abrir una terminal en `C:\Jorge\JOK`.
2. Ejecutar `ionic serve` en el entorno habitual del proyecto.
3. Abrir la dirección indicada por Ionic.
4. Confirmar que Login aparece sin barra inferior y que las pestañas culturales muestran **Libros**, **Series** y **Películas**.

### Libros

1. Entrar a **Libros** y comprobar el estado vacío.
2. Abrir **Agregar libro**, intentar guardar un título formado por espacios y verificar el error.
3. Crear un libro válido con autor, género, calificación, estado, fechas, opinión y frase opcionales.
4. Abrir sus detalles y comparar todos los valores.
5. Editarlo, cambiar título o calificación y guardar; verificar que continúa existiendo un solo registro.
6. Volver a editar, cambiar un dato y cancelar; comprobar que el cambio se descartó.
7. Crear un segundo libro, buscar parte de su título con otras mayúsculas y probar las cuatro opciones de orden.
8. Solicitar la eliminación, cancelar y verificar que permanece.
9. Repetir la eliminación, confirmar y verificar que desaparece solo el libro elegido.

### Series

1. Entrar a **Series** y comprobar el estado vacío.
2. Verificar que un título en blanco no se guarda.
3. Intentar una temporada actual mayor que el total y comprobar el mensaje de error.
4. Intentar registrar un episodio sin temporada actual y comprobar el mensaje de error.
5. Intentar números cero, negativos o decimales en los campos de progreso.
6. Intentar una fecha final anterior a la inicial.
7. Crear una serie válida con estado, calificación y progreso, y revisar su tarjeta y detalles.
8. Editar el título o progreso y confirmar que el registro original se actualiza sin duplicarse.
9. Cancelar otra edición y confirmar que los datos se conservan.
10. Crear más series, combinar búsqueda y orden, y probar cancelar y confirmar la eliminación.

### Películas

1. Entrar a **Películas** y comprobar el estado vacío.
2. Verificar el rechazo de un título en blanco.
3. Intentar una fecha final anterior a la inicial y después usar la misma fecha para ambas; solo el primer caso debe fallar.
4. Crear una película válida y revisar su tarjeta y todos sus detalles.
5. Editar título o calificación y comprobar que no aparece un duplicado.
6. Cancelar otra edición y confirmar que el original no cambia.
7. Crear más películas, probar búsqueda parcial, mayúsculas, espacios exteriores y las opciones de orden.
8. Cancelar una eliminación y luego confirmar otra.

### Independencia y memoria

1. Crear al menos un libro, una serie y una película.
2. Editar la serie y eliminar el libro.
3. Confirmar que la película conserva todos sus datos y que la serie mantiene solo su cambio esperado.
4. Recargar completamente el navegador.
5. Confirmar que las tres colecciones vuelven a su estado vacío; este resultado es el comportamiento temporal previsto.

### Diseño responsivo

1. Usar las herramientas de desarrollo del navegador para probar un ancho móvil y otro de escritorio.
2. Confirmar que las tarjetas se adaptan, el formulario permite desplazamiento vertical y sus botones siguen visibles.
3. Confirmar que la barra inferior no tapa el contenido de las pestañas y que no aparece en Login.

## 8. Preparación para PHP y MySQL

La interfaz ya depende de servicios y no de arreglos administrados directamente por las páginas. Cuando exista el backend, los métodos pueden transformarse en operaciones asíncronas:

| Operación actual | Operación futura prevista |
|---|---|
| Lectura de la señal | `GET` a la API PHP. |
| `add...` | `POST` con un borrador validado. |
| `update...(id, changes)` | `PUT` o `PATCH` del identificador. |
| `delete...(id)` | `DELETE` del identificador. |

La migración futura también deberá manejar respuestas HTTP, errores, indicadores de carga y la relación con el usuario autenticado. Los contratos, rutas y tablas se definirán y probarán primero con Postman. En esta etapa no se inventaron esos elementos.

## 9. Archivos creados o modificados en esta revisión

| Archivo | Cambio realizado |
|---|---|
| `src/app/services/book.service.spec.ts` | Amplía las pruebas de creación, identificadores, fechas, actualización aislada y eliminación. |
| `src/app/services/series.service.spec.ts` | Comprueba creación, actualización, conservación de metadatos y eliminación por identificador. |
| `src/app/services/movie.service.spec.ts` | Comprueba creación, actualización, conservación de metadatos y eliminación por identificador. |
| `src/app/services/cultural-services.integration.spec.ts` | Nueva prueba de independencia entre Libros, Series y Películas. |
| `src/app/tab1/tab1.page.spec.ts` | Añade casos del formulario, creación, edición, cancelación, búsqueda y orden. |
| `src/app/tab2/tab2.page.spec.ts` | Añade casos de validación, creación, edición, cancelación, búsqueda y orden. |
| `src/app/tab3/tab3.page.spec.ts` | Añade casos de validación de fechas, creación, edición, cancelación, búsqueda y orden. |
| `docs/operaciones-crud.md` | Documenta la implementación, resultados, procedimiento manual y trabajo futuro. |

Los componentes, servicios y modelos funcionales fueron inspeccionados, pero la lógica de producción no necesitó cambios en esta revisión: las operaciones CRUD existentes ya cumplían el flujo requerido. Los demás archivos que aparecen modificados en el repositorio corresponden a etapas anteriores de desarrollo de las vistas, los modelos y la capa de servicios.

## 10. Código generado con asistencia de IA

Se aceptó la estructura existente de modelos, formularios reactivos, señales privadas, señales de solo lectura y métodos CRUD porque mantenía separadas las responsabilidades y cumplía el almacenamiento temporal solicitado.

Durante esta revisión, el código generado con asistencia de IA se concentró en pruebas automatizadas y documentación:

- se añadieron casos para metadatos, cancelación, búsqueda, orden e independencia porque eran riesgos funcionales que no estaban cubiertos de forma explícita;
- se mantuvo la API pública de los servicios porque las tres vistas ya la consumen correctamente;
- se descartó añadir `getById` porque no existe un flujo actual que lo requiera;
- se descartó modificar los límites de estilos porque las advertencias no impiden compilar;
- se descartó corregir NVM desde el proyecto porque es una configuración externa y la compilación pudo verificarse con el CLI local;
- se eliminó la configuración temporal de Karma después de las pruebas para no dejar ajustes específicos del entorno.

## 11. Funcionalidades pendientes

- Diseñar e implementar la API PHP.
- Crear las tablas y relaciones en MySQL o MariaDB.
- Definir y probar el contrato HTTP con Postman.
- Sustituir el almacenamiento en memoria por solicitudes HTTP.
- Incorporar autenticación real y asociar los registros con el usuario autenticado.
- Manejar carga, errores de red, reintentos y respuestas del servidor.
- Ejecutar el procedimiento visual manual descrito en este documento y registrar evidencias en los dispositivos o resoluciones requeridos por la actividad.

