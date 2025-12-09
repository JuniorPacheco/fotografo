# Fotografo

Aplicación de fotografía con backend API en TypeScript, Express, PostgreSQL y Prisma.

## Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- npm o yarn

## Inicio Rápido

### 1. Levantar la Base de Datos PostgreSQL

Desde el directorio raíz del proyecto:

```bash
docker-compose up -d
```

Esto levantará un contenedor PostgreSQL en el puerto 5432.

Para detener la base de datos:

```bash
docker-compose down
```

Para ver los logs:

```bash
docker-compose logs -f postgres
```

### 2. Configurar el Backend

1. Navega a la carpeta backend:

```bash
cd backend
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

4. Genera el cliente de Prisma:

```bash
npm run prisma:generate
```

5. Ejecuta las migraciones:

```bash
npm run prisma:migrate
```

6. Inicia el servidor de desarrollo:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
fotografo/
├── backend/              # API Backend
│   ├── src/              # Código fuente TypeScript
│   ├── prisma/           # Schema y migraciones de Prisma
│   └── dist/             # Código compilado (generado)
├── frontend/             # Frontend React + TypeScript
│   ├── src/              # Código fuente
│   └── dist/             # Build de producción (generado)
├── docker-compose.yml    # Configuración de PostgreSQL
└── README.md
```

## Comandos Útiles

### Docker Compose

- `docker-compose up -d` - Levantar servicios en segundo plano
- `docker-compose down` - Detener y eliminar contenedores
- `docker-compose ps` - Ver estado de los contenedores
- `docker-compose logs -f postgres` - Ver logs de PostgreSQL

### Backend

Ver `backend/README.md` para más detalles sobre los comandos del backend.

## Variables de Entorno

Asegúrate de configurar las siguientes variables en `backend/.env`:

- `DATABASE_URL` - URL de conexión a PostgreSQL
- `NODE_ENV` - Entorno de ejecución (development/production/test)
- `PORT` - Puerto del servidor (default: 3000)

## Base de Datos

La base de datos PostgreSQL se ejecuta en un contenedor Docker. Los datos se persisten en un volumen Docker llamado `postgres_data`.

Credenciales por defecto:

- Usuario: `postgres`
- Contraseña: `postgres`
- Base de datos: `fotografo_db`
- Puerto: `5432`

## Frontend

Para configurar y ejecutar el frontend:

1. Navega a la carpeta frontend:

```bash
cd frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Credenciales de Acceso

- Email: `admin@admin.com`
- Password: `elmasteradmin`

## Comandos para prisma

```
  //Generar migracion
  pnpx prisma migrate dev --name name

  //Generar los types
  pnpx prisma generate
```
