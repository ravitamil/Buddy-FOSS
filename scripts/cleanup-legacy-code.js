#!/usr/bin/env node

/**
 * Legacy Code Cleanup Script
 * 
 * This script identifies and helps clean up legacy code and unused imports
 * after the context architecture refactor.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to identify legacy code
const legacyPatterns = {
  imports: [
    /import.*useApp.*from.*AppContext/g,
    /import.*AppProvider.*from.*AppContext/g,
    /import.*from.*'\.\.\/context\/AppContext'/g,
    /import.*from.*'@\/context\/AppContext'/g,
  ],
  usage: [
    /useApp\(\)/g,
    /AppProvider/g,
    /useAppContext/g,
  ],
  deprecatedMethods: [
    /addTransaction\(/g,
    /updateTransaction\(/g,
    /deleteTransaction\(/g,
    /addCategory\(/g,
    /updateCategory\(/g,
    /deleteCategory\(/g,
    /addGroup\(/g,
    /updateGroup\(/g,
    /deleteGroup\(/g,
    /setCurrency\(/g,
    /setLanguage\(/g,
    /formatCurrency\(/g,
  ]
};

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
  'AppContext.tsx', // Keep for backward compatibility
  'LegacyAppContext.tsx', // Keep for migration support
  'legacy-exports.ts' // Keep for backward compatibility
];

/**
 * Check if file should be excluded from cleanup
 */
function shouldExcludeFile(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Get all TypeScript/JavaScript files in the project
 */
function getAllSourceFiles(dir = 'src', files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !shouldExcludeFile(fullPath)) {
      getAllSourceFiles(fullPath, files);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name) && !shouldExcludeFile(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze file for legacy patterns
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = {
      legacyImports: [],
      legacyUsage: [],
      deprecatedMethods: [],
      unusedImports: []
    };
    
    // Check for legacy imports
    legacyPatterns.imports.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.legacyImports.push(...matches);
      }
    });
    
    // Check for legacy usage
    legacyPatterns.usage.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.legacyUsage.push(...matches);
      }
    });
    
    // Check for deprecated method calls
    legacyPatterns.deprecatedMethods.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.deprecatedMethods.push(...matches);
      }
    });
    
    // Check for unused imports (basic check)
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    importLines.forEach(line => {
      const importMatch = line.match(/import\s+.*?\s+from\s+['"](.+?)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Check if import is used in the file
        const importName = line.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
        if (importName) {
          const names = importName[1] ? importName[1].split(',').map(n => n.trim()) : 
                       importName[2] ? [importName[2]] : 
                       importName[3] ? [importName[3]] : [];
          
          names.forEach(name => {
            const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
            if (cleanName && !content.includes(cleanName) && !line.includes('type ')) {
              issues.unusedImports.push(`${cleanName} from ${importPath}`);
            }
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Generate cleanup report
 */
function generateCleanupReport() {
  console.log('🧹 Starting Legacy Code Cleanup Analysis...');
  console.log('=============================================');
  
  const sourceFiles = getAllSourceFiles();
  const report = {
    totalFiles: sourceFiles.length,
    filesWithIssues: 0,
    issues: {
      legacyImports: 0,
      legacyUsage: 0,
      deprecatedMethods: 0,
      unusedImports: 0
    },
    fileDetails: {}
  };
  
  sourceFiles.forEach(filePath => {
    const analysis = analyzeFile(filePath);
    if (analysis) {
      const hasIssues = Object.values(analysis).some(arr => arr.length > 0);
      
      if (hasIssues) {
        report.filesWithIssues++;
        report.fileDetails[filePath] = analysis;
        
        // Count issues
        report.issues.legacyImports += analysis.legacyImports.length;
        report.issues.legacyUsage += analysis.legacyUsage.length;
        report.issues.deprecatedMethods += analysis.deprecatedMethods.length;
        report.issues.unusedImports += analysis.unusedImports.length;
      }
    }
  });
  
  return report;
}

/**
 * Display cleanup recommendations
 */
function displayCleanupRecommendations(report) {
  console.log('\n📊 Cleanup Analysis Results:');
  console.log(`   Total files analyzed: ${report.totalFiles}`);
  console.log(`   Files with issues: ${report.filesWithIssues}`);
  console.log(`   Legacy imports: ${report.issues.legacyImports}`);
  console.log(`   Legacy usage: ${report.issues.legacyUsage}`);
  console.log(`   Deprecated methods: ${report.issues.deprecatedMethods}`);
  console.log(`   Unused imports: ${report.issues.unusedImports}`);
  
  if (report.filesWithIssues > 0) {
    console.log('\n🔍 Files requiring cleanup:');
    Object.entries(report.fileDetails).forEach(([filePath, issues]) => {
      console.log(`\n📄 ${filePath}:`);
      
      if (issues.legacyImports.length > 0) {
        console.log(`   ❌ Legacy imports: ${issues.legacyImports.join(', ')}`);
      }
      
      if (issues.legacyUsage.length > 0) {
        console.log(`   ❌ Legacy usage: ${issues.legacyUsage.join(', ')}`);
      }
      
      if (issues.deprecatedMethods.length > 0) {
        console.log(`   ⚠️ Deprecated methods: ${issues.deprecatedMethods.join(', ')}`);
      }
      
      if (issues.unusedImports.length > 0) {
        console.log(`   🗑️ Unused imports: ${issues.unusedImports.join(', ')}`);
      }
    });
    
    console.log('\n💡 Cleanup Recommendations:');
    console.log('   1. Replace legacy imports with enhanced context imports');
    console.log('   2. Update deprecated method calls to use new context hooks');
    console.log('   3. Remove unused imports to reduce bundle size');
    console.log('   4. Update component imports to use new context patterns');
  } else {
    console.log('\n✅ No legacy code issues found! Cleanup is complete.');
  }
}

/**
 * Check bundle size impact
 */
function checkBundleSize() {
  console.log('\n📦 Checking Bundle Size Impact...');
  
  try {
    // Count lines of code in context files
    const contextFiles = [
      'src/context/CoordinationContext.tsx',
      'src/context/EnhancedAuthContext.tsx',
      'src/context/SettingsContext.tsx',
      'src/context/EnhancedFinancialContext.tsx',
      'src/context/EnhancedGroupContext.tsx',
      'src/context/EnhancedTrackerContext.tsx'
    ];
    
    let totalLines = 0;
    contextFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').filter(line => line.trim().length > 0).length;
        totalLines += lines;
        console.log(`   ${file}: ${lines} lines`);
      }
    });
    
    console.log(`   Total enhanced context code: ${totalLines} lines`);
    
    // Check legacy context size
    if (fs.existsSync('src/context/AppContext.tsx')) {
      const legacyContent = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
      const legacyLines = legacyContent.split('\n').filter(line => line.trim().length > 0).length;
      console.log(`   Legacy AppContext: ${legacyLines} lines`);
      
      const reduction = ((legacyLines / totalLines) * 100).toFixed(1);
      console.log(`   Code efficiency: Enhanced contexts are ${reduction}% more efficient`);
    }
    
  } catch (error) {
    console.error('Error checking bundle size:', error.message);
  }
}

/**
 * Main cleanup function
 */
function runCleanupAnalysis() {
  try {
    const report = generateCleanupReport();
    displayCleanupRecommendations(report);
    checkBundleSize();
    
    // Save report
    const reportPath = 'legacy-code-cleanup-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    const hasIssues = report.filesWithIssues > 0;
    console.log(`\n${hasIssues ? '⚠️' : '✅'} Cleanup analysis ${hasIssues ? 'found issues' : 'completed successfully'}`);
    
    return !hasIssues;
    
  } catch (error) {
    console.error('\n❌ Cleanup analysis failed:', error.message);
    return false;
  }
}

// Run the analysis
if (require.main === module) {
  const success = runCleanupAnalysis();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runCleanupAnalysis,
  analyzeFile,
  getAllSourceFiles
};