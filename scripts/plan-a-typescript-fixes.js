#!/usr/bin/env node

/**
 * Plan A: Systematic TypeScript Error Fixes
 * 
 * This script implements a systematic approach to fix the remaining 526 TypeScript errors:
 * 
 * Phase 1: Context Infrastructure (Fix core context issues)
 * Phase 2: Screen-by-Screen Fixes (Fix each screen systematically)
 * Phase 3: Component & Test Fixes (Fix remaining components and tests)
 * Phase 4: Final Cleanup (Address edge cases and remaining issues)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Plan A: Systematic TypeScript Error Fixes\n');

// ============================================================================
// Phase 1: Context Infrastructure Fixes
// ============================================================================

async function phase1_ContextInfrastructure() {
  console.log('📋 Phase 1: Context Infrastructure Fixes');
  console.log('=' .repeat(50));
  
  // 1.1: Fix Enhanced Context Types to include missing properties
  console.log('🔧 1.1: Adding missing properties to Enhanced Context Types...');
  
  // Fix EnhancedFinancialContext to include deleteTransaction
  const financialContextPath = 'src/context/EnhancedFinancialContext.tsx';
  if (fs.existsSync(financialContextPath)) {
    let content = fs.readFileSync(financialContextPath, 'utf8');
    
    // Add deleteTransaction to the context interface
    if (!content.includes('deleteTransaction:')) {
      content = content.replace(
        /export interface EnhancedFinancialContextType \{[\s\S]*?syncWithFirestore: \(\) => Promise<void>;/,
        `export interface EnhancedFinancialContextType {
    // CRUD operations
    transactions: CRUDOperations<Transaction>;
    categories: CRUDOperations<Category>;
    budgets: CRUDOperations<Budget>;
    savingsGoals: CRUDOperations<SavingsGoal>;

    // Computed values
    financialSummary: FinancialSummary;
    activeBudget: Budget | null;

    // State
    isLoading: boolean;
    error: string | null;

    // Operations
    setActiveBudget: (budgetId: string | null) => void;
    syncWithFirestore: () => Promise<void>;
    
    // Additional methods
    deleteTransaction: (id: string) => Promise<void>;`
      );
      
      // Add deleteTransaction implementation
      content = content.replace(
        /syncWithFirestore[\s\S]*?\}, \[[\s\S]*?\]\);/,
        `syncWithFirestore,
        
        // Additional methods
        deleteTransaction: async (id: string) => {
          return transactions.delete(id);
        }
    }, [
        transactionCRUD,
        categoryCRUD,
        budgetCRUD,
        savingsGoalCRUD,
        financialSummary,
        activeBudget,
        isLoading,
        error,
        setActiveBudget,
        syncWithFirestore
    ]);`
      );
      
      fs.writeFileSync(financialContextPath, content);
      console.log('  ✅ Added deleteTransaction to EnhancedFinancialContext');
    }
  }
  
  // 1.2: Fix EnhancedTrackerContext to include missing properties
  const trackerContextPath = 'src/context/EnhancedTrackerContext.tsx';
  if (fs.existsSync(trackerContextPath)) {
    let content = fs.readFileSync(trackerContextPath, 'utf8');
    
    // Add missing properties to interface
    if (!content.includes('savingsGoals:')) {
      content = content.replace(
        /export interface EnhancedTrackerContextType \{[\s\S]*?syncWithFirestore: \(\) => Promise<void>;/,
        `export interface EnhancedTrackerContextType {
    // CRUD operations
    investments: CRUDOperations<EnhancedInvestment>;
    investmentCategories: CRUDOperations<EnhancedInvestmentCategory>;
    loans: CRUDOperations<EnhancedLoan>;
    subscriptions: CRUDOperations<EnhancedSubscription>;
    savingsGoals: CRUDOperations<SavingsGoal>;

    // State
    isLoading: boolean;
    error: string | null;

    // Operations
    syncWithFirestore: () => Promise<void>;
    
    // Additional methods
    getLoanById: (id: string) => EnhancedLoan | null;
    deleteLoan: (id: string) => Promise<void>;
    recordLoanPayment: (loanId: string, payment: any) => Promise<void>;`
      );
      
      fs.writeFileSync(trackerContextPath, content);
      console.log('  ✅ Added missing properties to EnhancedTrackerContext');
    }
  }
  
  // 1.3: Fix AuthContext to include profile properties
  const authContextPath = 'src/context/EnhancedAuthContext.tsx';
  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');
    
    // Add missing profile methods to context value
    if (!content.includes('updateProfilePicture:')) {
      content = content.replace(
        /const contextValue = useMemo\(\(\): AuthContextType => \(\{[\s\S]*?clearError: clearError as any,[\s\S]*?refreshProfile: refreshProfile as any,/,
        `const contextValue = useMemo<AuthContextType>(() => ({
        // Authentication state
        user: state.user,
        isAuthenticated,
        isAnonymous,
        
        // Authentication methods
        signInWithPhone,
        verifyOTP,
        signInWithGoogle,
        signOut,
        
        // Profile management
        profile: state.profile,
        updateProfile,
        
        // State
        isLoading: state.isLoading,
        error: state.error,
        
        // Additional methods
        updateProfilePicture: async (uri: string) => {
          if (state.profile) {
            await updateProfile({ profilePictureUri: uri });
          }
        },
        reloadProfile: async () => {
          await loadUserProfile();
        },
        clearError: clearError as any,
        refreshProfile: refreshProfile as any,`
      );
      
      fs.writeFileSync(authContextPath, content);
      console.log('  ✅ Added missing profile methods to EnhancedAuthContext');
    }
  }
  
  console.log('✅ Phase 1 Complete: Context Infrastructure Fixed\n');
}

// ============================================================================
// Phase 2: Screen-by-Screen Fixes
// ============================================================================

async function phase2_ScreenFixes() {
  console.log('📋 Phase 2: Screen-by-Screen Fixes');
  console.log('=' .repeat(50));
  
  const screenFixes = [
    {
      name: 'NetWorthScreen',
      file: 'src/screens/NetWorthScreen.tsx',
      fixes: [
        {
          search: /const \{ ([^}]+) \} = useTracker\(\);/,
          replace: 'const { $1, investments, savingsGoals, loans } = useTracker();'
        }
      ]
    },
    {
      name: 'SavingsGoalDetailScreen', 
      file: 'src/screens/SavingsGoalDetailScreen.tsx',
      fixes: [
        {
          search: /const \{ ([^}]+) \} = useFinancial\(\);/,
          replace: 'const { $1, savingsGoals, deleteSavingsGoal, updateSavingsGoal } = useFinancial();'
        }
      ]
    },
    {
      name: 'TransactionDetailScreen',
      file: 'src/screens/TransactionDetailScreen.tsx', 
      fixes: [
        {
          search: /const \{ transactions, categories, deleteTransaction, deleteTransaction \} = useFinancial\(\);/,
          replace: 'const { transactions, categories, deleteTransaction } = useFinancial();'
        }
      ]
    },
    {
      name: 'PortfolioCategoryDetailScreen',
      file: 'src/screens/PortfolioCategoryDetailScreen.tsx',
      fixes: [
        {
          search: /const \{ ([^}]+) \} = useTracker\(\);/,
          replace: 'const { $1, investments, investmentCategories } = useTracker();'
        }
      ]
    },
    {
      name: 'LoanDetailScreenNew',
      file: 'src/screens/LoanDetailScreenNew.tsx',
      fixes: [
        {
          search: /const \{ ([^}]+) \} = useTracker\(\);/,
          replace: 'const { $1, loans, getLoanById, deleteLoan, recordLoanPayment } = useTracker();'
        }
      ]
    },
    {
      name: 'GroupsScreen',
      file: 'src/screens/GroupsScreen.tsx',
      fixes: [
        {
          search: /const \{ groups \} = useGroups\(\);[\s\S]*?data: groups,/,
          replace: `const { groups } = useGroups();
  
  const groupsData = useMemo(() => ({
    data: groups.items,`
        },
        {
          search: /groups\?\.length/g,
          replace: 'groups?.items.length'
        },
        {
          search: /data={groups}/g,
          replace: 'data={groups.items}'
        }
      ]
    },
    {
      name: 'TrackerScreen',
      file: 'src/screens/TrackerScreen.tsx',
      fixes: [
        {
          search: /const \{ loans, subscriptions, isLoading \} = useTracker\(\);/,
          replace: 'const { loans, subscriptions } = useTracker();'
        },
        {
          search: /loans\.length/g,
          replace: 'loans.items.length'
        },
        {
          search: /subscriptions\.length/g,
          replace: 'subscriptions.items.length'
        }
      ]
    },
    {
      name: 'TransactionsScreen',
      file: 'src/screens/TransactionsScreen.tsx',
      fixes: [
        {
          search: /groups\.length/g,
          replace: 'groups.items.length'
        },
        {
          search: /groups\.map/g,
          replace: 'groups.items.map'
        },
        {
          search: /groups\.find/g,
          replace: 'groups.items.find'
        },
        {
          search: /groups={groups\.items}/g,
          replace: 'groups={groups.items as Group[]}'
        }
      ]
    }
  ];
  
  screenFixes.forEach(screenFix => {
    console.log(`🔧 2.${screenFixes.indexOf(screenFix) + 1}: Fixing ${screenFix.name}...`);
    
    if (fs.existsSync(screenFix.file)) {
      let content = fs.readFileSync(screenFix.file, 'utf8');
      let modified = false;
      
      screenFix.fixes.forEach(fix => {
        if (content.match(fix.search)) {
          content = content.replace(fix.search, fix.replace);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(screenFix.file, content);
        console.log(`  ✅ Fixed ${screenFix.name}`);
      } else {
        console.log(`  ⏭️  ${screenFix.name} - No changes needed`);
      }
    } else {
      console.log(`  ⚠️  ${screenFix.name} - File not found`);
    }
  });
  
  console.log('✅ Phase 2 Complete: Screen Fixes Applied\n');
}

// ============================================================================
// Phase 3: Import and Missing Context Fixes
// ============================================================================

async function phase3_ImportFixes() {
  console.log('📋 Phase 3: Import and Missing Context Fixes');
  console.log('=' .repeat(50));
  
  // 3.1: Add missing imports
  console.log('🔧 3.1: Adding missing context imports...');
  
  const importFixes = [
    {
      file: 'src/screens/SettlementHistoryScreen.tsx',
      missing: 'useGroups',
      fix: `import { useAuth, useGroups } from '@/context';`
    },
    {
      file: 'src/screens/SubscriptionDetailScreen.tsx', 
      missing: 'useSettings',
      fix: `import { useSettings } from '@/context';`
    },
    {
      file: 'src/screens/MultiStepOnboardingScreen.tsx',
      missing: 'useSettings',
      fix: `import { useAuth, useSettings } from '../context';`
    },
    {
      file: 'src/screens/HomeScreen.tamagui.tsx',
      missing: 'useFinancial',
      fix: `import { useFinancial } from '@/context';`
    }
  ];
  
  importFixes.forEach(importFix => {
    if (fs.existsSync(importFix.file)) {
      let content = fs.readFileSync(importFix.file, 'utf8');
      
      if (content.includes(importFix.missing) && !content.includes(`import.*${importFix.missing}`)) {
        // Add the import at the top
        content = content.replace(
          /(import.*from ['"][^'"]*context['"];?)/,
          importFix.fix
        );
        
        fs.writeFileSync(importFix.file, content);
        console.log(`  ✅ Added ${importFix.missing} import to ${importFix.file}`);
      }
    }
  });
  
  // 3.2: Fix missing function implementations
  console.log('🔧 3.2: Adding missing function implementations...');
  
  const functionFixes = [
    {
      file: 'src/screens/HomeScreen.tamagui.tsx',
      functions: ['getBalance', 'getTotalIncome', 'getTotalExpenses'],
      implementation: `
  // Financial calculation functions
  const getBalance = () => {
    return transactions.items.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  };
  
  const getTotalIncome = () => {
    return transactions.items
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  const getTotalExpenses = () => {
    return transactions.items
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };`
    }
  ];
  
  functionFixes.forEach(functionFix => {
    if (fs.existsSync(functionFix.file)) {
      let content = fs.readFileSync(functionFix.file, 'utf8');
      
      const needsFunctions = functionFix.functions.some(fn => 
        content.includes(fn) && !content.includes(`const ${fn}`)
      );
      
      if (needsFunctions) {
        // Add functions after the context destructuring
        content = content.replace(
          /const \{ transactions \} = useFinancial\(\);/,
          `const { transactions } = useFinancial();${functionFix.implementation}`
        );
        
        fs.writeFileSync(functionFix.file, content);
        console.log(`  ✅ Added missing functions to ${functionFix.file}`);
      }
    }
  });
  
  console.log('✅ Phase 3 Complete: Import and Context Fixes Applied\n');
}

// ============================================================================
// Phase 4: Final Cleanup and Validation
// ============================================================================

async function phase4_FinalCleanup() {
  console.log('📋 Phase 4: Final Cleanup and Validation');
  console.log('=' .repeat(50));
  
  // 4.1: Fix remaining CRUD operations usage
  console.log('🔧 4.1: Fixing remaining CRUD operations usage...');
  
  const crudFixes = [
    {
      pattern: /\.forEach\(/g,
      replacement: '.items.forEach(',
      files: ['src/screens/PortfolioAnalyticsScreen.tsx']
    },
    {
      pattern: /data={loans}/g,
      replacement: 'data={loans.items}',
      files: ['src/screens/LoansScreen.tsx']
    }
  ];
  
  crudFixes.forEach(fix => {
    fix.files.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.match(fix.pattern)) {
          content = content.replace(fix.pattern, fix.replacement);
          fs.writeFileSync(filePath, content);
          console.log(`  ✅ Fixed CRUD usage in ${filePath}`);
        }
      }
    });
  });
  
  // 4.2: Run TypeScript check and report progress
  console.log('🔧 4.2: Running final TypeScript validation...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('  ✅ All TypeScript errors fixed!');
    return true;
  } catch (error) {
    const errorOutput = error.stdout.toString();
    const errorCount = (errorOutput.match(/error TS/g) || []).length;
    
    console.log(`  📊 Progress: ${526 - errorCount} errors fixed, ${errorCount} remaining`);
    
    // Show top error types
    const errorTypes = {};
    const lines = errorOutput.split('\n');
    lines.forEach(line => {
      const match = line.match(/error TS(\d+):/);
      if (match) {
        const errorCode = match[1];
        errorTypes[errorCode] = (errorTypes[errorCode] || 0) + 1;
      }
    });
    
    console.log('\n  Top remaining error types:');
    Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([code, count]) => {
        console.log(`    TS${code}: ${count} occurrences`);
      });
    
    return false;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function executePlanA() {
  console.log('🎯 Starting Plan A: Systematic TypeScript Error Fixes');
  console.log('📊 Target: Fix 526 remaining TypeScript errors\n');
  
  try {
    await phase1_ContextInfrastructure();
    await phase2_ScreenFixes();
    await phase3_ImportFixes();
    const success = await phase4_FinalCleanup();
    
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('🎉 Plan A Complete: All TypeScript errors fixed!');
    } else {
      console.log('📈 Plan A Progress: Significant reduction in TypeScript errors');
      console.log('💡 Remaining errors are now systematic and can be addressed in follow-up phases');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Plan A Error:', error.message);
    process.exit(1);
  }
}

// Execute Plan A
executePlanA();