#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import mappings for migration
const importMappings = {
  // Old auth imports
  '@/hooks/useAuth': '@/src/features/auth',

  // Old component imports
  '@/components/ui/': '@/src/shared/components/ui/',
  '@/hooks/use-toast': '@/src/shared/hooks/use-toast',
  '@/hooks/use-mobile': '@/src/shared/hooks/use-mobile',
  '@/lib/utils': '@/src/shared/lib/utils',
  '@/integrations/supabase/client': '@/src/config/supabase',

  // Professional hooks
  '@/hooks/useMyProfessionalProfiles': '@/src/features/professionals',
  '@/hooks/useSecureProfessionals': '@/src/features/professionals',
  '@/hooks/useProfiles': '@/src/features/user-profile',
  '@/hooks/usePortfolio': '@/src/features/user-profile',
  '@/hooks/useReviews': '@/src/features/user-profile',

  // Onboarding hooks
  '@/hooks/useOnboardingStatus': '@/src/features/onboarding',
  '@/hooks/useUserRedirect': '@/src/features/onboarding',
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Apply import mappings
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      const regex = new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldImport)) {
        content = content.replace(regex, newImport);
        changed = true;
      }
    }

    // Special case: update useAuth imports to use useAuthState where appropriate
    if (content.includes('const { user }') && content.includes('useAuth')) {
      content = content.replace(/import.*useAuth.*from.*/, 'import { useAuthState } from \'@/src/features/auth\'');
      content = content.replace(/const.*useAuth\(\)/, 'const { user, loading } = useAuthState()');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Migrated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
  }
}

function migrateDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        migrateDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        migrateFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
  }
}

console.log('🚀 Starting import migration...');
migrateDirectory('./components');
migrateDirectory('./app');
migrateDirectory('./src');
console.log('✨ Migration completed!');