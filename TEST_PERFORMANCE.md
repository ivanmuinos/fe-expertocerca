# 🧪 Test de Performance - Guía Rápida

## 🚀 Comandos Rápidos

### 1. Build y Test Local
```bash
# Build optimizado
npm run build

# Iniciar servidor de producción
npm start

# Abrir en navegador
# http://localhost:3000
```

### 2. Lighthouse Test (Chrome DevTools)
1. Abrir Chrome en modo incógnito
2. Ir a `http://localhost:3000`
3. Abrir DevTools (F12)
4. Ir a pestaña "Lighthouse"
5. Seleccionar:
   - ✅ Performance
   - ✅ Mobile
   - ✅ Clear storage
6. Click "Analyze page load"

### 3. Lighthouse CLI
```bash
# Mobile
npx lighthouse http://localhost:3000 \
  --preset=mobile \
  --view \
  --output=html \
  --output-path=./lighthouse-mobile.html

# Desktop
npx lighthouse http://localhost:3000 \
  --preset=desktop \
  --view \
  --output=html \
  --output-path=./lighthouse-desktop.html
```

### 4. Analizar Bundle Size
```bash
# Instalar analyzer
npm install -D @next/bundle-analyzer

# Crear next.config.analyzer.js
cat > next.config.analyzer.js << 'EOF'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(require('./next.config.js'))
EOF

# Analizar
ANALYZE=true npm run build
```

### 5. Verificar Imágenes
```bash
# Ejecutar script de análisis
node scripts/optimize-images.mjs
```

## 📊 Métricas a Verificar

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅

### Lighthouse Scores
- **Performance**: > 90 ✅
- **Accessibility**: > 90 ✅
- **Best Practices**: > 90 ✅
- **SEO**: > 90 ✅

### Específicas
- **TBT** (Total Blocking Time): < 200ms
- **Speed Index**: < 3.4s
- **Time to Interactive**: < 3.8s

## 🎯 Checklist de Verificación

### Antes del Test
- [ ] Build de producción ejecutado
- [ ] Servidor corriendo en modo producción
- [ ] Chrome en modo incógnito
- [ ] Cache limpiado
- [ ] Throttling configurado (Mobile)

### Durante el Test
- [ ] Lighthouse ejecutado en mobile
- [ ] Screenshots capturados
- [ ] Métricas anotadas
- [ ] Oportunidades revisadas

### Después del Test
- [ ] Score >= 95 en Performance
- [ ] LCP < 2.5s
- [ ] TBT < 200ms
- [ ] No hay render-blocking crítico
- [ ] Imágenes optimizadas

## 📸 Comparación Antes/Después

### Antes (Score: 84)
```
Performance: 84
LCP: 3.9s
TBT: 170ms
Speed Index: 3.7s

Problemas:
- Render-blocking: 620ms
- JavaScript no usado: 119 KiB
- CSS no usado: 14 KiB
- Imágenes: 153 KiB
- Forced reflows: 29ms
```

### Después (Score esperado: 95+)
```
Performance: 95+
LCP: ~1.5s
TBT: ~50ms
Speed Index: ~2.0s

Mejoras:
- Render-blocking: ~100ms (-84%)
- JavaScript: ~60 KiB (-50%)
- CSS: ~5 KiB (-64%)
- Imágenes: optimizadas
- Forced reflows: ~5ms (-83%)
```

## 🐛 Troubleshooting

### Si el score no mejora:

1. **Verificar que el build sea de producción**:
   ```bash
   NODE_ENV=production npm run build
   ```

2. **Limpiar cache de Next.js**:
   ```bash
   rm -rf .next
   npm run build
   ```

3. **Verificar que las imágenes tengan priority**:
   ```bash
   grep -r "priority={true}" src/
   ```

4. **Verificar optimizePackageImports**:
   ```bash
   grep "optimizePackageImports" next.config.js
   ```

5. **Verificar que no haya errores en consola**:
   - Abrir DevTools
   - Ver pestaña Console
   - No debe haber errores rojos

## 📝 Reportar Resultados

### Template de Reporte
```markdown
## Resultados Lighthouse Mobile

**Fecha**: [fecha]
**URL**: http://localhost:3000

### Scores
- Performance: [score]/100
- Accessibility: [score]/100
- Best Practices: [score]/100
- SEO: [score]/100

### Core Web Vitals
- LCP: [tiempo]s
- TBT: [tiempo]ms
- CLS: [score]

### Mejoras vs Anterior
- Performance: 84 → [nuevo score] (+[diferencia])
- LCP: 3.9s → [nuevo tiempo] (-[diferencia]s)
- TBT: 170ms → [nuevo tiempo] (-[diferencia]ms)

### Problemas Restantes
- [listar si hay]

### Screenshots
[adjuntar capturas]
```

## 🎓 Tips para Mejor Score

1. **Siempre testear en modo incógnito** - Sin extensiones
2. **Usar throttling mobile** - Simula conexión 4G
3. **Limpiar cache antes de cada test** - Resultados consistentes
4. **Ejecutar múltiples tests** - Promediar resultados
5. **Comparar con competencia** - Benchmark

## 🔗 Recursos Útiles

- [Web.dev Measure](https://web.dev/measure/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Última actualización**: 2025-10-13
