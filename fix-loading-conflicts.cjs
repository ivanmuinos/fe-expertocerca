#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixLoadingConflicts(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Pattern 1: useAuth + useSecureProfessionals conflict
    if (content.includes('useSecureProfessionals') && content.includes('useAuthState')) {
      content = content.replace(
        /const { loading, ([^}]+) } = useSecureProfessionals\(\);/,
        'const { loading: professionalsLoading, $1 } = useSecureProfessionals();'
      );
      content = content.replace(
        /const { user, loading } = useAuthState\(\);/,
        'const { user, loading: authLoading } = useAuthState();'
      );
      changed = true;
    }

    // Pattern 2: useAuth + useState loading conflict
    if (content.includes('useAuthState') && content.includes('setLoading')) {
      content = content.replace(
        /const { user, loading } = useAuthState\(\);[\s\S]*?const \[loading, setLoading\]/,
        'const { user, loading: authLoading } = useAuthState();\n    const [loading, setLoading'
      );
      changed = true;
    }

    // Pattern 3: useMyProfessionalProfiles conflict
    if (content.includes('useMyProfessionalProfiles') && content.includes('useAuthState')) {
      content = content.replace(
        /const { loading, ([^}]+) } = useMyProfessionalProfiles\(\);/,
        'const { loading: profilesLoading, $1 } = useMyProfessionalProfiles();'
      );
      changed = true;
    }

    // Pattern 4: useProfiles conflict
    if (content.includes('useProfiles') && content.includes('useAuthState')) {
      content = content.replace(
        /const { ([^,]+), loading } = useProfiles\(\);/,
        'const { $1, loading: profilesLoading } = useProfiles();'
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed loading conflicts in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
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
        fixLoadingConflicts(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
  }
}

console.log('🔧 Fixing loading variable conflicts...');
processDirectory('./src/pages');
console.log('✨ Loading conflicts fixed!');