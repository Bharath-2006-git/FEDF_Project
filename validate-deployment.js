#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 * Checks if all required files and configurations are in place for Render deployment
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REQUIRED_FILES = [
  'render.yaml',
  'package.json',
  'vite.config.ts',
  'backend/main.py',
  'backend/config.py',
  'backend/requirements.txt',
  'Dockerfile.backend',
  'Dockerfile.frontend',
  '.env.example'
];

const REQUIRED_BACKEND_DEPS = [
  'fastapi',
  'uvicorn',
  'supabase',
  'python-jose',
  'passlib'
];

const REQUIRED_DOCS = [
  'RENDER_DEPLOYMENT.md',
  'RENDER_QUICK_START.md',
  'DEPLOYMENT_CHECKLIST.md',
  'RENDER_READY.md'
];

console.log('🔍 Validating CarbonSense for Render Deployment...\n');

let hasErrors = false;

// Check required files
console.log('📁 Checking required files...');
REQUIRED_FILES.forEach(file => {
  if (existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

// Check documentation files
console.log('\n📚 Checking documentation...');
REQUIRED_DOCS.forEach(file => {
  if (existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} - Missing (recommended)`);
  }
});

// Check backend dependencies
console.log('\n📦 Checking backend dependencies...');
try {
  const requirements = readFileSync('backend/requirements.txt', 'utf8');
  REQUIRED_BACKEND_DEPS.forEach(dep => {
    if (requirements.includes(dep)) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('  ❌ Could not read backend/requirements.txt');
  hasErrors = true;
}

// Check package.json scripts
console.log('\n🔧 Checking npm scripts...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'preview', 'start'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ npm run ${script}`);
    } else {
      console.log(`  ❌ npm run ${script} - MISSING`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('  ❌ Could not read package.json');
  hasErrors = true;
}

// Check render.yaml configuration
console.log('\n⚙️  Checking render.yaml...');
try {
  const renderConfig = readFileSync('render.yaml', 'utf8');
  const checks = [
    { name: 'Backend service defined', pattern: /type:\s*web/ },
    { name: 'Frontend service defined', pattern: /name:\s*carbonsense-frontend/ },
    { name: 'Build commands set', pattern: /buildCommand:/ },
    { name: 'Start commands set', pattern: /startCommand:/ },
    { name: 'Environment variables', pattern: /envVars:/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(renderConfig)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ⚠️  ${check.name} - Not found`);
    }
  });
} catch (error) {
  console.log('  ❌ Could not read render.yaml');
  hasErrors = true;
}

// Check .env.example
console.log('\n🔐 Checking environment template...');
try {
  const envExample = readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'VITE_API_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ⚠️  ${varName} - Not found in .env.example`);
    }
  });
} catch (error) {
  console.log('  ❌ Could not read .env.example');
  hasErrors = true;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED');
  console.log('\nPlease fix the errors above before deploying to Render.');
  console.log('See RENDER_DEPLOYMENT.md for detailed instructions.');
  process.exit(1);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('\n🎉 Your project is ready for Render deployment!');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Follow RENDER_QUICK_START.md for deployment');
  console.log('3. Or use DEPLOYMENT_CHECKLIST.md for step-by-step guide');
  process.exit(0);
}
