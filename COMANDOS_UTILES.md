# 🛠️ Comandos Útiles - ExpertoCerca

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 📊 Análisis de Performance

### Lighthouse

```bash
# Análisis completo
npx lighthouse http://localhost:3000 --view

# Solo performance
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --view

# Desktop
npx lighthouse http://localhost:3000 \
  --preset=desktop \
  --view

# Mobile (default)
npx lighthouse http://localhost:3000 \
  --preset=mobile \
  --view

# Guardar reporte
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-report.html
```

### Bundle Analyzer

```bash
# Instalar (si no está instalado)
npm install -D @next/bundle-analyzer

# Analizar bundle
ANALYZE=true npm run build

# Script personalizado
./scripts/analyze-bundle.sh
```

### Chrome DevTools

```bash
# 1. Abrir Chrome DevTools (F12)
# 2. Performance tab
# 3. Click en Record (●)
# 4. Interactuar con la página
# 5. Stop recording
# 6. Analizar flamegraph

# Network tab
# 1. Abrir DevTools → Network
# 2. Recargar página (Cmd+R / Ctrl+R)
# 3. Verificar:
#    - Tamaño de archivos
#    - Tiempo de carga
#    - Formato de imágenes (WebP/AVIF)
#    - Caché headers
```

## 🔍 Verificación de Optimizaciones

### Verificar Imágenes

```bash
# Buscar etiquetas <img> que no deberían existir
grep -r "<img" src/ --include="*.tsx" --include="*.jsx"

# Buscar importaciones de next/image
grep -r "from 'next/image'" src/ --include="*.tsx" --include="*.jsx"

# Verificar blur placeholders
grep -r "blurDataURL" src/ --include="*.tsx" --include="*.jsx"
```

### Verificar Memoización

```bash
# Buscar componentes memoizados
grep -r "memo(" src/ --include="*.tsx" --include="*.jsx"

# Buscar React.memo
grep -r "React.memo" src/ --include="*.tsx" --include="*.jsx"
```

### Verificar Dynamic Imports

```bash
# Buscar dynamic imports
grep -r "dynamic(" src/ --include="*.tsx" --include="*.jsx"

# Buscar lazy imports
grep -r "React.lazy" src/ --include="*.tsx" --include="*.jsx"
```

### Verificar Console.logs

```bash
# Buscar console.logs (deberían ser mínimos)
grep -r "console.log" src/ --include="*.tsx" --include="*.jsx" --include="*.ts"

# Contar console.logs
grep -r "console.log" src/ --include="*.tsx" --include="*.jsx" --include="*.ts" | wc -l
```

## 📦 Build y Deploy

### Build Local

```bash
# Build completo
npm run build

# Verificar tamaño de archivos
du -sh .next/static/chunks/*

# Ver estructura del build
tree .next/static -L 2
```

### Verificar Build

```bash
# Iniciar servidor de producción local
npm run build && npm start

# Verificar en http://localhost:3000
```

### Deploy (Vercel)

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs
```

## 🧪 Testing

### Type Checking

```bash
# Verificar tipos de TypeScript
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### Linting

```bash
# Ejecutar ESLint
npm run lint

# Fix automático
npm run lint -- --fix

# Verificar archivo específico
npx eslint src/app/page.tsx
```

## 📊 Monitoreo

### Vercel Analytics

```bash
# Ver analytics en dashboard
# https://vercel.com/[tu-proyecto]/analytics

# Métricas disponibles:
# - Real Experience Score
# - Core Web Vitals
# - Page Views
# - Unique Visitors
```

### Web Vitals en Consola

```javascript
// Agregar en layout.tsx o _app.tsx
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
  })
}
```

## 🔧 Troubleshooting

### Imágenes no cargan

```bash
# Verificar configuración de next.config.js
cat next.config.js | grep -A 10 "images:"

# Verificar que la URL está en remotePatterns
# Verificar CORS headers
# Verificar que la imagen existe
```

### Bundle muy grande

```bash
# Analizar bundle
ANALYZE=true npm run build

# Buscar duplicaciones
npx webpack-bundle-analyzer .next/static/chunks/*.js

# Verificar imports
grep -r "import.*from" src/ | sort | uniq -c | sort -rn | head -20
```

### Performance baja

```bash
# Ejecutar Lighthouse
npx lighthouse http://localhost:3000 --view

# Verificar:
# 1. Imágenes optimizadas
# 2. Code splitting
# 3. Caché configurado
# 4. No hay memory leaks

# Chrome DevTools → Performance
# Grabar sesión y buscar:
# - Long tasks (> 50ms)
# - Layout shifts
# - Memory leaks
```

### Errores de Build

```bash
# Limpiar caché
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar dependencias
rm -rf node_modules
npm install

# Build limpio
npm run build
```

## 📝 Scripts Personalizados

### Análisis de Bundle

```bash
# Ejecutar script personalizado
./scripts/analyze-bundle.sh

# Ver archivos más grandes
find .next/static -type f -exec du -h {} \; | sort -rh | head -20
```

### Verificar Optimizaciones

```bash
# Crear script de verificación
cat > scripts/verify-optimizations.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificando optimizaciones..."
echo ""
echo "📊 Imágenes <img> encontradas:"
grep -r "<img" src/ --include="*.tsx" --include="*.jsx" | wc -l
echo ""
echo "✅ Componentes memoizados:"
grep -r "memo(" src/ --include="*.tsx" --include="*.jsx" | wc -l
echo ""
echo "📦 Dynamic imports:"
grep -r "dynamic(" src/ --include="*.tsx" --include="*.jsx" | wc -l
echo ""
echo "🧹 Console.logs:"
grep -r "console.log" src/ --include="*.tsx" --include="*.jsx" --include="*.ts" | wc -l
EOF

chmod +x scripts/verify-optimizations.sh
./scripts/verify-optimizations.sh
```

## 🎯 Comandos Rápidos

```bash
# Build y analizar
npm run build && ./scripts/analyze-bundle.sh

# Build y verificar
npm run build && npm start

# Lighthouse rápido
npx lighthouse http://localhost:3000 --only-categories=performance --view

# Verificar tipos y lint
npx tsc --noEmit && npm run lint

# Limpiar y rebuild
rm -rf .next && npm run build
```

## 📚 Recursos

### Documentación

```bash
# Ver documentación local
cat RESUMEN_OPTIMIZACIONES.md
cat PERFORMANCE_BEST_PRACTICES.md
cat CHECKLIST_OPTIMIZACION.md
```

### Links Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**Tip:** Guarda este archivo como referencia rápida para comandos comunes.
