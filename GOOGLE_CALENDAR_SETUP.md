# Configuración de Google Calendar Integration

## ✅ Implementación Completada

### Backend

- ✅ Modelo `GoogleToken` en Prisma para almacenar tokens OAuth2
- ✅ Campo `googleEventId` en modelo `Session` para vincular eventos
- ✅ ✅ Migración de base de datos aplicada
- ✅ Utilidad `googleClient.ts` para configuración OAuth2
- ✅ Servicio `googleCalendar.ts` con funciones CRUD de eventos
- ✅ Controladores para OAuth (url, callback, status, disconnect)
- ✅ Rutas con documentación Swagger
- ✅ Integración automática: creación/actualización/eliminación de eventos cuando se gestionan sesiones

### Frontend

- ✅ Servicio `googleCalendar.service.ts` para comunicación con API
- ✅ Página de callback `/google/callback`
- ✅ Botón de conexión en Dashboard (solo visible para OWNER)
- ✅ Indicador de estado de conexión
- ✅ Botón de desconexión

## 🔧 Configuración Requerida

### 1. Google Cloud Console Setup

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Calendar API**:

   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

4. Crea credenciales OAuth 2.0:

   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "OAuth client ID"
   - Selecciona "Web application"
   - Configura:
     - **Name**: Fotografo Calendar Integration
     - **Authorized JavaScript origins**:
       - `http://localhost:5173` (desarrollo)
       - Tu dominio de producción
     - **Authorized redirect URIs**:
       - `http://localhost:3000/api/v1/google-calendar/auth/callback` (desarrollo)
       - `https://tu-dominio.com/api/v1/google-calendar/auth/callback` (producción)

5. Copia el **Client ID** y **Client Secret**

### 2. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` del backend:

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/google-calendar/auth/callback
FRONTEND_URL=http://localhost:5173
```

**Nota**:

- En producción, actualiza `GOOGLE_REDIRECT_URI` con tu dominio real del backend
- En producción, actualiza `FRONTEND_URL` con tu dominio real del frontend
- El `FRONTEND_URL` es usado para redirigir al usuario después de la autorización de Google

### 3. Regenerar Prisma Client (si es necesario)

Si ya ejecutaste la migración, el cliente de Prisma ya está actualizado. Si no:

```bash
cd backend
pnpm prisma generate
```

## 📋 Funcionalidades

### Para el OWNER

1. **Conectar Google Calendar**:

   - Ve al Dashboard
   - Haz clic en "Conectar Google Calendar"
   - Serás redirigido a Google para autorizar
   - Después de autorizar, serás redirigido de vuelta
   - El sistema creará automáticamente un calendario llamado "Reservas Fotógrafo"

2. **Desconectar Google Calendar**:
   - Ve al Dashboard
   - Haz clic en "Desconectar Google Calendar"
   - Esto eliminará todos los tokens almacenados

### Para Todos los Usuarios

Una vez que el OWNER haya conectado Google Calendar:

- **Crear Sesión con fecha programada**: Se crea automáticamente un evento en Google Calendar
- **Actualizar Sesión**: El evento se actualiza automáticamente en Google Calendar
- **Eliminar Sesión**: El evento se elimina automáticamente de Google Calendar
- **Cambiar estado a CANCELLED**: El evento se elimina del calendario

## 🔒 Seguridad

- Solo el usuario con rol **OWNER** puede conectar/desconectar Google Calendar
- Los tokens se almacenan de forma segura en la base de datos
- El sistema renueva automáticamente los tokens expirados usando el refresh_token
- Todos los eventos se crean en un calendario exclusivo de la aplicación

## 📝 Notas Importantes

1. **Calendario Exclusivo**: El sistema crea un calendario separado llamado "Reservas Fotógrafo" que es exclusivo para la aplicación. Los eventos personales del usuario no aparecerán en este calendario.

2. **Renovación Automática**: El sistema renueva automáticamente los tokens expirados, por lo que el usuario solo necesita autorizar una vez.

3. **Manejo de Errores**: Si falla la creación/actualización de eventos en Google Calendar, la operación de sesión continúa normalmente (no bloquea la funcionalidad principal).

4. **Zona Horaria**: Los eventos se crean con zona horaria "America/Bogota". Puedes cambiarla en `backend/src/utils/googleCalendar.ts` si es necesario.

## 🧪 Testing

1. Inicia el backend y frontend
2. Inicia sesión como usuario OWNER
3. Ve al Dashboard
4. Conecta Google Calendar
5. Crea una sesión con fecha programada
6. Verifica que el evento aparezca en Google Calendar
7. Actualiza la sesión y verifica que el evento se actualice
8. Elimina la sesión y verifica que el evento se elimine

## 📚 Documentación API

La documentación completa de la API está disponible en Swagger cuando el backend está en modo desarrollo:

```
http://localhost:3000/api-docs
```

Busca la sección "Google Calendar" para ver todos los endpoints disponibles.
