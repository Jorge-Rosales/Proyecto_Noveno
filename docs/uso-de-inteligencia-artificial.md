git add docs/diagrama-entidades.md docs/uso-de-inteligencia-artificial.md# Uso de inteligencia artificial en Bitácora Cultural

## 1. Objetivo

La inteligencia artificial se utilizó como apoyo para revisar y documentar el modelo de datos y la capa de acceso a datos de Bitácora Cultural. El propósito fue contrastar el código existente con los requisitos de la actividad, detectar inconsistencias, ampliar la verificación automatizada y producir documentación técnica basada en evidencia. La IA no sustituyó la revisión del estudiante ni se utilizó para implementar PHP, MySQL o autenticación.

## 2. Herramienta utilizada

La herramienta utilizada fue **Codex**, un asistente de programación. Codex examinó archivos del proyecto, comparó interfaces, servicios, componentes y pruebas, propuso cambios dentro del alcance autorizado y ejecutó verificaciones disponibles en el entorno. Sus resultados se conservaron únicamente cuando coincidían con el código real y con los requisitos de la actividad.

## 3. Modelado de datos

Codex revisó las entidades implementadas `Book`, `SeriesEntry` y `MovieEntry`, junto con sus atributos, tipos y reglas. Se comprobó el uso de identificadores `string`, fechas como cadenas, calificaciones `number | null`, estados restringidos y valores de progreso anulables para Series. También se documentó que los textos funcionalmente opcionales existen como propiedades requeridas y usan una cadena vacía cuando no contienen información.

La revisión relacionó estos tipos con reglas como el título obligatorio, la calificación de 1 a 5, la coherencia de fechas y las restricciones de temporadas y episodios. `Usuario` se mantuvo como una propuesta conceptual pendiente. Sus relaciones de uno a cero o muchos con Libro, Serie y Película describen el diseño futuro; no existen todavía en Angular o MySQL y no se añadió `userId` a las interfaces actuales.

## 4. Interfaces y servicios Angular

Se analizaron `Book`, `SeriesEntry`, `SeriesDraft`, `MovieEntry`, `MovieDraft` y los tipos de estado. Las interfaces existentes se conservaron porque representan correctamente los formularios y servicios actuales. También se descartó crear una abstracción común o un alias adicional para Libros, ya que no resolvían un problema funcional y habrían ampliado innecesariamente el alcance.

Codex revisó `BookService`, `SeriesService` y `MovieService`. Los tres usan señales privadas para almacenar colecciones en memoria, exponen señales de solo lectura y proporcionan operaciones para crear, actualizar y eliminar por identificador. Se comprobó que generan identificadores y fechas, conservan `createdAt` durante una edición y actualizan `updatedAt`. No fue necesario modificar su lógica ni añadir `getById`, porque las vistas ya obtienen el registro seleccionado desde la colección disponible.

## 5. Operaciones CRUD y pruebas

La IA trazó el recorrido entre formulario, componente y servicio para las operaciones de crear, consultar, actualizar y eliminar. La consulta incluye la reacción a las señales, búsqueda por título, ordenamiento y presentación de detalles. También se verificó que cancelar una edición no modifica el registro y que la eliminación se realiza por identificador después de la confirmación correspondiente.

Codex amplió las pruebas automatizadas para cubrir identificadores únicos, fechas válidas, conservación de `createdAt`, cambio de `updatedAt`, edición sin duplicados, cancelación, validaciones, búsqueda, ordenamiento e independencia entre las colecciones. El resultado documentado fue de **27 pruebas Jasmine/Karma aprobadas de 27 ejecutadas**. La compilación mediante el Angular CLI local y el análisis ESLint finalizaron correctamente. `git diff --check` tampoco detectó errores. El comando `npm run build` fue bloqueado por la configuración externa de NVM con el código `NVM4306`; por ello se ejecutó directamente el CLI local sin modificar NVM.

## 6. Diagrama de entidades

El diagrama Mermaid se elaboró a partir de las interfaces TypeScript y de `docs/modelo-de-datos.md`. Incluye Libro, Serie y Película con sus atributos reales, además de Usuario marcado expresamente como pendiente de implementación. Las relaciones conceptuales muestran que un usuario podrá registrar cero o muchos elementos de cada tipo cultural. El diagrama no crea tablas, claves foráneas, usuarios ficticios ni nuevas propiedades en el código.

## 7. Revisión humana y limitaciones

La evidencia automática confirma la compilación con el CLI local, el análisis estático, las 27 pruebas y la disponibilidad HTTP documentada de las rutas principales. No se realizó una sesión visual interactiva controlada, por lo que todavía corresponde al estudiante ejecutar el procedimiento manual preparado para revisar botones, modales, mensajes, eliminación con confirmación y diseño responsivo.

El almacenamiento continúa siendo temporal: los datos viven en memoria y pueden perderse al recargar. No existe API PHP, base de datos MySQL, persistencia, entidad funcional de Usuario ni autenticación real. También permanece pendiente definir y probar con Postman el futuro contrato HTTP. El estudiante debe revisar que la documentación represente el comportamiento observado y decidir cualquier cambio de arquitectura antes de incorporarlo.

## 8. Conclusión

Codex contribuyó como herramienta de análisis, verificación y redacción técnica. Permitió organizar el modelo existente, justificar la conservación de las interfaces y servicios, ampliar la cobertura de pruebas y representar el diseño conceptual mediante un diagrama. La validación final, las pruebas manuales, la aceptación de las decisiones y el desarrollo posterior del backend continúan bajo responsabilidad del estudiante.
