
/**
 * Deployment Verification Script for Sully Booking System
 * This script verifies that all components are ready for Netlify deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Sully Booking System Deployment Readiness...\n');

const checks = [];
let allPassed = true;

// Helper function to add check results
function addCheck(name, passed, message) {
  checks.push({ name, passed, message });
  if (!passed) allPassed = false;
  
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${icon} ${name}: ${status}`);
  if (message) {
    console.log(`   ${message}`);
  }
}

// Check 1: Required files exist
console.log('📁 Checking required files...');

const requiredFiles = [
  'netlify.toml',
  'app/build-netlify.sh',
  'app/.env.example',
  'app/netlify/functions/api.js',
  'app/netlify/functions/auth.js',
  'app/prisma/schema.prisma',
  'app/next.config.js',
  '.gitignore'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  addCheck(`File: ${file}`, exists, exists ? '' : 'File missing - create this file');
});

// Check 2: Build script is executable
console.log('\n🛠️ Checking build configuration...');

const buildScriptPath = path.join(__dirname, 'app/build-netlify.sh');
try {
  const stats = fs.statSync(buildScriptPath);
  const isExecutable = !!(stats.mode & parseInt('111', 8));
  addCheck('Build script executable', isExecutable, isExecutable ? '' : 'Run: chmod +x app/build-netlify.sh');
} catch (error) {
  addCheck('Build script executable', false, 'Build script not found');
}

// Check 3: Environment variables template
console.log('\n🔐 Checking environment configuration...');

try {
  const envExample = fs.readFileSync(path.join(__dirname, 'app/.env.example'), 'utf8');
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  requiredVars.forEach(varName => {
    const hasVar = envExample.includes(varName);
    addCheck(`Environment var: ${varName}`, hasVar, hasVar ? '' : 'Add to .env.example');
  });
} catch (error) {
  addCheck('Environment template', false, 'Cannot read .env.example file');
}

// Check 4: Netlify configuration
console.log('\n🌐 Checking Netlify configuration...');

try {
  const netlifyConfig = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
  
  const configChecks = [
    { name: 'Base directory', check: netlifyConfig.includes('base = "app/"') },
    { name: 'Publish directory', check: netlifyConfig.includes('publish = "app/out"') },
    { name: 'Build command', check: netlifyConfig.includes('build-netlify.sh') },
    { name: 'API redirects', check: netlifyConfig.includes('from = "/api/*"') },
    { name: 'Functions directory', check: netlifyConfig.includes('directory = "app/netlify/functions"') }
  ];
  
  configChecks.forEach(({ name, check }) => {
    addCheck(`Netlify config: ${name}`, check, check ? '' : 'Update netlify.toml');
  });
} catch (error) {
  addCheck('Netlify configuration', false, 'Cannot read netlify.toml file');
}

// Check 5: Package dependencies
console.log('\n📦 Checking dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'app/package.json'), 'utf8'));
  
  const requiredDeps = [
    '@netlify/functions',
    '@prisma/client',
    'stripe',
    'bcryptjs',
    'jsonwebtoken',
    'next'
  ];
  
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDeps.forEach(dep => {
    const hasDep = allDeps.hasOwnProperty(dep);
    addCheck(`Dependency: ${dep}`, hasDep, hasDep ? '' : `Run: yarn add ${dep}`);
  });
} catch (error) {
  addCheck('Package dependencies', false, 'Cannot read package.json');
}

// Check 6: API Functions
console.log('\n⚡ Checking Netlify Functions...');

const functionFiles = [
  'app/netlify/functions/api.js',
  'app/netlify/functions/auth.js'
];

functionFiles.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const hasHandler = content.includes('exports.handler');
    const hasPrisma = content.includes('PrismaClient');
    
    addCheck(`Function: ${file}`, hasHandler, hasHandler ? '' : 'Missing exports.handler');
    addCheck(`Function DB: ${file}`, hasPrisma, hasPrisma ? '' : 'Missing Prisma setup');
  } catch (error) {
    addCheck(`Function: ${file}`, false, 'Function file not found');
  }
});

// Check 7: Documentation
console.log('\n📚 Checking documentation...');

const docFiles = [
  'DEPLOYMENT_README.md',
  'DATABASE_MIGRATION_GUIDE.md',
  'NETLIFY_DEPLOYMENT_CHECKLIST.md',
  'GITHUB_SETUP_GUIDE.md'
];

docFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  addCheck(`Documentation: ${file}`, exists, exists ? '' : 'Documentation file missing');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(60));

const totalChecks = checks.length;
const passedChecks = checks.filter(c => c.passed).length;
const failedChecks = totalChecks - passedChecks;

console.log(`Total Checks: ${totalChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`❌ Failed: ${failedChecks}`);
console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (allPassed) {
  console.log('\n🎉 CONGRATULATIONS! 🎉');
  console.log('Your Sully Booking System is ready for GitHub → Netlify deployment!');
  console.log('\nNext Steps:');
  console.log('1. Commit all changes to Git');
  console.log('2. Push to GitHub repository');
  console.log('3. Connect repository to Netlify');
  console.log('4. Configure environment variables');
  console.log('5. Deploy and test!');
} else {
  console.log('\n⚠️  DEPLOYMENT NOT READY');
  console.log('Please fix the failed checks above before deploying.');
  console.log('\nFailed Checks:');
  checks.filter(c => !c.passed).forEach(check => {
    console.log(`❌ ${check.name}: ${check.message}`);
  });
}

console.log('\n📖 For detailed instructions, see:');
console.log('- DEPLOYMENT_README.md');
console.log('- NETLIFY_DEPLOYMENT_CHECKLIST.md');
console.log('- GITHUB_SETUP_GUIDE.md');
console.log('\n🚀 Happy deploying!');

process.exit(allPassed ? 0 : 1);
