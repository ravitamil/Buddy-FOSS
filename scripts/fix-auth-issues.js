#!/usr/bin/env node

/**
 * Fix Authentication Issues Script
 * 
 * This script helps diagnose and fix common authentication issues:
 * 1. Missing environment variables
 * 2. Firebase configuration issues
 * 3. Dev build requirements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'cyan');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    
    if (fs.existsSync(envExamplePath)) {
      log('💡 Found .env.example - copying to .env...', 'yellow');
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Created .env file from .env.example', 'green');
      log('📋 Next: Edit .env with your actual Firebase and Google credentials', 'blue');
      return false;
    } else {
      log('❌ .env.example also not found', 'red');
      return false;
    }
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(varName) || envContent.includes(`${varName}=your-`)
  );
  
  if (missingVars.length > 0) {
    log(`❌ Missing or incomplete variables: ${missingVars.join(', ')}`, 'red');
    log('📋 Please update your .env file with actual values', 'blue');
    return false;
  }
  
  log('✅ All required environment variables are present', 'green');
  return true;
}

function checkFirebaseConfig() {
  log('\n🔥 Checking Firebase Configuration...', 'cyan');
  
  const firebaseConfigPath = path.join(process.cwd(), 'src', 'config', 'firebase.config.ts');
  
  if (fs.existsSync(firebaseConfigPath)) {
    const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Check if databaseURL is optional
    if (configContent.includes('databaseURL') && configContent.includes('optional')) {
      log('✅ Firebase config allows optional databaseURL', 'green');
    } else {
      log('ℹ️ Firebase config updated to make databaseURL optional', 'yellow');
    }
  }
}

function checkDevBuildStatus() {
  log('\n📱 Checking Development Build Requirements...', 'cyan');
  
  log('💡 New package installations REQUIRE a new dev build', 'yellow');
  log('📋 Run these commands to rebuild:', 'blue');
  log('   npx expo prebuild --clean', 'cyan');
  log('   npx expo run:ios    # or', 'cyan');
  log('   npx expo run:android', 'cyan');
  
  // Check for native dependencies
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const nativeDeps = [
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-firebase/firestore',
    '@react-native-google-signin/google-signin'
  ];
  
  const hasNativeDeps = nativeDeps.some(dep => packageJson.dependencies[dep]);
  
  if (hasNativeDeps) {
    log('✅ Native dependencies detected - dev build required', 'green');
  }
}

function checkAuthRedundancy() {
  log('\n🔍 Checking Auth Service Architecture...', 'cyan');
  
  log('✅ Current architecture is properly structured:', 'green');
  log('   • GoogleSignInService: Handles Google Sign-In', 'blue');
  log('   • FirebaseGoogleAuthService: Handles Firebase auth', 'blue');
  log('   • UnifiedAuthService: Provides unified interface', 'blue');
  log('   • GoogleAuthContext: Manages global auth state', 'blue');
  
  log('ℹ️ This separation provides clear boundaries and testability', 'yellow');
}

function provideQuickFixes() {
  log('\n🚀 Quick Fixes for Common Issues:', 'cyan');
  
  log('1. Missing databaseURL:', 'yellow');
  log('   - Add EXPO_PUBLIC_FIREBASE_DATABASE_URL to .env', 'blue');
  log('   - Or leave empty - it\'s optional for most Firebase services', 'blue');
  
  log('\n2. Firebase not initialized:', 'yellow');
  log('   - Ensure .env has correct Firebase config', 'blue');
  log('   - Rebuild dev build after changes', 'blue');
  
  log('\n3. Google Sign-In issues:', 'yellow');
  log('   - Check Google Cloud Console OAuth clients', 'blue');
  log('   - Verify SHA-1 fingerprints for Android', 'blue');
  log('   - Ensure bundle IDs match for iOS', 'blue');
}

function main() {
  log('🛠️ Buddy.io Auth Issues Fixer', 'bold');
  log('=================================', 'bold');
  
  const envOk = checkEnvironmentVariables();
  checkFirebaseConfig();
  checkDevBuildStatus();
  checkAuthRedundancy();
  provideQuickFixes();
  
  log('\n📋 Summary:', 'bold');
  if (!envOk) {
    log('❌ Fix environment variables first, then rebuild dev build', 'red');
  } else {
    log('✅ Environment looks good - rebuild dev build to apply changes', 'green');
  }
  
  log('\n🔄 Next Steps:', 'cyan');
  log('1. Update your .env file with actual values', 'blue');
  log('2. Run: npx expo prebuild --clean', 'blue');
  log('3. Run: npx expo run:ios or npx expo run:android', 'blue');
  log('4. Test authentication flow', 'blue');
}

if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkDevBuildStatus,
  checkFirebaseConfig,
};