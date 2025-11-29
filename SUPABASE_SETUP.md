# Configuración de Supabase para Solicitudes de Servicios

## 1. Crear la Tabla

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Ver archivo: supabase/migrations/create_service_requests_table.sql
```

O copia el contenido del archivo `supabase/migrations/create_service_requests_table.sql` y ejecútalo en Supabase.

## 2. Configurar Storage para Fotos

### Crear el Bucket

1. Ve a Storage en tu proyecto de Supabase
2. Crea un nuevo bucket llamado `public-images` (si no existe)
3. Marca como público

### Configurar Políticas de Storage

Ejecuta este SQL para las políticas de storage:

```sql
-- Policy: Anyone can view public images
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-images');

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Estructura de Carpetas

Las fotos se guardarán en:
```
public-images/
  └── service-requests/
      ├── [random-id]-[timestamp].jpg
      ├── [random-id]-[timestamp].png
      └── ...
```

## 3. Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## 4. Verificar Configuración

Para verificar que todo está configurado correctamente:

1. Inicia sesión en la app
2. Ve a "Publicar" → "Necesito un Experto"
3. Intenta subir una foto
4. Verifica en Supabase Storage que la foto se subió correctamente

## 5. Límites y Consideraciones

### Límites de Storage
- Máximo 5 fotos por solicitud
- Tamaño máximo por foto: 5MB (configurable)
- Formatos aceptados: JPG, PNG, WEBP

### Optimización
- Las fotos se suben antes de crear la solicitud
- Si falla la subida, no se crea la solicitud
- Se muestra progreso durante la subida

### Limpieza
Considera crear una función de limpieza para eliminar fotos huérfanas:

```sql
-- Función para limpiar fotos no utilizadas (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_orphaned_photos()
RETURNS void AS $$
BEGIN
  -- Implementar lógica de limpieza
  -- Eliminar fotos que no están referenciadas en service_requests
END;
$$ LANGUAGE plpgsql;
```

## 6. Monitoreo

Puedes monitorear el uso de storage en:
- Supabase Dashboard → Storage → Usage
- Verifica el tamaño total del bucket
- Revisa las políticas de acceso

## Troubleshooting

### Error: "Failed to upload photo"
- Verifica que el bucket `public-images` existe
- Verifica que las políticas de storage están configuradas
- Verifica que el usuario está autenticado

### Error: "Bucket not found"
- Crea el bucket `public-images` en Supabase Storage
- Marca el bucket como público

### Las fotos no se muestran
- Verifica que las URLs son públicas
- Verifica que las políticas de SELECT están configuradas
- Verifica que las fotos se guardaron correctamente en la base de datos
