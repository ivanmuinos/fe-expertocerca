# 🚀 Setup del Proyecto

## 📋 Prerequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Google Cloud (solo para producción)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/experto-cerca.git
cd experto-cerca
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el template
cp .env.example .env.local

# Editar .env.local con tus credenciales
nano .env.local
```

**Variables requeridas:**

```env
# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Moderación (opcional en desarrollo)
ENABLE_IMAGE_MODERATION=false
```

### 4. Ejecutar migraciones en Supabase

1. Ve a tu proyecto en Supabase
2. SQL Editor
3. Ejecuta las migraciones en orden:
   - `supabase/migrations/initial_schema.sql`
   - `supabase/migrations/20251031_add_license_number_complete.sql`
   - `supabase/migrations/20251031_add_moderation_system.sql`

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy a Producción

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_CLOUD_CREDENTIALS` (JSON completo)
   - `ENABLE_IMAGE_MODERATION=true`
3. Deploy automático

## 🔐 Seguridad

- ⚠️ **NUNCA** commitees archivos `.env*` (excepto `.env.example`)
- ⚠️ **NUNCA** expongas credenciales en el código
- ✅ Usa variables de entorno para todo lo sensible
- ✅ Revisa el archivo `SECURITY.md` para más detalles

## 📚 Documentación adicional

- [Moderación de imágenes](./MODERACION_IMAGENES.md)
- [Sistema de matrícula](./MATRICULA_PROFESIONAL.md)
- [Seguridad](../SECURITY.md)

## 🆘 Problemas comunes

### Error: "Unauthorized"
- Verifica que las credenciales de Supabase sean correctas
- Verifica que las políticas RLS estén configuradas

### Error: "Module not found"
- Ejecuta `npm install` de nuevo
- Borra `node_modules` y `.next`, luego reinstala

### Imágenes no se moderan
- Verifica que `ENABLE_IMAGE_MODERATION=true` en producción
- Verifica que `GOOGLE_CLOUD_CREDENTIALS` esté configurada
