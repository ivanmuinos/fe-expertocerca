#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Run with: node scripts/analyze-bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analizando bundle de Next.js...\n');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check .next directory
  const nextDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(nextDir)) {
    console.error('❌ .next directory not found');
    process.exit(1);
  }

  // Analyze build output
  const buildManifest = path.join(nextDir, 'build-manifest.json');
  
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    
    console.log('\n✅ Build completado!\n');
    console.log('📊 Páginas generadas:');
    Object.keys(manifest.pages).forEach(page => {
      console.log(`  - ${page}`);
    });
  }

  console.log('\n💡 Para análisis detallado, instala @next/bundle-analyzer:');
  console.log('   npm install -D @next/bundle-analyzer');
  console.log('   ANALYZE=true npm run build');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
