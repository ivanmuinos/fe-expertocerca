#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import mappings for src/ structure
const importMappings = {
  // Update paths to use src/
  '@/app/': '@/src/app/',
  '@/components/': '@/src/shared/components/',
  '@/hooks/': '@/src/shared/hooks/',
  '@/lib/': '@/src/shared/lib/',
  '@/stores/': '@/src/shared/stores/',
  '@/integrations/': '@/src/integrations/',

  // Keep existing src/ paths as-is
  '@/src/features/': '@/src/features/',
  '@/src/config/': '@/src/config/',
  '@/src/shared/': '@/src/shared/',
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Apply import mappings
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      if (content.includes(oldImport)) {
        const regex = new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, newImport);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        updateFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
  }
}

console.log('🚀 Updating imports for src/ structure...');
processDirectory('./src');
console.log('✨ Import updates completed!');