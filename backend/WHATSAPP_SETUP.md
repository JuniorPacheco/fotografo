# Configuración de WhatsApp Business API para Recordatorios

Esta guía te ayudará a configurar WhatsApp Business API a través de Facebook para enviar recordatorios automáticos a tus clientes.

## Requisitos Previos

- Una cuenta de Facebook Business
- Un número de teléfono que no esté asociado a WhatsApp personal
- Acceso a Meta Business Suite o Facebook Developers

## Paso 1: Crear una App de Facebook

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Inicia sesión con tu cuenta de Facebook Business
3. Haz clic en **"Mis Apps"** en la esquina superior derecha
4. Haz clic en **"Crear App"**
5. Selecciona el tipo de app: **"Negocio"** o **"Otro"**
6. Completa la información:
   - **Nombre de la app**: Ej: "Fotografo WhatsApp API"
   - **Email de contacto**: Tu email
   - **Propósito de la app**: Selecciona "WhatsApp"
7. Haz clic en **"Crear App"**

## Paso 1.5: Configurar Política de Privacidad y Términos

Facebook requiere una URL de política de privacidad para completar la configuración de la app. Aunque tu aplicación sea solo un dashboard interno, es necesario proporcionar esta información.

### Política de Privacidad en el Frontend

La política de privacidad y términos de servicio están integrados directamente en el frontend de la aplicación, por lo que estarán disponibles en tu dominio cuando despliegues en Vercel.

### URLs Disponibles

Una vez que despliegues el frontend en Vercel, las URLs serán:

- **Política de Privacidad**: `https://[tu-dominio-vercel].vercel.app/privacy-policy`
- **Términos de Servicio**: `https://[tu-dominio-vercel].vercel.app/terms-of-service`

### En el Formulario de Facebook:

1. **URL de la política de privacidad**: 
   - Usa: `https://[tu-dominio-vercel].vercel.app/privacy-policy`
   - O si tienes dominio personalizado: `https://[tu-dominio]/privacy-policy`

2. **URL de Condiciones del servicio**: 
   - Usa: `https://[tu-dominio-vercel].vercel.app/terms-of-service`
   - O si tienes dominio personalizado: `https://[tu-dominio]/terms-of-service`

3. **URL de eliminación de datos**: 
   - Puedes usar la misma URL de términos de servicio (incluye una sección sobre eliminación de datos)
   - O crear una ruta específica si lo prefieres

> **Nota**: Las páginas de política de privacidad y términos de servicio son públicas y no requieren autenticación, por lo que Facebook podrá acceder a ellas sin problemas.

## Paso 2: Agregar el Producto WhatsApp

1. En el panel de tu app, busca la sección **"Agregar productos a tu app"**
2. Busca **"WhatsApp"** y haz clic en **"Configurar"**
3. Sigue las instrucciones para configurar WhatsApp Business API

## Paso 3: Obtener el Token de Acceso (WHATSAPP_TOKEN)

1. En el panel de tu app, ve a **"WhatsApp"** en el menú lateral
2. Haz clic en **"API Setup"** o **"Configuración de API"**
3. En la sección **"Temporary access token"** o **"Token de acceso temporal"**:
   - Copia el token que aparece (este es temporal, válido por 24 horas)
   - **O** genera un token permanente:
     - Ve a **"Herramientas"** → **"Graph API Explorer"**
     - Selecciona tu app en el dropdown
     - Selecciona los permisos: `whatsapp_business_messaging`, `whatsapp_business_management`
     - Haz clic en **"Generar token de acceso"**
     - Copia el token generado

> **Nota**: Para producción, es recomendable usar un token permanente o configurar un sistema de renovación automática de tokens.

## Paso 4: Obtener el Phone Number ID (PHONE_NUMBER_ID)

1. En el panel de tu app, ve a **"WhatsApp"** → **"API Setup"**
2. En la sección **"From"** o **"Desde"**, verás tu número de teléfono
3. El **Phone Number ID** es un número que aparece junto a tu número de teléfono
4. También puedes encontrarlo en:
   - **"WhatsApp"** → **"Phone numbers"** → Selecciona tu número → El ID aparece en la URL o en los detalles

> **Ejemplo**: Si tu Phone Number ID es `123456789012345`, ese es el valor que necesitas.

## Paso 5: Crear Templates de Mensajes

Los templates son mensajes pre-aprobados que puedes usar para enviar notificaciones. Necesitas crear 3 templates:

### Template 1: `recordatorio_sesion_completada`

1. Ve a **"WhatsApp"** → **"Message Templates"** o **"Plantillas de mensajes"**
2. Haz clic en **"Create Message Template"** o **"Crear plantilla de mensaje"**
3. Completa el formulario:
   - **Nombre**: `recordatorio_sesion_completada`
   - **Categoría**: Selecciona **"UTILITY"** (Utilidad)
   - **Idioma**: `Español (México)` o `es_MX`
   - **Tipo de contenido**: Selecciona **"TEXT"** o **"TEXT + MEDIA"** si quieres incluir una imagen
4. **Cuerpo del mensaje** (ejemplo):
   ```
   Hola {{1}}, 

   Le recordamos que tiene un trabajo pendiente por recoger en Cabal Studios.

   Esperamos verle pronto.
   ```
5. Si usas variables, usa el formato `{{1}}`, `{{2}}`, etc.
6. Haz clic en **"Enviar para revisión"** o **"Submit for review"**

### Template 2: `recordatorio_fotos_listas_3_meses`

1. Crea una nueva plantilla con el nombre: `recordatorio_fotos_listas_3_meses`
2. **Categoría**: `UTILITY`
3. **Idioma**: `Español (México)` o `es_MX`
4. **Cuerpo del mensaje** (ejemplo):
   ```
   Hola {{1}},

   Esperamos que se encuentre muy bien. Queremos contarle que sus fotografías ya están listas y lo esperan en Cabal Studios.

   Recuerde que podemos almacenarlas hasta por un máximo de 10 meses, así que puede pasar a recogerlas cuando le quede cómodo.

   Estaremos encantados de atenderle.
   ```
5. Envía para revisión

### Template 3: `recordatorio_fotos_listas_10_meses`

1. Crea una nueva plantilla con el nombre: `recordatorio_fotos_listas_10_meses`
2. **Categoría**: `UTILITY`
3. **Idioma**: `Español (México)` o `es_MX`
4. **Cuerpo del mensaje** (ejemplo):
   ```
   Hola {{1}},

   Le saludamos desde Cabal Studios. Queremos informarle que hemos llegado al tiempo máximo de almacenamiento de sus fotografías, por lo que pronto dejaremos de conservarlas.

   Agradecemos mucho su comprensión y quedamos atentos si necesita algo adicional.
   ```
5. Envía para revisión

### Opcional: Agregar Header con Imagen

Si quieres agregar una imagen al header de tus templates:

1. Al crear el template, selecciona **"TEXT + MEDIA"** o **"MEDIA"**
2. En la sección **"Header"**, selecciona **"IMAGE"**
3. Sube tu logo o imagen (recomendado: logo de Cabal Studios)
4. El código en el servicio ya está preparado para manejar componentes con imágenes

> **Importante**: Los templates deben ser aprobados por Meta antes de poder usarlos. El proceso de revisión puede tardar entre 24-48 horas.

## Paso 6: Configurar Variables de Entorno

Una vez que tengas el token y el Phone Number ID:

1. Abre tu archivo `.env` en `fotografo/backend/`
2. Agrega las siguientes variables:

```env
# WhatsApp Business API
WHATSAPP_TOKEN=tu-token-de-acceso-aqui
PHONE_NUMBER_ID=tu-phone-number-id-aqui
```

3. Reemplaza los valores con los que obtuviste en los pasos anteriores

## Paso 7: Verificar la Configuración

1. Asegúrate de que los templates estén **aprobados** (status: "Approved")
2. Verifica que el número de teléfono esté verificado en WhatsApp Business
3. Prueba enviando un recordatorio desde tu aplicación

## Estructura de los Templates

### Variables Disponibles

Los templates pueden usar variables dinámicas con el formato `{{1}}`, `{{2}}`, etc. Si quieres personalizar los mensajes con variables, puedes modificar el servicio `whatsapp.service.ts` para incluir parámetros.

Ejemplo de template con variables:
```
Hola {{1}},

Su recordatorio: {{2}}

Fecha: {{3}}
```

Y en el código, pasarías los componentes:
```typescript
await sendWhatsappReminderMessage(
  phoneNumber,
  "recordatorio_sesion_completada",
  "es_MX",
  [
    {
      type: "body",
      parameters: [
        { type: "text", text: "Juan Pérez" },
        { type: "text", text: "Tiene un trabajo pendiente por recoger" },
        { type: "text", text: "15 de enero de 2024" }
      ]
    }
  ]
);
```

## Solución de Problemas

### Error: "Template not found"
- Verifica que el nombre del template coincida exactamente (case-sensitive)
- Asegúrate de que el template esté aprobado
- Verifica que el idioma sea `es_MX`

### Error: "Invalid phone number"
- El número debe estar en formato internacional sin el símbolo `+`
- Ejemplo: `573001234567` (Colombia) en lugar de `+57 300 123 4567`

### Error: "Invalid access token"
- Verifica que el token no haya expirado
- Regenera el token si es necesario
- Asegúrate de tener los permisos correctos

### Los templates no se envían
- Verifica que los templates estén aprobados
- Revisa los logs de la aplicación para ver errores específicos
- Verifica que el Phone Number ID sea correcto

## Recursos Adicionales

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Guía de Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

## Notas Importantes

1. **Límites de envío**: WhatsApp tiene límites en la cantidad de mensajes que puedes enviar. Revisa la documentación para conocer los límites de tu cuenta.

2. **Costo**: Algunos planes de WhatsApp Business API tienen costos asociados. Revisa la información de precios en Meta.

3. **Pruebas**: Puedes usar el número de teléfono de prueba de Meta para probar sin costo durante el desarrollo.

4. **Producción**: Para producción, asegúrate de:
   - Usar tokens permanentes o implementar renovación automática
   - Configurar webhooks para recibir confirmaciones de entrega
   - Implementar manejo de errores robusto
   - Monitorear los logs de envío

