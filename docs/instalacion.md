# Instalación de Bitácora Cultural

## 1. Requisitos

Instala:

- Node.js y npm en una versión compatible con `package.json`.
- Ionic CLI: `npm install -g @ionic/cli`.
- XAMPP con Apache, PHP y MySQL/MariaDB.
- Git.

## 2. Obtener el proyecto

```bash
git clone <URL-DEL-REPOSITORIO>
cd JOK
npm install
```

Sustituye el marcador por la URL del repositorio entregado. El proyecto no incluye credenciales privadas.

## 3. Instalar la API PHP

Copia la carpeta:

```text
backend/bitacora-cultural-api
```

a:

```text
C:\xampp\htdocs\bitacora-cultural-api
```

Comprueba que el backend responda desde:

```text
http://localhost/bitacora-cultural-api
```

## 4. Crear la base de datos

1. Inicia Apache y MySQL desde el panel de XAMPP.
2. Abre phpMyAdmin.
3. Usa la opción **Importar**.
4. Selecciona `database/schema.sql`.
5. Ejecuta la importación.

El script crea `bitacora_cultural` y solamente su estructura. No agrega usuarios ni registros de ejemplo.

## 5. Ejecutar el frontend

Desde la raíz del proyecto:

```bash
ionic serve
```

Abre la URL indicada por Ionic, normalmente `http://localhost:8100`.

## 6. Comprobación básica

1. Registra una cuenta desde la aplicación.
2. Inicia sesión.
3. Crea un libro, una serie o una película.
4. Recarga el navegador y comprueba que el registro permanece.
5. Cierra sesión y comprueba que las páginas culturales protegidas redirigen al Login.

No copies contraseñas, cookies de sesión ni tokens CSRF en archivos del proyecto.
