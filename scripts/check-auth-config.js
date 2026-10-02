#!/usr/bin/env node
/**
 * Google Sign-In Configuration Checker
 * Run this script to verify your Google Sign-In setup
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  log('\n🔍 Checking environment configuration...', 'cyan');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    if (fs.existsSync(envExamplePath)) {
      log('💡 Found .env.example - copy it to .env and fill in your client IDs', 'yellow');
      log('   Command: cp .env.example .env', 'blue');
    }
    return false;
  }
  
  log('✅ .env file found', 'green');
  return true;
}

function parseEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
  
  return env;
}

function validateClientId(clientId, type) {
  if (!clientId || clientId.includes('your-') || clientId.includes('placeholder')) {
    return false;
  }
  
  // Basic validation for Google OAuth client ID format
  const googleClientIdPattern = /^\d+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$/;
  return googleClientIdPattern.test(clientId);
}

function checkConfiguration() {
  log('\n🔧 Checking Google Sign-In configuration...', 'cyan');
  
  if (!checkEnvFile()) {
    return;
  }
  
  const env = parseEnvFile();
  const requiredVars = {
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID': 'Web Client ID (required for all platforms)',
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID': 'iOS Client ID (required for iOS builds)',
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID': 'Android Client ID (required for Android builds)'
  };
  
  let allValid = true;
  
  Object.entries(requiredVars).forEach(([key, description]) => {
    const value = env[key];
    
    if (!value) {
      log(`❌ ${key} - Not set`, 'red');
      log(`   ${description}`, 'yellow');
      allValid = false;
    } else if (!validateClientId(value, key)) {
      log(`⚠️  ${key} - Invalid format or placeholder value`, 'yellow');
      log(`   Current: ${value}`, 'blue');
      log(`   ${description}`, 'yellow');
      allValid = false;
    } else {
      log(`✅ ${key} - Valid`, 'green');
      log(`   ${value.substring(0, 20)}...`, 'blue');
    }
  });
  
  return allValid;
}

function checkAppConfig() {
  log('\n📱 Checking app.config.js...', 'cyan');
  
  const configPath = path.join(process.cwd(), 'app.config.js');
  
  if (!fs.existsSync(configPath)) {
    log('❌ app.config.js not found', 'red');
    return false;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check if Google Sign-In plugin is configured
    if (configContent.includes('@react-native-google-signin/google-signin')) {
      log('✅ Google Sign-In plugin configured', 'green');
    } else {
      log('❌ Google Sign-In plugin not found in app.config.js', 'red');
      return false;
    }
    
    // Check if environment variables are referenced
    const envVars = [
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
      'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
    ];
    
    envVars.forEach(envVar => {
      if (configContent.includes(envVar)) {
        log(`✅ ${envVar} referenced in config`, 'green');
      } else {
        log(`⚠️  ${envVar} not referenced in config`, 'yellow');
      }
    });
    
    return true;
  } catch (error) {
    log(`❌ Error reading app.config.js: ${error.message}`, 'red');
    return false;
  }
}

function showNextSteps(configValid) {
  log('\n📋 Next Steps:', 'cyan');
  
  if (!configValid) {
    log('\n1. 🔧 Complete Firebase Setup:', 'yellow');
    log('   - Follow the guide: docs/firebase-setup-guide.md', 'blue');
    log('   - Create Firebase project', 'blue');
    log('   - Enable Google Authentication', 'blue');
    log('   - Get OAuth client IDs', 'blue');
    
    log('\n2. 📝 Configure Environment:', 'yellow');
    log('   - Copy .env.example to .env', 'blue');
    log('   - Fill in your actual client IDs', 'blue');
    
    log('\n3. 🔄 Restart Development Server:', 'yellow');
    log('   - npx expo start', 'blue');
  } else {
    log('\n✅ Configuration looks good!', 'green');
    log('\n🚀 Ready to test:', 'yellow');
    log('   - npx expo start', 'blue');
    log('   - Test Google Sign-In in your app', 'blue');
    
    log('\n📱 For production builds:', 'yellow');
    log('   - Configure EAS Secrets', 'blue');
    log('   - npx eas build --platform android --profile development', 'blue');
  }
}

function main() {
  log('🔍 Google Sign-In Configuration Checker', 'bold');
  log('=====================================', 'bold');
  
  const configValid = checkConfiguration();
  checkAppConfig();
  showNextSteps(configValid);
  
  log('\n📚 For detailed setup instructions:', 'cyan');
  log('   docs/firebase-setup-guide.md', 'blue');
  
  process.exit(configValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { checkConfiguration, checkAppConfig };