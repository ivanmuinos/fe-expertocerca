# 🚀 Deploy Checklist - Seguridad y Optimización

## ⚠️ ANTES DE DEPLOYAR - CRÍTICO

### 1. Aplicar RLS Policies en Supabase

**Status**: ⏳ PENDIENTE

**Pasos**:

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar el contenido de: `supabase/migrations/20251004_complete_rls_policies.sql`
3. Pegar y ejecutar en SQL Editor
4. Verificar que no hay errores
5. Verificar que las políticas se crearon:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

**Alternativa** (si tienes CLI configurado):

```bash
supabase db push
```

**⚠️ IMPORTANTE**: Sin estas políticas, los datos están vulnerables!

---

### 2. Configurar Variables de Entorno

**Status**: ⏳ PENDIENTE

**En tu hosting (Vercel/Netlify/etc)**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fqbzkljtlghztpkovkte.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key (⚠️ NUNCA commitear)
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NODE_ENV=production
```

**⚠️ CRÍTICO**:

- El `SUPABASE_SERVICE_ROLE_KEY` NUNCA debe estar en el código
- Actualmente está hardcoded en scripts de migración
- Moverlo a variables de entorno antes de deploy

---

### 3. Actualizar Scripts de Migración (OPCIONAL)

**Status**: ⏳ PENDIENTE (solo si usas scripts)

Archivos a actualizar:

- `run-migration.mjs`
- `run-whatsapp-migration.mjs`
- `apply-whatsapp-fix.mjs`

Cambiar:

```javascript
// ❌ ANTES
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGc...";

// ✅ DESPUÉS
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

---

### 4. Verificar Build Local

**Status**: ✅ COMPLETADO

```bash
npm run build
# ✓ Compiled successfully in 12.5s
```

---

### 5. Configurar Storage Bucket en Supabase

**Status**: ⏳ PENDIENTE

1. Ir a Supabase Dashboard → Storage
2. Verificar que existe bucket `portfolio`
3. Configurar:

   - ✅ Public: Yes
   - ✅ File size limit: 5MB
   - ✅ Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

4. Aplicar políticas de storage (ya incluidas en migration)

---

## 🔍 VERIFICACIONES POST-DEPLOY

### 1. Verificar Security Headers

Usar: https://securityheaders.com/

Deberías ver:

- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

**Objetivo**: Score A o A+

---

### 2. Verificar RLS Policies Funcionan

**Test 1**: Intentar acceder a profile de otro usuario

```javascript
// En console del browser de un user logueado
fetch("/api/profiles?userId=otro-user-id");
// Debería retornar: 403 Forbidden
```

**Test 2**: Intentar modificar professional_profile de otro usuario

```javascript
// PUT a /api/professionals/otro-profile-id
// Debería retornar: 403 Forbidden
```

**Test 3**: Intentar eliminar foto de otro usuario

```javascript
// DELETE portfolio photo de otro user
// Debería retornar: 403 Forbidden
```

---

### 3. Verificar Validación de Inputs

**Test**: Enviar datos inválidos a `/api/profile`

```javascript
fetch("/api/profile", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "invalid-phone",
    avatar_url: "not-a-url",
  }),
});
// Debería retornar: 400 Bad Request con detalles de validación
```

---

### 4. Verificar Performance

**Lighthouse Audit**:

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

**Web Vitals**:

- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

### 5. Verificar Funcionalidad Core

Flujo completo:

1. ✅ Login con Google/Email
2. ✅ Completar onboarding
3. ✅ Subir foto de portfolio
4. ✅ Editar perfil
5. ✅ Crear publicación
6. ✅ Ver publicación
7. ✅ Dejar review
8. ✅ Buscar profesionales
9. ✅ Contactar por WhatsApp

---

## 📊 MONITOREO POST-DEPLOY

### Día 1-7: Observación Intensiva

**Métricas a monitorear**:

1. **Supabase Dashboard**:

   - Database Reads/Writes
   - Storage usage
   - Bandwidth
   - Auth requests

2. **Errores**:

   - 400/401/403/500 en API routes
   - Failed auth attempts
   - Failed uploads

3. **Performance**:
   - Page load times
   - API response times
   - Largest Contentful Paint

**Alertas sugeridas**:

- > 1000 errors/day
- > 10,000 failed auth attempts/day
- Response time > 3s
- Cost > $50/mes (si esperabas $35)

---

## 🎯 OPTIMIZACIONES FUTURAS

### Prioridad Alta (Siguiente Sprint)

1. **React Query / SWR** (💰 Reduce costs 80%)

   - Estima: 1-2 días
   - ROI: Muy alto

2. **Image Optimization** (💰 Reduce bandwidth 80%)

   - Estima: 1 día
   - ROI: Alto

3. **Paginación** (💰 Costos constantes)
   - Estima: 1 día
   - ROI: Alto (crítico con growth)

### Prioridad Media

4. **Rate Limiting** (🛡️ Previene abuse)

   - Estima: 1 día
   - ROI: Medio

5. **Audit Logging** (📊 Compliance)
   - Estima: 1 día
   - ROI: Medio

### Prioridad Baja

6. **2FA** (🛡️ Security extra)
   - Estima: 2 días
   - ROI: Bajo (nice to have)

---

## 📞 SOPORTE

Si algo falla post-deploy:

1. **Check Logs**:

   - Vercel/Netlify logs
   - Supabase logs (Dashboard → Logs)
   - Browser console errors

2. **Rollback Plan**:

   ```bash
   # Si hay problemas, rollback a versión anterior
   git revert HEAD
   npm run build
   # Deploy versión anterior
   ```

3. **Verificar RLS**:
   - Si nada funciona, posiblemente RLS está bloqueando todo
   - Temporalmente deshabilitar RLS:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   -- (solo para debug, RE-ENABLE inmediatamente)
   ```

---

## ✅ CHECKLIST FINAL

Antes de marcar como "deployed":

- [ ] RLS policies aplicadas en Supabase
- [ ] Variables de entorno configuradas en hosting
- [ ] Service role key removido del código
- [ ] Build local exitoso
- [ ] Storage bucket configurado
- [ ] Security headers verificados (securityheaders.com)
- [ ] RLS policies testeadas (no se puede acceder a data de otros)
- [ ] Input validation testeada
- [ ] Lighthouse audit > 90 en todas las métricas
- [ ] Flujo completo de usuario testeado
- [ ] Monitoreo configurado (Supabase dashboard)
- [ ] Documentación actualizada (README si aplica)

---

## 🎉 SUCCESS METRICS

**Week 1**:

- Zero security incidents
- < 5% error rate
- Users completan onboarding

**Month 1**:

- Database costs < $50
- Performance score > 90
- User satisfaction > 80%

**Month 3**:

- Implement React Query → costs -80%
- Image optimization → bandwidth -80%
- Scale to 1000+ users sin problemas

---

**¡Buena suerte con el deploy! 🚀**
