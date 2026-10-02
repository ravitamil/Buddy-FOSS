#!/usr/bin/env node
/**
 * Android Authentication Configuration Checker
 * Comprehensive checker for Android-specific Google Sign-In setup
 */

const fs = require('fs');
const path = require('path');

function checkAndroidAuthConfig() {
  console.log('🤖 Android Authentication Configuration Checker');
  console.log('==============================================\n');

  let hasIssues = false;

  // Check google-services.json
  console.log('📱 Checking google-services.json...');
  const googleServicesPath = path.join(process.cwd(), 'google-services.json');
  
  if (!fs.existsSync(googleServicesPath)) {
    console.log('❌ google-services.json not found');
    hasIssues = true;
  } else {
    try {
      const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
      
      // Check project info
      if (googleServices.project_info) {
        console.log(`✅ Project ID: ${googleServices.project_info.project_id}`);
        console.log(`✅ Project Number: ${googleServices.project_info.project_number}`);
      } else {
        console.log('❌ Missing project_info in google-services.json');
        hasIssues = true;
      }
      
      // Check client configuration
      if (googleServices.client && googleServices.client.length > 0) {
        const client = googleServices.client[0];
        
        if (client.client_info && client.client_info.android_client_info) {
          console.log(`✅ Package Name: ${client.client_info.android_client_info.package_name}`);
        }
        
        // Check OAuth clients - this is critical for Google Sign-In
        if (client.oauth_client && client.oauth_client.length > 0) {
          console.log(`✅ OAuth clients configured: ${client.oauth_client.length}`);
          client.oauth_client.forEach((oauth, index) => {
            console.log(`   OAuth Client ${index + 1}: ${oauth.client_type || 'Unknown type'}`);
            if (oauth.android_info) {
              console.log(`   Package: ${oauth.android_info.package_name}`);
              console.log(`   SHA1: ${oauth.android_info.certificate_hash || 'Not specified'}`);
            }
          });
        } else {
          console.log('⚠️  No OAuth clients found in google-services.json');
          console.log('   This might cause "RNGoogleSignin: offline use requires server web ClientID" error');
          hasIssues = true;
        }
        
        // Check API keys
        if (client.api_key && client.api_key.length > 0) {
          console.log(`✅ API keys configured: ${client.api_key.length}`);
        } else {
          console.log('❌ No API keys found');
          hasIssues = true;
        }
      } else {
        console.log('❌ No client configuration found');
        hasIssues = true;
      }
    } catch (error) {
      console.log(`❌ Error parsing google-services.json: ${error.message}`);
      hasIssues = true;
    }
  }

  console.log('\n📋 Checking environment variables...');
  
  // Check .env file
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const webClientId = envContent.match(/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=(.+)/);
    const androidClientId = envContent.match(/EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=(.+)/);
    
    if (webClientId && webClientId[1].trim()) {
      console.log(`✅ Web Client ID configured: ${webClientId[1].trim().substring(0, 20)}...`);
    } else {
      console.log('❌ Web Client ID not configured');
      hasIssues = true;
    }
    
    if (androidClientId && androidClientId[1].trim()) {
      console.log(`✅ Android Client ID configured: ${androidClientId[1].trim().substring(0, 20)}...`);
    } else {
      console.log('❌ Android Client ID not configured');
      hasIssues = true;
    }
  } else {
    console.log('❌ .env file not found');
    hasIssues = true;
  }

  console.log('\n🔧 Checking app config...');
  
  // Check app.config.ts or app.config.js
  const appConfigPath = fs.existsSync(path.join(process.cwd(), 'app.config.ts'))
    ? path.join(process.cwd(), 'app.config.ts')
    : path.join(process.cwd(), 'app.config.js');
  if (fs.existsSync(appConfigPath)) {
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
    
    if (appConfigContent.includes('"io.buddy.app"') || appConfigContent.includes("'io.buddy.app'")) {
      console.log('✅ Android package name configured');
    } else {
      console.log('❌ Android package name not configured');
      hasIssues = true;
    }
  } else {
    console.log('❌ app.config.ts/js not found');
    hasIssues = true;
  }

  console.log('\n📦 Checking dependencies...');
  
  // Check package.json for required dependencies
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredDeps = [
      'expo-google-credential-manager',
      'expo-constants'
    ];
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`❌ Missing dependency: ${dep}`);
        hasIssues = true;
      }
    });
  }

  console.log('\n📋 Summary:');
  console.log('============');
  
  if (hasIssues) {
    console.log('❌ Issues found in Android authentication configuration');
    console.log('\n🔧 Recommended fixes:');
    console.log('1. Ensure google-services.json has OAuth clients configured');
    console.log('2. Verify Firebase project has Android app with correct package name');
    console.log('3. Add SHA-1 certificate fingerprint to Firebase project');
    console.log('4. Re-download google-services.json after adding OAuth clients');
    console.log('\n📚 For detailed instructions: docs/firebase-setup-guide.md');
  } else {
    console.log('✅ Android authentication configuration looks good!');
    console.log('\n🚀 Ready for Android builds and testing');
  }
  
  return !hasIssues;
}

if (require.main === module) {
  const success = checkAndroidAuthConfig();
  process.exit(success ? 0 : 1);
}

module.exports = { checkAndroidAuthConfig };