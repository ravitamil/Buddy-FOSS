#!/usr/bin/env node

/**
 * Context Pattern Checker
 * 
 * This script analyzes the codebase for context usage patterns and provides
 * migration guidance during the context architecture refactor.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  srcDir: 'src',
  excludeDirs: ['node_modules', '.git', 'dist', 'build'],
  fileExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  
  // Patterns to detect
  patterns: {
    appContextUsage: /useApp\(\)/g,
    appContextImport: /import.*AppContext/g,
    appProviderUsage: /<AppProvider/g,
    directContextAccess: /React\.useContext|useContext/g,
    deprecatedMethods: [
      'addTransaction', 'updateTransaction', 'deleteTransaction',
      'addCategory', 'updateCategory', 'deleteCategory',
      'addBudget', 'updateBudget', 'deleteBudget',
      'addSavingsGoal', 'updateSavingsGoal', 'deleteSavingsGoal',
      'addGroup', 'updateGroup', 'deleteGroup',
      'addLoan', 'updateLoan', 'deleteLoan',
      'setCurrency', 'setLanguage', 'formatCurrency'
    ]
  },
  
  // Replacement suggestions
  replacements: {
    'useApp()': 'Use specific context hooks: useAuth(), useFinancial(), useGroups(), useTracker(), useSettings()',
    'addTransaction': 'useFinancial().transactions.add()',
    'updateTransaction': 'useFinancial().transactions.update()',
    'deleteTransaction': 'useFinancial().transactions.delete()',
    'addCategory': 'useFinancial().categories.add()',
    'updateCategory': 'useFinancial().categories.update()',
    'deleteCategory': 'useFinancial().categories.delete()',
    'addBudget': 'useFinancial().budgets.add()',
    'updateBudget': 'useFinancial().budgets.update()',
    'deleteBudget': 'useFinancial().budgets.delete()',
    'addSavingsGoal': 'useFinancial().savingsGoals.add()',
    'updateSavingsGoal': 'useFinancial().savingsGoals.update()',
    'deleteSavingsGoal': 'useFinancial().savingsGoals.delete()',
    'addGroup': 'useGroups().add()',
    'updateGroup': 'useGroups().update()',
    'deleteGroup': 'useGroups().delete()',
    'addLoan': 'useTracker().loans.add()',
    'updateLoan': 'useTracker().loans.update()',
    'deleteLoan': 'useTracker().loans.delete()',
    'setCurrency': 'useSettings().updateCurrency()',
    'setLanguage': 'useSettings().updateLanguage()',
    'formatCurrency': 'useSettings().formatCurrency()'
  }
};

class ContextPatternChecker {
  constructor() {
    this.results = {
      totalFiles: 0,
      filesWithIssues: 0,
      issues: [],
      summary: {
        appContextUsage: 0,
        deprecatedMethods: 0,
        directContextAccess: 0,
        appProviderUsage: 0
      }
    };
  }

  // Get all files to check
  getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !CONFIG.excludeDirs.includes(item)) {
        this.getAllFiles(fullPath, files);
      } else if (stat.isFile() && CONFIG.fileExtensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Check a single file for patterns
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileIssues = [];
    
    // Check for useApp() usage
    const appUsageMatches = content.match(CONFIG.patterns.appContextUsage);
    if (appUsageMatches) {
      fileIssues.push({
        type: 'appContextUsage',
        count: appUsageMatches.length,
        suggestion: CONFIG.replacements['useApp()']
      });
      this.results.summary.appContextUsage += appUsageMatches.length;
    }

    // Check for AppContext imports
    const appImportMatches = content.match(CONFIG.patterns.appContextImport);
    if (appImportMatches) {
      fileIssues.push({
        type: 'appContextImport',
        count: appImportMatches.length,
        suggestion: 'Import specific context hooks instead'
      });
    }

    // Check for AppProvider usage
    const appProviderMatches = content.match(CONFIG.patterns.appProviderUsage);
    if (appProviderMatches) {
      fileIssues.push({
        type: 'appProviderUsage',
        count: appProviderMatches.length,
        suggestion: 'Use CoordinationProvider instead'
      });
      this.results.summary.appProviderUsage += appProviderMatches.length;
    }

    // Check for direct context access
    const directContextMatches = content.match(CONFIG.patterns.directContextAccess);
    if (directContextMatches) {
      fileIssues.push({
        type: 'directContextAccess',
        count: directContextMatches.length,
        suggestion: 'Use provided context hooks instead of useContext'
      });
      this.results.summary.directContextAccess += directContextMatches.length;
    }

    // Check for deprecated methods
    for (const method of CONFIG.patterns.deprecatedMethods) {
      const methodRegex = new RegExp(`\\b${method}\\b`, 'g');
      const methodMatches = content.match(methodRegex);
      if (methodMatches) {
        fileIssues.push({
          type: 'deprecatedMethod',
          method: method,
          count: methodMatches.length,
          suggestion: CONFIG.replacements[method] || `Replace ${method} with new context method`
        });
        this.results.summary.deprecatedMethods += methodMatches.length;
      }
    }

    if (fileIssues.length > 0) {
      this.results.filesWithIssues++;
      this.results.issues.push({
        file: filePath,
        issues: fileIssues
      });
    }

    this.results.totalFiles++;
  }

  // Generate migration report
  generateReport() {
    console.log('\n🔍 Context Pattern Analysis Report');
    console.log('=====================================\n');

    console.log(`📊 Summary:`);
    console.log(`  Total files checked: ${this.results.totalFiles}`);
    console.log(`  Files with issues: ${this.results.filesWithIssues}`);
    console.log(`  Migration progress: ${Math.round((1 - this.results.filesWithIssues / this.results.totalFiles) * 100)}%\n`);

    console.log(`🚨 Issues found:`);
    console.log(`  AppContext usage: ${this.results.summary.appContextUsage}`);
    console.log(`  Deprecated methods: ${this.results.summary.deprecatedMethods}`);
    console.log(`  Direct context access: ${this.results.summary.directContextAccess}`);
    console.log(`  AppProvider usage: ${this.results.summary.appProviderUsage}\n`);

    if (this.results.issues.length > 0) {
      console.log('📋 Detailed Issues:\n');
      
      for (const fileResult of this.results.issues) {
        console.log(`📄 ${fileResult.file}:`);
        
        for (const issue of fileResult.issues) {
          const methodInfo = issue.method ? ` (${issue.method})` : '';
          console.log(`  ⚠️  ${issue.type}${methodInfo}: ${issue.count} occurrence(s)`);
          console.log(`      💡 ${issue.suggestion}`);
        }
        console.log('');
      }
    }

    // Generate migration priority
    console.log('🎯 Migration Priority:\n');
    
    const priorityFiles = this.results.issues
      .map(file => ({
        ...file,
        priority: file.issues.reduce((sum, issue) => sum + issue.count, 0)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);

    console.log('Top 10 files to migrate first:');
    for (let i = 0; i < priorityFiles.length; i++) {
      const file = priorityFiles[i];
      console.log(`  ${i + 1}. ${file.file} (${file.priority} issues)`);
    }

    console.log('\n✅ Next Steps:');
    console.log('1. Start with high-priority files');
    console.log('2. Replace useApp() with specific context hooks');
    console.log('3. Update deprecated method calls');
    console.log('4. Replace AppProvider with CoordinationProvider');
    console.log('5. Run ESLint with context-patterns rules');
    console.log('\n💡 Use --fix flag with ESLint for automatic fixes where possible');
  }

  // Run the analysis
  run() {
    console.log('🚀 Starting context pattern analysis...\n');
    
    const files = this.getAllFiles(CONFIG.srcDir);
    console.log(`Found ${files.length} files to analyze\n`);

    for (const file of files) {
      this.checkFile(file);
    }

    this.generateReport();
  }
}

// CLI interface
if (require.main === module) {
  const checker = new ContextPatternChecker();
  checker.run();
}

module.exports = ContextPatternChecker;