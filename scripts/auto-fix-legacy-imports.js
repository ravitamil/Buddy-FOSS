#!/usr/bin/env node

/**
 * Auto-fix Legacy Imports Script
 * 
 * This script automatically fixes common legacy import patterns
 * and updates them to use the new enhanced contexts.
 */

const fs = require('fs');
const path = require('path');

// Import replacement patterns
const importReplacements = [
  {
    pattern: /import\s*{\s*useApp\s*}\s*from\s*['"]\.\.\/context\/AppContext['"];?/g,
    replacement: "import { useAuth, useSettings, useFinancial, useGroups, useTracker } from '../context';"
  },
  {
    pattern: /import\s*{\s*AppProvider\s*}\s*from\s*['"]\.\.\/context\/AppContext['"];?/g,
    replacement: "// AppProvider is now handled by enhanced context hierarchy in _layout.tsx"
  },
  {
    pattern: /import\s*{\s*useApp\s*}\s*from\s*['"]@\/context\/AppContext['"];?/g,
    replacement: "import { useAuth, useSettings, useFinancial, useGroups, useTracker } from '@/context';"
  }
];

// Method replacement patterns
const methodReplacements = [
  {
    pattern: /(\w+)\.formatCurrency\(/g,
    replacement: "useSettings().formatCurrency("
  },
  {
    pattern: /(\w+)\.formatCurrencyExact\(/g,
    replacement: "useSettings().formatCurrencyExact("
  },
  {
    pattern: /(\w+)\.setCurrency\(/g,
    replacement: "useSettings().updateCurrency("
  },
  {
    pattern: /(\w+)\.setLanguage\(/g,
    replacement: "useSettings().updateLanguage("
  },
  {
    pattern: /(\w+)\.addTransaction\(/g,
    replacement: "useFinancial().transactions.add("
  },
  {
    pattern: /(\w+)\.updateTransaction\(/g,
    replacement: "useFinancial().transactions.update("
  },
  {
    pattern: /(\w+)\.deleteTransaction\(/g,
    replacement: "useFinancial().transactions.delete("
  },
  {
    pattern: /(\w+)\.addCategory\(/g,
    replacement: "useFinancial().categories.add("
  },
  {
    pattern: /(\w+)\.updateCategory\(/g,
    replacement: "useFinancial().categories.update("
  },
  {
    pattern: /(\w+)\.deleteCategory\(/g,
    replacement: "useFinancial().categories.delete("
  },
  {
    pattern: /(\w+)\.addGroup\(/g,
    replacement: "useGroups().groups.add("
  },
  {
    pattern: /(\w+)\.updateGroup\(/g,
    replacement: "useGroups().groups.update("
  },
  {
    pattern: /(\w+)\.deleteGroup\(/g,
    replacement: "useGroups().groups.delete("
  }
];

// Files to exclude from auto-fixing
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '__tests__',
  'test',
  'spec',
  '.test.',
  '.spec.',
  'AppContext.tsx',
  'LegacyAppContext.tsx',
  'legacy-exports.ts',
  'auto-fix-legacy-imports.js',
  'cleanup-legacy-code.js'
];

/**
 * Check if file should be excluded from auto-fixing
 */
function shouldExcludeFile(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Get all TypeScript/JavaScript files that need fixing
 */
function getFilesToFix(dir = 'src', files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !shouldExcludeFile(fullPath)) {
      getFilesToFix(fullPath, files);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !shouldExcludeFile(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Fix imports in a file
 */
function fixFileImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply import replacements
    importReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // Apply method replacements (but be careful with context)
    methodReplacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        // Only replace if it's likely an app context method call
        matches.forEach(match => {
          const contextVar = match.split('.')[0];
          if (contextVar === 'app' || contextVar === 'appContext' || contextVar.includes('useApp')) {
            content = content.replace(match, replacement.replace('(', '('));
            modified = true;
          }
        });
      }
    });
    
    // Add necessary imports if methods were replaced
    if (modified && content.includes('useSettings()') && !content.includes('useSettings')) {
      if (!content.includes("import { useSettings }") && !content.includes("import {useSettings}")) {
        const importLine = "import { useSettings } from '../context';\n";
        content = importLine + content;
      }
    }
    
    if (modified && content.includes('useFinancial()') && !content.includes('useFinancial')) {
      if (!content.includes("import { useFinancial }") && !content.includes("import {useFinancial}")) {
        const importLine = "import { useFinancial } from '../context';\n";
        content = importLine + content;
      }
    }
    
    if (modified && content.includes('useGroups()') && !content.includes('useGroups')) {
      if (!content.includes("import { useGroups }") && !content.includes("import {useGroups}")) {
        const importLine = "import { useGroups } from '../context';\n";
        content = importLine + content;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main auto-fix function
 */
function runAutoFix() {
  console.log('🔧 Starting Auto-fix for Legacy Imports...');
  console.log('==========================================');
  
  const filesToFix = getFilesToFix();
  let fixedFiles = 0;
  let totalFiles = 0;
  
  console.log(`Found ${filesToFix.length} files to analyze...`);
  
  filesToFix.forEach(filePath => {
    totalFiles++;
    const wasFixed = fixFileImports(filePath);
    
    if (wasFixed) {
      fixedFiles++;
      console.log(`✅ Fixed: ${filePath}`);
    }
  });
  
  console.log('\n📊 Auto-fix Results:');
  console.log(`   Files analyzed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n⚠️ Manual Review Required:');
    console.log('   Please review the fixed files to ensure correctness');
    console.log('   Some complex patterns may require manual adjustment');
    console.log('   Run tests to verify functionality after auto-fix');
  } else {
    console.log('\n✅ No files needed auto-fixing');
  }
  
  return fixedFiles;
}

// Run the auto-fix
if (require.main === module) {
  const fixedCount = runAutoFix();
  console.log(`\n🎉 Auto-fix completed! Fixed ${fixedCount} files.`);
}

module.exports = {
  runAutoFix,
  fixFileImports
};