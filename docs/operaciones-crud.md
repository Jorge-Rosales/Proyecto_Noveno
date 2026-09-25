# Operaciones CRUD persistentes

## Flujo general

```text
Formulario Angular
  → servicio cultural
  → Axios
  → endpoint PHP
  → consulta preparada
  → MySQL/MariaDB
```

## Consultar

Al entrar en una pestaña, `ionViewWillEnter()` llama al método `listar...()` correspondiente. PHP obtiene el usuario de la sesión y devuelve exclusivamente sus registros. Una lista vacía produce el estado vacío de la interfaz.

## Crear

El componente valida y normaliza el formulario. El servicio obtiene CSRF y ejecuta POST contra `crear.php`. Después del éxito, la página vuelve a listar desde MySQL y cierra el formulario.

## Actualizar

La página combina el identificador y las fechas originales con los valores editados. El servicio ejecuta PUT contra `actualizar.php`. El backend comprueba que el registro pertenezca al usuario autenticado antes de modificarlo.

## Eliminar

Ionic presenta una confirmación. Tras aceptar, el servicio envía DELETE con `{ id }` en el cuerpo y el token CSRF en el encabezado. La interfaz actualiza la lista solo después de la confirmación del backend.

## Endpoints

Las tres entidades usan los grupos `/libros`, `/series` y `/peliculas`, cada uno con `listar.php`, `crear.php`, `actualizar.php` y `eliminar.php`.

## Búsqueda y ordenamiento

La búsqueda por título y el ordenamiento se calculan sobre la colección cargada en el componente. Estas operaciones no modifican los registros de MySQL.

## Verificación automatizada

Las pruebas de las páginas sustituyen sus servicios con spies de Jasmine. Así comprueban carga, creación, edición y eliminación sin realizar solicitudes HTTP ni modificar la base de datos. Login y el guard también se prueban con dobles de `AuthService` y `Router`.
