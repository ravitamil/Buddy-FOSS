#!/usr/bin/env node
/**
 * Environment Setup Script
 * Copies .env.example to .env if it doesn't exist
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

function setupEnvironment() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  log('🔧 Setting up environment configuration...', 'cyan');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    log('✅ .env file already exists', 'green');
    log('💡 Run "npm run check-auth" to verify configuration', 'blue');
    return true;
  }
  
  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    log('❌ .env.example file not found', 'red');
    log('💡 This file should exist in the project root', 'yellow');
    return false;
  }
  
  try {
    // Copy .env.example to .env
    fs.copyFileSync(envExamplePath, envPath);
    log('✅ Created .env file from .env.example', 'green');
    
    log('\n📝 Next steps:', 'yellow');
    log('1. Edit .env file with your Firebase client IDs', 'blue');
    log('2. Follow the setup guide: docs/firebase-setup-guide.md', 'blue');
    log('3. Run "npm run check-auth" to verify configuration', 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Error creating .env file: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Buddy.io Environment Setup', 'bold');
  log('============================', 'bold');
  
  const success = setupEnvironment();
  
  if (success) {
    log('\n🎉 Environment setup complete!', 'green');
  } else {
    log('\n❌ Environment setup failed', 'red');
  }
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { setupEnvironment };