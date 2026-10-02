#!/usr/bin/env node

/**
 * Complete Context Cleanup Script
 * 
 * This script performs a comprehensive cleanup of all legacy context usage
 * for a greenfield project, replacing all deprecated patterns with the new
 * enhanced context architecture.
 */

const fs = require('fs');
const path = require('path');

// Files to exclude from cleanup
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
  'complete-context-cleanup.js'
];

/**
 * Check if file should be excluded from cleanup
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
 * Fix all legacy patterns in a file
 */
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Fix legacy imports
    const legacyImportPatterns = [
      {
        pattern: /import\s*{\s*useApp\s*}\s*from\s*['"][^'"]*AppContext['"];?\s*\n?/g,
        replacement: ''
      },
      {
        pattern: /import\s*{\s*AppProvider\s*}\s*from\s*['"][^'"]*AppContext['"];?\s*\n?/g,
        replacement: ''
      }
    ];
    
    legacyImportPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // 2. Add necessary imports if not present
    const needsSettings = content.includes('formatCurrency(') || content.includes('setCurrency(') || content.includes('setLanguage(');
    const needsFinancial = content.includes('addTransaction(') || content.includes('updateTransaction(') || content.includes('deleteTransaction(') || 
                          content.includes('addCategory(') || content.includes('updateCategory(') || content.includes('deleteCategory(');
    const needsGroups = content.includes('addGroup(') || content.includes('updateGroup(') || content.includes('deleteGroup(');
    const needsAuth = content.includes('useApp()') && (content.includes('user') || content.includes('profile'));
    
    // Check if imports already exist
    const hasSettingsImport = content.includes('useSettings') || content.includes('from \'../context\'') || content.includes('from \'@/context\'');
    const hasFinancialImport = content.includes('useFinancial') || content.includes('from \'../context\'') || content.includes('from \'@/context\'');
    const hasGroupsImport = content.includes('useGroups') || content.includes('from \'../context\'') || content.includes('from \'@/context\'');
    const hasAuthImport = content.includes('useAuth') || content.includes('from \'../context\'') || content.includes('from \'@/context\'');
    
    // Add imports if needed
    let importsToAdd = [];
    if (needsSettings && !hasSettingsImport) importsToAdd.push('useSettings');
    if (needsFinancial && !hasFinancialImport) importsToAdd.push('useFinancial');
    if (needsGroups && !hasGroupsImport) importsToAdd.push('useGroups');
    if (needsAuth && !hasAuthImport) importsToAdd.push('useAuth');
    
    if (importsToAdd.length > 0) {
      const importPath = filePath.includes('src/screens/') ? '../context' : 
                        filePath.includes('src/components/') ? '../../context' : 
                        filePath.includes('src/services/') ? '../context' : 
                        '@/context';
      
      const importStatement = `import { ${importsToAdd.join(', ')} } from '${importPath}';\n`;
      
      // Find the last import statement and add after it
      const importRegex = /import\s+.*from\s+['"][^'"]*['"];?\s*\n/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);
        modified = true;
      }
    }
    
    // 3. Fix method calls
    const methodReplacements = [
      // Settings methods
      { pattern: /(\w+)\.formatCurrency\(/g, replacement: 'formatCurrency(' },
      { pattern: /(\w+)\.formatCurrencyExact\(/g, replacement: 'formatCurrencyExact(' },
      { pattern: /(\w+)\.setCurrency\(/g, replacement: 'updateCurrency(' },
      { pattern: /(\w+)\.setLanguage\(/g, replacement: 'updateLanguage(' },
      
      // Financial methods
      { pattern: /(\w+)\.addTransaction\(/g, replacement: 'transactions.add(' },
      { pattern: /(\w+)\.updateTransaction\(/g, replacement: 'transactions.update(' },
      { pattern: /(\w+)\.deleteTransaction\(/g, replacement: 'transactions.delete(' },
      { pattern: /(\w+)\.addCategory\(/g, replacement: 'categories.add(' },
      { pattern: /(\w+)\.updateCategory\(/g, replacement: 'categories.update(' },
      { pattern: /(\w+)\.deleteCategory\(/g, replacement: 'categories.delete(' },
      
      // Group methods
      { pattern: /(\w+)\.addGroup\(/g, replacement: 'groups.add(' },
      { pattern: /(\w+)\.updateGroup\(/g, replacement: 'groups.update(' },
      { pattern: /(\w+)\.deleteGroup\(/g, replacement: 'groups.delete(' }
    ];
    
    methodReplacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const contextVar = match.split('.')[0];
          // Only replace if it's likely an app context method call
          if (contextVar === 'app' || contextVar === 'appContext' || contextVar.includes('useApp') || 
              match.includes('app.') || match.includes('appContext.')) {
            content = content.replace(match, replacement);
            modified = true;
          }
        });
      }
    });
    
    // 4. Fix useApp() destructuring
    const useAppPattern = /const\s*{\s*([^}]+)\s*}\s*=\s*useApp\(\);?/g;
    const useAppMatches = content.match(useAppPattern);
    
    if (useAppMatches) {
      useAppMatches.forEach(match => {
        const destructuredVars = match.match(/{\s*([^}]+)\s*}/)[1];
        const vars = destructuredVars.split(',').map(v => v.trim());
        
        let replacements = [];
        
        // Group variables by context
        const settingsVars = vars.filter(v => 
          v.includes('formatCurrency') || v.includes('currency') || v.includes('language')
        );
        const financialVars = vars.filter(v => 
          v.includes('transaction') || v.includes('categories') || v.includes('budgets')
        );
        const groupVars = vars.filter(v => 
          v.includes('groups') || v.includes('Group')
        );
        const authVars = vars.filter(v => 
          v.includes('user') || v.includes('profile') || v.includes('auth')
        );
        
        if (settingsVars.length > 0) {
          replacements.push(`const { ${settingsVars.join(', ')} } = useSettings();`);
        }
        if (financialVars.length > 0) {
          replacements.push(`const { ${financialVars.join(', ')} } = useFinancial();`);
        }
        if (groupVars.length > 0) {
          replacements.push(`const { ${groupVars.join(', ')} } = useGroups();`);
        }
        if (authVars.length > 0) {
          replacements.push(`const { ${authVars.join(', ')} } = useAuth();`);
        }
        
        if (replacements.length > 0) {
          content = content.replace(match, replacements.join('\n  '));
          modified = true;
        }
      });
    }
    
    // 5. Remove empty lines created by import removal
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
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
 * Main cleanup function
 */
function runCompleteCleanup() {
  console.log('🧹 Starting Complete Context Cleanup...');
  console.log('======================================');
  
  const filesToFix = getFilesToFix();
  let fixedFiles = 0;
  let totalFiles = 0;
  
  console.log(`Found ${filesToFix.length} files to analyze...`);
  
  filesToFix.forEach(filePath => {
    totalFiles++;
    const wasFixed = fixFile(filePath);
    
    if (wasFixed) {
      fixedFiles++;
      console.log(`✅ Fixed: ${filePath}`);
    }
  });
  
  console.log('\n📊 Complete Cleanup Results:');
  console.log(`   Files analyzed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n✅ Context cleanup completed successfully!');
    console.log('   All legacy context usage has been updated to use enhanced contexts');
    console.log('   Please run tests to verify functionality');
  } else {
    console.log('\n✅ No files needed fixing - context cleanup is complete!');
  }
  
  return fixedFiles;
}

// Run the cleanup
if (require.main === module) {
  const fixedCount = runCompleteCleanup();
  console.log(`\n🎉 Complete cleanup finished! Fixed ${fixedCount} files.`);
}

module.exports = {
  runCompleteCleanup,
  fixFile
};