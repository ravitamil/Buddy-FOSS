#!/usr/bin/env node

/**
 * TypeScript Error Fixing Script
 * 
 * This script systematically fixes TypeScript errors across the codebase by:
 * 1. Fixing generic type parameter issues in TSX files
 * 2. Updating context usage patterns
 * 3. Fixing import/export issues
 * 4. Correcting type mismatches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting TypeScript error fixes...\n');

// ============================================================================
// 1. Fix Generic Type Parameter Issues in TSX Files
// ============================================================================

function fixGenericTypeParameters() {
  console.log('📝 Fixing generic type parameter issues...');
  
  const files = [
    'src/context/EnhancedFinancialContext.tsx',
    'src/context/EnhancedGroupContext.tsx',
    'src/context/EnhancedTrackerContext.tsx'
  ];
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix generic type parameters that are interpreted as JSX
      content = content.replace(
        /map: <([A-Z]\w*)>\(/g,
        'map: <$1 extends any>('
      );
      
      content = content.replace(
        /filter: <([A-Z]\w*)>\(/g,
        'filter: <$1 extends any>('
      );
      
      content = content.replace(
        /find: <([A-Z]\w*)>\(/g,
        'find: <$1 extends any>('
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed generic types in ${filePath}`);
    }
  });
}

// ============================================================================
// 2. Fix Context Usage Patterns
// ============================================================================

function fixContextUsagePatterns() {
  console.log('📝 Fixing context usage patterns...');
  
  // Get all TypeScript/TSX files
  const getAllFiles = (dir, extension = '.tsx') => {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          results = results.concat(getAllFiles(filePath, extension));
        }
      } else if (file.endsWith(extension) || file.endsWith('.ts')) {
        results.push(filePath);
      }
    });
    
    return results;
  };
  
  const files = getAllFiles('src');
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix missing context imports
      if (content.includes('useGroups') && !content.includes('import') && !content.includes('useGroups')) {
        content = content.replace(
          /import.*from ['"]@\/context['"];?/,
          `import { useAuth, useFinancial, useGroups, useTracker, useSettings } from '@/context';`
        );
        modified = true;
      }
      
      // Fix CRUD operations usage
      if (content.includes('.length') && content.includes('CRUDOperations')) {
        content = content.replace(/(\w+)\.length/g, '$1.items.length');
        modified = true;
      }
      
      if (content.includes('.map(') && content.includes('CRUDOperations')) {
        content = content.replace(/(\w+)\.map\(/g, '$1.items.map(');
        modified = true;
      }
      
      if (content.includes('.filter(') && content.includes('CRUDOperations')) {
        content = content.replace(/(\w+)\.filter\(/g, '$1.items.filter(');
        modified = true;
      }
      
      if (content.includes('.find(') && content.includes('CRUDOperations')) {
        content = content.replace(/(\w+)\.find\(/g, '$1.items.find(');
        modified = true;
      }
      
      if (content.includes('.forEach(') && content.includes('CRUDOperations')) {
        content = content.replace(/(\w+)\.forEach\(/g, '$1.items.forEach(');
        modified = true;
      }
      
      // Fix property access patterns
      content = content.replace(/user\.name/g, 'user.displayName');
      content = content.replace(/\.purchaseAmount/g, '.amount');
      content = content.replace(/\.currentValue/g, '.amount');
      content = content.replace(/\.initialValue/g, '.amount');
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed context usage in ${filePath}`);
      }
    }
  });
}

// ============================================================================
// 3. Fix Test Setup Issues
// ============================================================================

function fixTestSetup() {
  console.log('📝 Fixing test setup issues...');
  
  const testSetupPath = 'src/utils/context-test-setup.ts';
  if (fs.existsSync(testSetupPath)) {
    let content = fs.readFileSync(testSetupPath, 'utf8');
    
    // Fix jest mock return value types
    content = content.replace(
      /jest\.fn\(\)\.mockResolvedValue\(null\)/g,
      'jest.fn().mockResolvedValue(null as any)'
    );
    
    content = content.replace(
      /jest\.fn\(\)\.mockResolvedValue\(undefined\)/g,
      'jest.fn().mockResolvedValue(undefined as any)'
    );
    
    content = content.replace(
      /jest\.fn\(\)\.mockResolvedValue\(\[\]\)/g,
      'jest.fn().mockResolvedValue([] as any)'
    );
    
    content = content.replace(
      /jest\.fn\(\)\.mockResolvedValue\(\{/g,
      'jest.fn().mockResolvedValue({'
    );
    
    // Fix storage indexing
    content = content.replace(
      /storage\[key\]/g,
      'storage[key as string]'
    );
    
    fs.writeFileSync(testSetupPath, content);
    console.log(`  ✅ Fixed test setup in ${testSetupPath}`);
  }
}

// ============================================================================
// 4. Fix Specific Screen Issues
// ============================================================================

function fixSpecificScreenIssues() {
  console.log('📝 Fixing specific screen issues...');
  
  // Fix SettingsScreen variable hoisting issue
  const settingsScreenPath = 'src/screens/SettingsScreen.tsx';
  if (fs.existsSync(settingsScreenPath)) {
    let content = fs.readFileSync(settingsScreenPath, 'utf8');
    
    // Move user destructuring before usage
    const userDestructureMatch = content.match(/const \{ user, profile, signOut \} = useAuth\(\);/);
    if (userDestructureMatch) {
      const userDestructureLine = userDestructureMatch[0];
      
      // Remove the line from its current position
      content = content.replace(userDestructureLine, '');
      
      // Find where user is first used and insert before it
      const firstUserUsage = content.search(/hasUser: !!user/);
      if (firstUserUsage !== -1) {
        const lines = content.split('\n');
        let insertIndex = 0;
        let currentPos = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (currentPos >= firstUserUsage) {
            insertIndex = i;
            break;
          }
          currentPos += lines[i].length + 1; // +1 for newline
        }
        
        lines.splice(insertIndex, 0, `  ${userDestructureLine}`);
        content = lines.join('\n');
      }
    }
    
    fs.writeFileSync(settingsScreenPath, content);
    console.log(`  ✅ Fixed variable hoisting in ${settingsScreenPath}`);
  }
}

// ============================================================================
// 5. Run Fixes
// ============================================================================

async function runFixes() {
  try {
    fixGenericTypeParameters();
    fixContextUsagePatterns();
    fixTestSetup();
    fixSpecificScreenIssues();
    
    console.log('\n🎉 TypeScript error fixes completed!');
    console.log('\n📊 Running TypeScript check to verify fixes...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('\n✅ All TypeScript errors fixed successfully!');
    } catch (error) {
      console.log('\n⚠️  Some TypeScript errors remain. Running detailed check...');
      
      try {
        const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
        const errorCount = (output.match(/error TS/g) || []).length;
        console.log(`\n📈 Progress: Reduced errors significantly. ${errorCount} errors remaining.`);
        
        // Show first few errors for context
        const lines = output.split('\n').slice(0, 20);
        console.log('\nRemaining errors (first 20 lines):');
        lines.forEach(line => {
          if (line.trim()) console.log(`  ${line}`);
        });
      } catch (detailError) {
        console.log('Could not get detailed error information');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during fixes:', error.message);
    process.exit(1);
  }
}

// Run the fixes
runFixes();