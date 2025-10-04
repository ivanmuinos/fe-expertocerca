# 🔒 Reporte de Optimización y Seguridad - Experto Cerca

## 📊 Análisis de Costos Supabase

### Problemas Identificados

#### 1. **Queries Duplicadas en APIs** (Alto Impacto 💰💰💰)

- **`/api/my-profiles/[id]`** hace 2 queries separadas (professional_profiles + profiles)
- **`/api/professionals/[id]`** hace 3 queries (professional_profiles + profiles + auth.users)
- **`/api/my-profiles`** hace 2 queries (professional_profiles + profiles)
- **Costo estimado**: ~3-4x más requests de lo necesario

**Solución**: Usar JOINs en RPC functions o consolidar queries

#### 2. **Sin Caché en Client** (Alto Impacto 💰💰💰)

- Cada navegación hace fetch completo
- Home page refetch en cada visita
- Profile data se refetch múltiples veces
- **Costo estimado**: ~10x más requests con usuarios activos

**Solución**: Implementar React Query / SWR con stale-while-revalidate

#### 3. **Auth Session Checks Redundantes** (Medio Impacto 💰💰)

- Cada API route llama `supabase.auth.getSession()`
- Multiple components verifican auth state
- **Costo estimado**: ~100-200 auth checks/usuario/día

**Solución**: Middleware centralizado + cache de session

#### 4. **Falta de Paginación** (Alto Impacto Futuro 💰💰💰)

- `discover_professionals()` y `browse_professionals()` devuelven ALL records
- Portfolio photos sin límite
- Reviews sin límite
- **Costo estimado**: Crece linealmente con data (1000 profesionales = 1000 rows cada request)

**Solución**: Implementar paginación cursor-based

#### 5. **Imágenes sin Optimización** (Alto Impacto 💰💰💰)

- Portfolio photos se suben en tamaño original
- Sin resize/compress
- Sin CDN caching headers
- **Costo estimado**: ~100-500KB por foto vs ~20-50KB optimizado

**Solución**: Image optimization en upload + Next.js Image component

#### 6. **console.log en Producción** (Bajo Impacto)

- Debug logs en todas las API routes
- Innecesario en producción

---

## 🛡️ Análisis de Seguridad OWASP Top 10

### ✅ A01: Broken Access Control (CRÍTICO)

**Vulnerabilidades Encontradas:**

1. **RLS Policies Incompletas**

   ```sql
   -- professional_profiles: Solo tiene policy de UPDATE para owners
   -- Falta policy para DELETE, INSERT
   ```

2. **Admin Client Expuesto**

   ```typescript
   // /api/professionals/[id]/route.ts usa admin client sin validación
   const adminClient = createSupabaseAdminClient();
   // Cualquiera puede ver cualquier perfil (OK para discovery)
   // PERO: getUserById expone metadata sensible sin validación
   ```

3. **Portfolio Photos: Sin verificación de ownership en DELETE**
   ```typescript
   // usePortfolio.deletePortfolioPhoto() no verifica ownership antes de delete
   ```

**Recomendaciones:**

- ✅ Agregar RLS policies completas para todas las tablas
- ✅ Limitar uso de admin client
- ✅ Verificar ownership en todas las operaciones CRUD

---

### ✅ A02: Cryptographic Failures (MEDIO)

**Vulnerabilidades Encontradas:**

1. **Service Role Key Hardcoded**

   ```javascript
   // run-migration.mjs, run-whatsapp-migration.mjs
   const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGc..."; // ❌ Hardcoded
   ```

2. **Sin HTTPS Enforcement**

   - No hay headers de seguridad en `next.config.js`
   - Falta HSTS, CSP

3. **Datos Sensibles en Logs**
   ```typescript
   console.log("[API] Profile row:", profileRow); // Expone whatsapp_phone
   console.log("[API] User metadata:", userMetadata);
   ```

**Recomendaciones:**

- ✅ Mover keys a `.env` (NUNCA commitear)
- ✅ Agregar security headers
- ✅ Eliminar logs sensibles

---

### ✅ A03: Injection (ALTO)

**Vulnerabilidades Encontradas:**

1. **Sin Validación de Inputs**

   ```typescript
   // /api/profile PUT - acepta cualquier dato sin validar
   const { phone, whatsapp_phone, avatar_url } = body || {};
   // No valida formato de phone, URL, etc.
   ```

2. **Sin Sanitización de Strings**

   ```typescript
   // FormData.description no sanitiza HTML/scripts
   // Potencial XSS si se renderiza como HTML
   ```

3. **SQL Injection (Mitigado por Supabase)**
   - ✅ Supabase usa prepared statements
   - ✅ RPC functions son seguras

**Recomendaciones:**

- ✅ Usar Zod/Yup para validar todos los inputs
- ✅ Sanitizar strings con DOMPurify
- ✅ Validar tipos y formatos

---

### ✅ A04: Insecure Design (MEDIO)

**Vulnerabilidades Encontradas:**

1. **Sin Rate Limiting**

   - Cualquier endpoint puede ser bombardeado
   - Especialmente crítico en:
     - `/api/auth/*`
     - `/api/professionals` (costoso)
     - `/api/portfolio/*` (uploads)

2. **Sin CAPTCHA en Forms**

   - Onboarding puede ser automatizado
   - Reviews pueden ser spam

3. **Sin Validación de File Types**
   ```typescript
   // EditableAvatar acepta cualquier archivo
   // Potencial upload de malware/scripts
   ```

**Recomendaciones:**

- ✅ Implementar rate limiting (Upstash Redis)
- ✅ Agregar CAPTCHA en forms críticos
- ✅ Validar MIME types en uploads

---

### ✅ A05: Security Misconfiguration (MEDIO)

**Vulnerabilidades Encontradas:**

1. **Debug Mode en Producción**

   ```typescript
   console.log("API: my-profiles GET called"); // ❌
   console.log("[API] Error fetching profile:", profileError);
   ```

2. **Headers de Seguridad Faltantes**

   - Sin `X-Frame-Options`
   - Sin `X-Content-Type-Options`
   - Sin `Content-Security-Policy`
   - Sin `Referrer-Policy`

3. **CORS muy permisivo**
   ```typescript
   "Access-Control-Allow-Origin": "*" // ❌ Muy amplio
   ```

**Recomendaciones:**

- ✅ Remover debug logs
- ✅ Agregar security headers
- ✅ Restringir CORS a dominios específicos

---

### ✅ A06: Vulnerable Components (BAJO)

**Estado Actual:**

- Paquetes actualizados (Next.js 15.5.3, React 19)
- ✅ Sin vulnerabilidades críticas conocidas

**Recomendaciones:**

- ✅ Ejecutar `npm audit` regularmente
- ✅ Automatizar updates con Dependabot

---

### ✅ A07: Authentication Failures (CRÍTICO)

**Vulnerabilidades Encontradas:**

1. **Session Expiration Sin Manejo**

   ```typescript
   // No hay refresh automático de tokens
   // Usuario queda logueado indefinidamente
   ```

2. **Sin 2FA**

   - Solo email/password o OAuth
   - Crítico para profesionales

3. **Password Policy Débil**

   - Supabase default (8 chars)
   - Sin requisitos de complejidad

4. **Sin Logout en Todos los Dispositivos**
   - Compromiso de cuenta = acceso permanente

**Recomendaciones:**

- ✅ Implementar token refresh
- ✅ Agregar 2FA opcional
- ✅ Enforcer password policy fuerte
- ✅ Agregar "logout all devices"

---

### ✅ A08: Software and Data Integrity (MEDIO)

**Vulnerabilidades Encontradas:**

1. **Sin SRI (Subresource Integrity)**

   - CDN resources sin hash verification

2. **Migrations sin Rollback**

   - Cambios de schema irreversibles
   - Sin testing en staging

3. **Sin Backup Automatizado**
   - Data loss risk

**Recomendaciones:**

- ✅ Agregar SRI para CDN resources
- ✅ Implementar migration testing
- ✅ Configurar backups automáticos en Supabase

---

### ✅ A09: Security Logging Failures (ALTO)

**Vulnerabilidades Encontradas:**

1. **Sin Logging de Eventos de Seguridad**

   - Login failures
   - Unauthorized access attempts
   - Profile modifications
   - Data exports

2. **Sin Monitoring**

   - No hay alertas de actividad sospechosa
   - No hay dashboards de seguridad

3. **Logs en Console (Volátiles)**
   - Se pierden al reiniciar
   - No auditables

**Recomendaciones:**

- ✅ Implementar logging centralizado (Sentry, LogRocket)
- ✅ Alertas de seguridad
- ✅ Audit trail en Supabase

---

### ✅ A10: Server-Side Request Forgery (BAJO)

**Vulnerabilidades Encontradas:**

1. **Potencial SSRF en Image URLs**
   ```typescript
   // avatar_url acepta cualquier URL
   // Podría apuntar a internal services
   ```

**Recomendaciones:**

- ✅ Validar URLs contra whitelist
- ✅ Usar signed URLs para uploads

---

## 🚀 Plan de Implementación (Priorizado)

### Fase 1: Quick Wins (1-2 días) 🔥

1. **Remover console.logs de producción**
2. **Agregar security headers en `next.config.js`**
3. **Mover service role key a .env**
4. **Agregar RLS policies faltantes**
5. **Validar file types en uploads**

### Fase 2: Optimización de Costos (3-5 días) 💰

1. **Implementar React Query para caching**
2. **Consolidar queries duplicadas**
3. **Agregar paginación a listings**
4. **Optimizar images en upload**
5. **Implementar CDN caching headers**

### Fase 3: Seguridad Avanzada (5-7 días) 🛡️

1. **Implementar rate limiting**
2. **Agregar input validation con Zod**
3. **Implementar audit logging**
4. **Agregar 2FA**
5. **Implementar token refresh**

### Fase 4: Monitoreo (2-3 días) 📊

1. **Integrar Sentry para error tracking**
2. **Configurar alertas de seguridad**
3. **Dashboard de métricas de uso**
4. **Configurar backups automáticos**

---

## 📈 Estimación de Ahorro

### Costos Actuales (estimado para 1000 usuarios activos/mes)

- **Database Reads**: ~500,000 reads/mes ($25)
- **Auth**: ~100,000 MAU ($0 en free tier hasta 50k)
- **Storage**: ~10GB ($1)
- **Bandwidth**: ~100GB ($9)
- **TOTAL**: ~$35/mes

### Con Optimizaciones

- **Database Reads**: ~100,000 reads/mes ($5) - **80% reducción**
- **Auth**: ~100,000 MAU ($0)
- **Storage**: ~5GB ($0.50) - **50% reducción** (image optimization)
- **Bandwidth**: ~20GB ($1.80) - **80% reducción** (CDN + cache)
- **TOTAL**: ~$7.30/mes

### **Ahorro: ~$28/mes (80%) o $336/año**

Con 10,000 usuarios activos:

- **Sin optimización**: ~$350/mes
- **Con optimización**: ~$70/mes
- **Ahorro**: ~$280/mes o **$3,360/año**

---

## 🎯 Métricas de Éxito

- ✅ Reducir database reads en 80%
- ✅ Reducir bandwidth en 80%
- ✅ Pasar audit de seguridad OWASP
- ✅ Reducir tiempo de carga en 50%
- ✅ Zero security incidents en 6 meses
