# ✅ Checklist de Optimización Mobile - Performance 84 → 95+

## 🎯 Objetivo
Mejorar el score de Lighthouse Mobile de 84 a 95+ mediante optimizaciones específicas.

## ✅ Optimizaciones Aplicadas

### 1. Optimización de Imágenes (LCP: 3.9s → ~1.5s)
- ✅ **Priority loading** para primeras 2 imágenes del carousel
- ✅ **fetchPriority="high"** en imágenes LCP
- ✅ **loading="eager"** para imágenes above-the-fold
- ✅ **quality=90** para imágenes prioritarias (85 para el resto)
- ✅ Blur placeholder para mejor UX
- ✅ Formatos modernos (AVIF/WebP) ya configurados en next.config.js

**Impacto esperado**: LCP mejora de 3.9s a ~1.5s (60% más rápido)

### 2. Eliminación de Render-Blocking (620ms → ~100ms)
- ✅ **Preconnect** a Google Fonts
- ✅ **DNS-prefetch** para dominios externos
- ✅ **font-display: swap** en Poppins
- ✅ Componentes dinámicos con SSR disabled para JS no crítico

**Impacto esperado**: Render blocking de 620ms a ~100ms (84% más rápido)

### 3. Reducción de JavaScript No Usado (119 KiB)
- ✅ **optimizePackageImports** para Radix UI y Lucide
- ✅ **modularizeImports** para tree-shaking de iconos
- ✅ Archivo centralizado de iconos (icons.ts)
- ✅ Dynamic imports para componentes pesados
- ✅ **swcMinify** habilitado

**Impacto esperado**: Reducción de ~60 KiB de JavaScript

### 4. Optimización de Scroll (Forced Reflows: 29ms → ~5ms)
- ✅ Hook `useOptimizedScroll` con requestAnimationFrame
- ✅ Passive event listeners
- ✅ Batch de lecturas de layout

**Impacto esperado**: Forced reflows de 29ms a ~5ms (80% más rápido)

### 5. Bundle Optimization
- ✅ **compress: true** en Next.js config
- ✅ **experimental.optimizePackageImports** para paquetes grandes
- ✅ Memoización de componentes (ProfessionalCarousel, PublicationCard)

## 📋 Optimizaciones Adicionales Recomendadas

### A. Optimización de CSS No Usado (14 KiB)
```bash
# Instalar PurgeCSS para producción
npm install -D @fullhuman/postcss-purgecss
```

Agregar a `postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: ['./src/**/*.{js,jsx,ts,tsx}'],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      }
    } : {})
  }
}
```

### B. Compresión de Imágenes
```bash
# Ejecutar script de análisis
node scripts/optimize-images.mjs

# Comprimir imágenes manualmente en:
# - https://squoosh.app/
# - https://tinypng.com/
```

**Target**: Reducir 153 KiB → ~50 KiB (67% reducción)

### C. Service Worker para Caching
Crear `public/sw.js`:
```js
const CACHE_NAME = 'expertocerca-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

### D. Prefetch de Rutas Críticas
Agregar a `src/app/layout.tsx`:
```tsx
<link rel="prefetch" href="/buscar" />
<link rel="prefetch" href="/publication" />
```

### E. Reducir Tamaño de Radix UI
Reemplazar imports genéricos:
```tsx
// ❌ Antes
import * as Dialog from "@radix-ui/react-dialog";

// ✅ Después
import { Root, Trigger, Content } from "@radix-ui/react-dialog";
```

## 🎯 Resultados Esperados

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Performance Score** | 84 | 95+ | +13% |
| **LCP** | 3.9s | 1.5s | -61% |
| **TBT** | 170ms | 50ms | -71% |
| **Speed Index** | 3.7s | 2.0s | -46% |
| **JavaScript** | 119 KiB | 60 KiB | -50% |
| **CSS** | 14 KiB | 5 KiB | -64% |
| **Images** | 153 KiB | 50 KiB | -67% |

## 🚀 Comandos Útiles

```bash
# Build optimizado
npm run build

# Analizar bundle
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build

# Test de performance local
npm run build && npm start

# Lighthouse CI
npx lighthouse https://expertocerca.com --view --preset=desktop
npx lighthouse https://expertocerca.com --view --preset=mobile
```

## 📊 Monitoreo Continuo

1. **Lighthouse CI** en cada deploy
2. **Web Vitals** en producción con Next.js Analytics
3. **Bundle size** con size-limit

```bash
# Instalar size-limit
npm install -D @size-limit/preset-next

# Agregar a package.json
"size-limit": [
  {
    "path": ".next/static/**/*.js",
    "limit": "300 KB"
  }
]
```

## 🎓 Mejores Prácticas Aplicadas

- ✅ Lazy loading de imágenes below-the-fold
- ✅ Priority loading de imágenes LCP
- ✅ Code splitting por rutas
- ✅ Dynamic imports para componentes pesados
- ✅ Memoización de componentes
- ✅ Passive event listeners
- ✅ RequestAnimationFrame para scroll
- ✅ Preconnect a dominios externos
- ✅ Font optimization con display: swap
- ✅ Compression habilitado
- ✅ Tree shaking de librerías

## 📝 Notas

- Las optimizaciones son incrementales - cada una suma
- El mayor impacto viene de optimizar LCP (imágenes)
- Render-blocking CSS/JS es el segundo mayor problema
- JavaScript no usado se reduce con tree-shaking
- Forced reflows se eliminan con RAF y passive listeners

## 🔄 Próximos Pasos

1. ✅ Aplicar optimizaciones (HECHO)
2. 🔄 Build y test local
3. 🔄 Deploy a staging
4. 🔄 Lighthouse test en staging
5. 🔄 Deploy a producción
6. 🔄 Monitoreo de Web Vitals

---

**Última actualización**: 2025-10-13
**Score objetivo**: 95+ en mobile
**Score actual**: 84
