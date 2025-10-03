# Punto de Venta para Librería (POS)
Este proyecto es un sistema de Punto de Venta (POS) diseñado para una librería. La aplicación está construida con una arquitectura moderna, utilizando contenedores de Docker para garantizar un entorno de desarrollo consistente y fácil de desplegar.

## Stack Tecnológico
Frontend: Angular

Backend: .NET 8

Base de Datos: SQL Server

Contenerización: Docker & Docker Compose

## 🚀 Guía de Inicio Rápido
Sigue estos pasos para clonar, configurar y ejecutar el proyecto en tu máquina local.

### 1. Prerrequisitos
Asegúrate de tener instaladas las siguientes herramientas en tu sistema:

- Git: Para clonar el repositorio.

- Docker y Docker Compose: Para ejecutar los servicios en contenedores.

- .NET 8 SDK: Para las herramientas de línea de comandos de .NET y Entity Framework.

- Visual Studio Code: Editor de código recomendado.

- Extensiones recomendadas:

- C# Dev Kit (Imprescindible para el desarrollo en .NET)

- Docker

Una vez instalado el .NET SDK, instala la herramienta global de Entity Framework Core con el siguiente comando:

dotnet tool install --global dotnet-ef

2. Clonación del Repositorio
Abre tu terminal, navega a la carpeta donde deseas guardar el proyecto y clona el repositorio:

```git clone <URL_DE_TU_REPOSITORIO_GIT>
cd <NOMBRE_DE_LA_CARPETA_DEL_PROYECTO>
```

3. Levantar los Servicios
Este comando iniciará los contenedores para el Backend, Frontend y la Base de Datos en segundo plano.

```
docker-compose up -d
```

Nota: La primera vez que ejecutes este comando, Docker tardará un poco más mientras descarga y construye las imágenes necesarias.

4. Creación de la Base de Datos
Los servicios ya están corriendo, pero la base de datos está vacía. Necesitamos aplicar las "migraciones" para crear las tablas.

Navega a la carpeta del backend:
```
cd backend
```

Restaura las dependencias del proyecto .NET:

```
dotnet restore
```

Ejecuta el comando para aplicar la migración y crear las tablas:

```
dotnet ef database update
```

¡Listo! En este punto, la base de datos ha sido creada y tu API está lista para recibir peticiones.

## 💻 Flujo de Desarrollo
Para desarrollar activamente en el backend con recarga en caliente (hot-reload):

Asegúrate de que todos los contenedores estén detenidos (docker compose down).

Ejecuta docker compose up sin el -d. Esto te permitirá ver los logs de todos los servicios en tiempo real.

docker compose up

Ahora, cada vez que guardes un cambio en un archivo .cs dentro de la carpeta backend, dotnet watch detectará el cambio y reiniciará automáticamente el servidor de la API dentro del contenedor.

## 🧪 Pruebas de los Endpoints
La forma más sencilla de probar la API es a través de la interfaz de Swagger UI, que ya está integrada.

### Acceso a Swagger
Asegúrate de que tus contenedores estén corriendo.

Abre tu navegador y navega a: http://localhost:5000/swagger

Verás una lista de todos los controladores y sus endpoints disponibles (Productos, Categorias, Proveedores).

## Ejemplo de Prueba: CRUD de Productos
### Crear un Producto (POST)

Despliega POST /api/Productos y haz clic en "Try it out".

Modifica el JSON del Request body con los datos del producto que quieres crear.

Haz clic en "Execute". Espera una respuesta 201 Created y guarda el id del producto creado.

### Obtener un Producto (GET)

Despliega GET /api/Productos/{id}.

Introduce el id del producto que creaste.

Ejecuta. Espera una respuesta 200 OK con los datos de tu producto.

### Actualizar un Producto (PUT)

Despliega PUT /api/Productos/{id}.

Introduce el id y modifica el JSON del Request body con los nuevos datos.

Ejecuta. Espera una respuesta 204 No Content.

### Eliminar un Producto (DELETE)

Despliega DELETE /api/Productos/{id}.

Introduce el id.

Ejecuta. Espera una respuesta 204 No Content.

Puedes seguir este mismo flujo para probar los demás endpoints.