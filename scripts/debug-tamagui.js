#!/usr/bin/env node

// Script to debug Tamagui configuration issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Tamagui Debug Script');
console.log('========================');

// Check if tamagui.config.ts exists
const configPath = path.join(__dirname, '..', 'tamagui.config.ts');
if (fs.existsSync(configPath)) {
  console.log('✅ tamagui.config.ts found');
} else {
  console.log('❌ tamagui.config.ts NOT found');
  process.exit(1);
}

// Check Tamagui dependencies
try {
  console.log('\n📦 Checking Tamagui dependencies...');
  const result = execSync('npm ls tamagui @tamagui/core @tamagui/config', { encoding: 'utf-8' });
  console.log(result);
} catch (error) {
  console.log('Error checking dependencies:', error.message);
}

// Check Tamagui CLI
try {
  console.log('\n🔧 Checking Tamagui CLI...');
  const result = execSync('npx @tamagui/cli check', { encoding: 'utf-8' });
  console.log(result);
} catch (error) {
  console.log('Error running Tamagui CLI check:', error.message);
}

// Check metro.config.js
const metroConfigPath = path.join(__dirname, '..', 'metro.config.js');
if (fs.existsSync(metroConfigPath)) {
  console.log('✅ metro.config.js found');
  const metroConfig = fs.readFileSync(metroConfigPath, 'utf-8');
  if (metroConfig.includes('withTamagui')) {
    console.log('✅ withTamagui plugin found in metro.config.js');
  } else {
    console.log('❌ withTamagui plugin NOT found in metro.config.js');
  }
} else {
  console.log('❌ metro.config.js NOT found');
}

console.log('\n📋 Debugging complete. Check the results above for any issues.');