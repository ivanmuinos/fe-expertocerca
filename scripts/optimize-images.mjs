#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * This script helps identify and optimize images for better mobile performance.
 * Run: node scripts/optimize-images.mjs
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const MAX_SIZE_KB = 100; // Warn if image is larger than 100KB

async function scanDirectory(dir, results = []) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          await scanDirectory(filePath, results);
        }
      } else if (stats.isFile()) {
        const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          const sizeKB = stats.size / 1024;
          results.push({
            path: filePath,
            size: sizeKB,
            needsOptimization: sizeKB > MAX_SIZE_KB
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return results;
}

async function main() {
  console.log('🔍 Scanning for images...\n');
  
  const publicDir = 'public';
  const images = await scanDirectory(publicDir);
  
  if (images.length === 0) {
    console.log('✅ No images found in public directory');
    return;
  }
  
  console.log(`Found ${images.length} images:\n`);
  
  const needsOptimization = images.filter(img => img.needsOptimization);
  
  images.forEach(img => {
    const status = img.needsOptimization ? '⚠️ ' : '✅';
    console.log(`${status} ${img.path} - ${img.size.toFixed(2)} KB`);
  });
  
  if (needsOptimization.length > 0) {
    console.log(`\n⚠️  ${needsOptimization.length} images need optimization (>${MAX_SIZE_KB}KB)`);
    console.log('\nRecommendations:');
    console.log('1. Use next/image component (already configured)');
    console.log('2. Compress images with tools like:');
    console.log('   - https://squoosh.app/');
    console.log('   - https://tinypng.com/');
    console.log('3. Convert to WebP/AVIF format');
    console.log('4. Use responsive images with srcset');
  } else {
    console.log('\n✅ All images are optimized!');
  }
  
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  console.log(`\nTotal image size: ${totalSize.toFixed(2)} KB`);
}

main().catch(console.error);
