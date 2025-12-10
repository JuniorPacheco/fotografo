# Diagramas de Flujo - Sistema de Gestión Fotográfica

Este documento describe los diagramas de flujo creados para visualizar el funcionamiento de la aplicación desde el punto de vista del frontend.

## Archivos de Diagramas

Se han creado 4 diagramas en formato PlantUML (`.puml`) que cubren diferentes aspectos de la aplicación:

### 1. FLUJO_APLICACION.puml

**Tipo:** Diagrama de flujo detallado  
**Propósito:** Muestra paso a paso todas las funcionalidades disponibles en el frontend

**Contenido:**

- Flujo de autenticación completo
- Funcionalidades de cada módulo (Clientes, Paquetes, Facturas, Pagos, Sesiones, Recordatorios)
- Flujos de creación, edición y eliminación
- Integración con Google Calendar
- Validaciones y confirmaciones

**Uso:** Ideal para entender el funcionamiento completo de cada sección de la aplicación.

---

### 2. DIAGRAMA_FUNCIONALIDADES.puml

**Tipo:** Diagrama de componentes y relaciones  
**Propósito:** Vista general de los módulos principales y cómo se relacionan

**Contenido:**

- Módulos principales de la aplicación
- Relaciones entre módulos
- Flujos de navegación
- Notas explicativas sobre procesos clave

**Uso:** Perfecto para explicar al cliente la estructura general de la aplicación y cómo los diferentes módulos trabajan juntos.

---

### 3. FLUJO_PROCESO_NEGOCIO.puml

**Tipo:** Diagrama de proceso de negocio  
**Propósito:** Muestra un escenario completo de uso real

**Contenido:**

- Proceso completo desde registrar un cliente nuevo hasta completar el trabajo
- Pasos secuenciales del flujo de negocio
- Estados de facturas y sesiones
- Funcionalidades adicionales

**Uso:** Excelente para explicar al cliente cómo usar la aplicación en un escenario real de trabajo diario.

---

### 4. ARQUITECTURA_FRONTEND.puml

**Tipo:** Diagrama de arquitectura técnica  
**Propósito:** Muestra la estructura técnica del frontend

**Contenido:**

- Componentes y páginas
- Servicios API
- Hooks personalizados
- Componentes UI reutilizables
- Conexiones entre componentes

**Uso:** Útil para desarrolladores y para entender la estructura técnica de la aplicación.

---

## Cómo Visualizar los Diagramas

### Opción 1: PlantUML Online

1. Visita [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copia el contenido del archivo `.puml`
3. Pégalo en el editor
4. El diagrama se generará automáticamente

### Opción 2: Extensiones de VS Code

1. Instala la extensión "PlantUML" en VS Code
2. Abre el archivo `.puml`
3. Presiona `Alt + D` para previsualizar
4. O usa `Ctrl + Shift + P` y busca "PlantUML: Preview"

### Opción 3: Herramientas Locales

- **PlantUML JAR**: Descarga el JAR desde [plantuml.com](https://plantuml.com/download)
- **IntelliJ IDEA**: Tiene soporte nativo para PlantUML
- **Visual Studio Code**: Con la extensión PlantUML

### Opción 4: Generar Imágenes

```bash
# Si tienes PlantUML instalado localmente
java -jar plantuml.jar FLUJO_APLICACION.puml
# Esto generará FLUJO_APLICACION.png
```

---

## Recomendaciones para Presentar al Cliente

### Para Explicación Inicial

1. **Empezar con:** `DIAGRAMA_FUNCIONALIDADES.puml`

   - Da una visión general rápida
   - Muestra todos los módulos disponibles
   - Fácil de entender

2. **Continuar con:** `FLUJO_PROCESO_NEGOCIO.puml`

   - Muestra un caso de uso real
   - Explica el flujo de trabajo diario
   - Ayuda a entender cómo usar la aplicación

3. **Detalles técnicos:** `FLUJO_APLICACION.puml`
   - Si el cliente quiere entender más detalles
   - Muestra todas las opciones disponibles
   - Útil para capacitación

### Para Desarrollo

- Usar `ARQUITECTURA_FRONTEND.puml` para entender la estructura técnica
- Usar `FLUJO_APLICACION.puml` como referencia durante el desarrollo

---

## Estructura de la Aplicación

### Módulos Principales

1. **Autenticación**

   - Login con email/password
   - Protección de rutas
   - Manejo de sesiones

2. **Dashboard**

   - Vista principal
   - Integración Google Calendar (solo para OWNER)
   - Resumen general

3. **Clientes**

   - CRUD completo de clientes
   - Búsqueda y filtros
   - Paginación

4. **Paquetes**

   - CRUD completo de paquetes de fotografía
   - Precios sugeridos
   - Búsqueda y filtros

5. **Facturas**

   - CRUD completo de facturas/contratos
   - Gestión de estados
   - Visualización de pagos y sesiones asociadas
   - Reporte de ventas diarias

6. **Pagos**

   - CRUD completo de pagos
   - Actualización automática de montos en facturas
   - Múltiples métodos de pago

7. **Sesiones**

   - CRUD completo de sesiones de fotografía
   - Integración con Google Calendar
   - Gestión de estados
   - Fotos seleccionadas

8. **Recordatorios**
   - Visualización de recordatorios automáticos
   - Generados por el sistema
   - Estados de envío

---

## Características Destacadas

### Integración Google Calendar

- Conexión OAuth con Google
- Sincronización automática de sesiones
- Creación y actualización de eventos
- Solo disponible para usuarios OWNER

### Validaciones Automáticas

- Validación de montos de pago (no exceder pendiente)
- Validación de número máximo de sesiones
- Validación de datos requeridos
- Manejo de errores

### Actualizaciones Automáticas

- Los pagos actualizan automáticamente los montos de la factura
- Los recordatorios se generan automáticamente
- Los eventos de Google Calendar se sincronizan automáticamente

### Funcionalidades de Búsqueda

- Búsqueda por nombre en clientes, paquetes
- Filtros por fecha en facturas
- Filtros por cliente en pagos y recordatorios
- Ordenamiento por fecha en todos los módulos

---

## Notas Importantes

- Todos los diagramas están enfocados en el **frontend**
- Los flujos muestran la **perspectiva del usuario**
- Las acciones requieren **autenticación** (excepto login)
- Las rutas están **protegidas** por ProtectedRoute
- Los **tokens JWT** se manejan automáticamente

---

## Actualización de Diagramas

Si se agregan nuevas funcionalidades o se modifican flujos existentes, actualiza los diagramas correspondientes:

1. **Nueva funcionalidad:** Actualizar `FLUJO_APLICACION.puml` y `DIAGRAMA_FUNCIONALIDADES.puml`
2. **Nuevo proceso de negocio:** Actualizar `FLUJO_PROCESO_NEGOCIO.puml`
3. **Nuevo componente:** Actualizar `ARQUITECTURA_FRONTEND.puml`

---

## Contacto y Soporte

Para preguntas sobre los diagramas o sugerencias de mejora, contactar al equipo de desarrollo.
