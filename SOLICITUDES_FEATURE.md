# Feature: Necesito un Experto (Solicitudes de Servicios)

## Resumen

Se ha implementado la funcionalidad completa de "Necesito un Experto", que permite a los usuarios publicar solicitudes de servicios y a los profesionales responder a ellas.

## Cambios Implementados

### 1. Estructura de Features
- ✅ `src/features/service-requests/` - Nueva feature completa
  - `types/` - Tipos TypeScript
  - `services/` - Servicio de API
  - `hooks/` - React Query hooks
  - `components/` - Componentes reutilizables

### 2. Componentes Creados

#### `ServiceRequestForm`
Formulario completo para crear solicitudes con:
- Selector de categoría (mismas categorías de oficios)
- Título y descripción
- Ubicación (ciudad y provincia)
- Información de contacto (teléfono y email)
- Subida de fotos (hasta 5)
- Validación con Zod

#### `PhotoUploader`
Componente para subir fotos con:
- Botón para tomar foto (móvil) usando Capacitor Camera
- Botón para subir desde galería
- Preview de imágenes
- Límite de 5 fotos
- Eliminación individual

#### `ServiceRequestCard`
Tarjeta para mostrar solicitudes con:
- Avatar y nombre del usuario
- Badge de estado (abierta/cerrada/resuelta)
- Categoría y fecha
- Descripción resumida
- Ubicación
- Preview de fotos
- Botones de contacto

#### `PublishTypeModal`
Modal de selección que aparece al hacer clic en "Publicar":
- Opción "Soy Profesional" → Flujo de onboarding existente
- Opción "Necesito un Experto" → Nuevo flujo de solicitud

### 3. Rutas Creadas

#### Frontend
- `/solicitudes` - Lista de todas las solicitudes abiertas
- `/solicitudes/nueva` - Formulario para crear solicitud
- `/solicitudes/[id]` - Detalle de una solicitud

#### API
- `GET /api/service-requests` - Listar solicitudes (con filtros)
- `POST /api/service-requests` - Crear solicitud
- `GET /api/service-requests/my-requests` - Mis solicitudes
- `GET /api/service-requests/[id]` - Detalle de solicitud
- `PUT /api/service-requests/[id]` - Actualizar solicitud
- `DELETE /api/service-requests/[id]` - Eliminar solicitud

### 4. Navbar Mobile Mejorado

El botón "Publicar" ahora:
- ✅ Está elevado sobre el navbar (-mt-8)
- ✅ Tiene un diseño circular con gradiente
- ✅ Animación de pulso sutil
- ✅ Sombra y ring para destacar
- ✅ Abre el modal de selección de tipo

### 5. Base de Datos

Tabla `service_requests` con:
- Campos principales (categoría, título, descripción, ubicación)
- Información de contacto opcional
- Array de fotos
- Estado (open/closed/resolved)
- Timestamps
- RLS policies configuradas
- Índices para performance

## Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install @capacitor/camera
```

### 2. Crear Tabla en Supabase
Ejecuta el archivo de migración en tu proyecto de Supabase:
```bash
supabase/migrations/create_service_requests_table.sql
```

O copia y pega el contenido en el SQL Editor de Supabase.

### 3. Configurar Capacitor (para cámara en móvil)

#### iOS
Agrega a `ios/App/App/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para tomar fotos de tu problema</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tu galería para seleccionar fotos</string>
```

#### Android
Agrega a `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### 4. Sincronizar Capacitor
```bash
npm run capacitor:build
```

## Flujo de Usuario

### Para Usuarios que Necesitan un Experto:

1. Click en botón "Publicar" (elevado en navbar)
2. Seleccionar "Necesito un Experto"
3. Completar formulario:
   - Categoría del servicio
   - Título descriptivo
   - Descripción detallada
   - Ubicación
   - Contacto (opcional)
   - Fotos (opcional, hasta 5)
4. Publicar solicitud
5. Los profesionales pueden ver y contactar

### Para Profesionales:

1. Ver solicitudes en `/solicitudes`
2. Filtrar por categoría
3. Ver detalles de solicitud
4. Contactar al usuario (teléfono/email)

## Características Técnicas

### React Query
- Cache de 5 minutos para solicitudes
- Invalidación automática después de crear/actualizar/eliminar
- Loading states optimizados

### Validación
- Zod schema para validación de formularios
- Validación en frontend y backend
- Mensajes de error descriptivos

### Responsive
- Diseño mobile-first
- Adaptado para tablet y desktop
- Botón de cámara solo en móvil

### Seguridad
- RLS policies en Supabase
- Verificación de ownership
- Autenticación requerida para crear/editar

## Próximos Pasos Sugeridos

1. **Storage de Fotos**: Implementar subida real a Supabase Storage
2. **Notificaciones**: Alertar a profesionales de nuevas solicitudes en su categoría
3. **Chat**: Sistema de mensajería entre usuario y profesional
4. **Valoraciones**: Sistema de reviews para solicitudes resueltas
5. **Búsqueda Avanzada**: Filtros por ubicación, fecha, etc.
6. **Mis Solicitudes**: Sección en el perfil para gestionar solicitudes propias

## Testing

Para probar la funcionalidad:

1. Inicia sesión en la app
2. Click en el botón "Publicar" (el circular elevado)
3. Selecciona "Necesito un Experto"
4. Completa el formulario
5. Toma una foto o sube desde galería
6. Publica la solicitud
7. Ve a `/solicitudes` para ver todas las solicitudes

## Notas

- Las fotos actualmente se guardan como File objects. Necesitarás implementar la subida a Supabase Storage.
- El componente PhotoUploader usa dynamic import para Capacitor Camera para evitar errores en web.
- La animación del botón está en `globals.css` como `animate-pulse-subtle`.
