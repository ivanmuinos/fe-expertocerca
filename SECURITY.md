# 🔒 Seguridad

## ✅ Qué está en el repositorio público

Este repositorio contiene:

- ✅ **Código fuente** - Lógica de la aplicación
- ✅ **Migraciones SQL** - Estructura de la base de datos (sin datos)
- ✅ **Schemas y tipos** - Definiciones de TypeScript
- ✅ **Documentación** - Guías y READMEs
- ✅ `.env.example` - Template de variables de entorno (sin valores reales)

## ❌ Qué NO está en el repositorio

Información sensible que está protegida por `.gitignore`:

- ❌ `.env.local` - Variables de entorno locales
- ❌ `.env` - Variables de entorno
- ❌ Credenciales de Google Cloud
- ❌ API Keys de Supabase
- ❌ Tokens de acceso
- ❌ Datos de usuarios

## 🔐 Variables de entorno requeridas

Para ejecutar este proyecto necesitás configurar:

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Google Cloud Vision (solo producción)
```env
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
ENABLE_IMAGE_MODERATION=true
```

Ver `.env.example` para más detalles.

## 🚨 Si encontrás una vulnerabilidad

Por favor reportala de forma privada a: [tu-email@ejemplo.com]

**NO** abras un issue público con detalles de seguridad.

## 📋 Checklist de seguridad

Antes de hacer commit:

- [ ] No hay API keys hardcodeadas
- [ ] No hay credenciales en el código
- [ ] `.env.local` está en `.gitignore`
- [ ] Solo templates en `.env.example`
- [ ] No hay datos de usuarios en el código

## 🔄 Rotación de credenciales

Si accidentalmente commiteas credenciales:

1. **Inmediatamente** rota las credenciales en:
   - Supabase Dashboard
   - Google Cloud Console
   - Vercel Environment Variables

2. Elimina el commit con las credenciales:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. Force push (con cuidado):
   ```bash
   git push origin --force --all
   ```

## 🛡️ Mejores prácticas

1. **Nunca** hagas commit de archivos `.env*` (excepto `.env.example`)
2. **Siempre** usa variables de entorno para credenciales
3. **Rota** las credenciales regularmente
4. **Revisa** los commits antes de push
5. **Usa** GitHub Secrets para CI/CD

## 📚 Recursos

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Google Cloud Security](https://cloud.google.com/security/best-practices)
