#!/bin/bash

# Script para analizar el tamaño del bundle de Next.js
# Uso: ./scripts/analyze-bundle.sh

echo "🔍 Analizando bundle de Next.js..."
echo ""

# Verificar si existe el directorio .next
if [ ! -d ".next" ]; then
  echo "⚠️  No se encontró el directorio .next"
  echo "Ejecutando build primero..."
  npm run build
fi

echo ""
echo "📊 Tamaño de archivos JavaScript:"
echo "=================================="
find .next/static/chunks -name "*.js" -type f -exec du -h {} \; | sort -rh | head -20

echo ""
echo "📊 Tamaño total de chunks:"
echo "=================================="
du -sh .next/static/chunks

echo ""
echo "📊 Páginas más pesadas:"
echo "=================================="
find .next/static -name "*.js" -type f | while read file; do
  size=$(du -h "$file" | cut -f1)
  echo "$size - $(basename $file)"
done | sort -rh | head -10

echo ""
echo "💡 Recomendaciones:"
echo "=================================="
echo "1. Archivos > 100KB: Considerar code splitting"
echo "2. Archivos > 50KB: Revisar imports innecesarios"
echo "3. Usar dynamic imports para componentes pesados"
echo ""
echo "Para análisis detallado, instalar @next/bundle-analyzer:"
echo "npm install -D @next/bundle-analyzer"
echo "ANALYZE=true npm run build"
