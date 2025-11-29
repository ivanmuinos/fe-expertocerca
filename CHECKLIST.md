# ✅ Checklist de Implementación

## Pasos para Activar la Funcionalidad

### 1. Dependencias
- [x] Instalar @capacitor/camera
```bash
npm install @capacitor/camera
```

### 2. Base de Datos (Supabase)

#### Crear Tabla
- [ ] Ir a Supabase SQL Editor
- [ ] Copiar contenido de `supabase/migrations/create_service_requests_table.sql`
- [ ] Ejecutar el SQL
- [ ] Verificar que la tabla `service_requests` existe

#### Configurar Storage
- [ ] Ir a Storage en Supabase
- [ ] Crear bucket `public-images` (si no existe)
- [ ] Marcar como público
- [ ] Ejecutar políticas de storage (ver `SUPABASE_SETUP.md`)

### 3. Permisos Móviles

#### iOS
- [ ] Abrir `ios/App/App/Info.plist`
- [ ] Agregar permisos de cámara y galería:
```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para tomar fotos de tu problema</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tu galería para seleccionar fotos</string>
```

#### Android
- [ ] Abrir `android/app/src/main/AndroidManifest.xml`
- [ ] Agregar permisos:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### 4. Sincronizar Capacitor
- [ ] Ejecutar build y sync:
```bash
npm run capacitor:build
```

### 5. Testing

#### Web
- [ ] Iniciar servidor de desarrollo: `npm run dev`
- [ ] Iniciar sesión en la app
- [ ] Click en botón "Publicar" (circular elevado)
- [ ] Verificar que aparece el modal con 2 opciones
- [ ] Seleccionar "Necesito un Experto"
- [ ] Completar formulario
- [ ] Subir foto desde galería
- [ ] Publicar solicitud
- [ ] Verificar que aparece en `/solicitudes`

#### Móvil (iOS)
- [ ] Ejecutar: `npm run capacitor:run:ios`
- [ ] Iniciar sesión
- [ ] Click en botón "Publicar"
- [ ] Seleccionar "Necesito un Experto"
- [ ] Probar botón "Tomar Foto"
- [ ] Verificar que abre la cámara
- [ ] Tomar foto y confirmar
- [ ] Completar formulario
- [ ] Publicar solicitud

#### Móvil (Android)
- [ ] Ejecutar: `npm run capacitor:run:android`
- [ ] Repetir pasos de iOS

### 6. Verificación de Funcionalidades

#### Crear Solicitud
- [ ] Modal de selección funciona
- [ ] Formulario valida campos requeridos
- [ ] Selector de categoría muestra todas las opciones
- [ ] Botón de cámara funciona en móvil
- [ ] Botón de galería funciona
- [ ] Preview de fotos se muestra
- [ ] Se pueden eliminar fotos individuales
- [ ] Límite de 5 fotos funciona
- [ ] Subida de fotos muestra progreso
- [ ] Solicitud se crea correctamente
- [ ] Redirección a `/solicitudes` funciona

#### Ver Solicitudes
- [ ] Lista de solicitudes se carga
- [ ] Filtro por categoría funciona
- [ ] Tarjetas muestran información correcta
- [ ] Fotos se muestran en grid
- [ ] Click en tarjeta abre detalle
- [ ] Botones de contacto funcionan

#### Detalle de Solicitud
- [ ] Información completa se muestra
- [ ] Fotos se muestran en grid
- [ ] Botones de contacto funcionan
- [ ] Botón "Llamar" abre teléfono
- [ ] Botón "Email" abre cliente de email

#### Mis Solicitudes
- [ ] Lista de mis solicitudes se carga
- [ ] Botón eliminar funciona
- [ ] Confirmación de eliminación aparece
- [ ] Solicitud se elimina correctamente

### 7. UI/UX

#### Navbar Mobile
- [ ] Botón "Publicar" está elevado
- [ ] Animación de pulso funciona
- [ ] Gradiente se ve correctamente
- [ ] Sombra y ring están presentes
- [ ] Click abre modal

#### Modal de Selección
- [ ] Diseño es claro y atractivo
- [ ] Iconos se muestran correctamente
- [ ] Hover effects funcionan
- [ ] Click en opciones funciona
- [ ] Modal se cierra correctamente

#### Responsive
- [ ] Funciona en móvil (< 640px)
- [ ] Funciona en tablet (640px - 1024px)
- [ ] Funciona en desktop (> 1024px)
- [ ] Botón de cámara solo en móvil

### 8. Performance

#### Carga
- [ ] Lista de solicitudes carga rápido
- [ ] Imágenes se cargan progresivamente
- [ ] Skeleton loaders se muestran

#### Cache
- [ ] React Query cachea solicitudes
- [ ] Invalidación funciona después de crear
- [ ] Invalidación funciona después de eliminar

### 9. Seguridad

#### RLS Policies
- [ ] Solo usuarios autenticados pueden crear
- [ ] Solo el dueño puede editar/eliminar
- [ ] Cualquiera puede ver solicitudes abiertas
- [ ] El dueño puede ver sus solicitudes cerradas

#### Storage Policies
- [ ] Cualquiera puede ver fotos públicas
- [ ] Solo autenticados pueden subir
- [ ] Solo el dueño puede eliminar sus fotos

### 10. Errores y Edge Cases

#### Manejo de Errores
- [ ] Error de red muestra toast
- [ ] Error de subida muestra mensaje
- [ ] Error de validación muestra en formulario
- [ ] Error 404 muestra página apropiada

#### Edge Cases
- [ ] Sin solicitudes muestra empty state
- [ ] Sin fotos funciona correctamente
- [ ] Sin contacto funciona correctamente
- [ ] Solicitud sin usuario muestra placeholder

## 🎯 Resultado Esperado

Al completar todos los pasos:

1. ✅ Botón "Publicar" elevado y animado en navbar
2. ✅ Modal de selección funcional
3. ✅ Formulario completo con validación
4. ✅ Subida de fotos desde cámara y galería
5. ✅ Lista de solicitudes con filtros
6. ✅ Detalle de solicitud completo
7. ✅ Gestión de mis solicitudes
8. ✅ Todo responsive y optimizado

## 🐛 Si Algo No Funciona

1. Verificar logs de consola
2. Verificar Network tab en DevTools
3. Verificar Supabase logs
4. Revisar `SUPABASE_SETUP.md`
5. Revisar `IMPLEMENTACION_COMPLETA.md`

## 📞 Testing de Contacto

Para probar los botones de contacto:

1. Crear solicitud con teléfono: `+54 9 11 1234-5678`
2. Crear solicitud con email: `test@example.com`
3. Verificar que botones aparecen
4. Click en "Llamar" debe abrir app de teléfono
5. Click en "Email" debe abrir cliente de email

## ✨ Extras Opcionales

- [ ] Agregar notificaciones push
- [ ] Agregar sistema de chat
- [ ] Agregar geolocalización
- [ ] Agregar búsqueda por texto
- [ ] Agregar filtros avanzados
- [ ] Agregar sistema de valoraciones

---

**¡Marca cada item cuando lo completes!** ✅
