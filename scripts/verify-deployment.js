#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that all apps are properly built and ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apps = ['mcp-analytics-workflow', 'demo-analytics', 'ironcalc-spreadsheet'];
const rootDir = path.join(__dirname, '..');

console.log('🔍 Verifying DataPrism Apps Deployment...\n');

let allGood = true;

// Check root index.html
const rootIndex = path.join(rootDir, 'index.html');
if (fs.existsSync(rootIndex)) {
  console.log('✅ Root index.html exists');
} else {
  console.log('❌ Root index.html missing');
  allGood = false;
}

// Check each app
apps.forEach(app => {
  console.log(`\n📱 Checking ${app}:`);
  
  const appDir = path.join(rootDir, 'apps', app);
  const distDir = path.join(appDir, 'dist');
  const packageJson = path.join(appDir, 'package.json');
  const indexHtml = path.join(distDir, 'index.html');
  
  // Check if app directory exists
  if (!fs.existsSync(appDir)) {
    console.log(`  ❌ App directory missing: ${appDir}`);
    allGood = false;
    return;
  }
  
  // Check package.json
  if (fs.existsSync(packageJson)) {
    console.log('  ✅ package.json exists');
    
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      if (pkg.scripts && pkg.scripts.build) {
        console.log('  ✅ Build script exists');
      } else {
        console.log('  ⚠️  Build script missing');
      }
    } catch (e) {
      console.log('  ❌ Invalid package.json');
      allGood = false;
    }
  } else {
    console.log('  ❌ package.json missing');
    allGood = false;
  }
  
  // Check build output
  if (fs.existsSync(distDir)) {
    console.log('  ✅ dist directory exists');
    
    if (fs.existsSync(indexHtml)) {
      console.log('  ✅ index.html built');
      
      // Check for assets
      const files = fs.readdirSync(distDir);
      let jsFiles = files.filter(f => f.endsWith('.js'));
      let cssFiles = files.filter(f => f.endsWith('.css'));
      
      // Also check assets directory
      const assetsDir = path.join(distDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        jsFiles = [...jsFiles, ...assetFiles.filter(f => f.endsWith('.js'))];
        cssFiles = [...cssFiles, ...assetFiles.filter(f => f.endsWith('.css'))];
      }
      
      console.log(`  📊 Assets: ${jsFiles.length} JS, ${cssFiles.length} CSS files`);
      
      // Check if index.html has correct base path
      const indexContent = fs.readFileSync(indexHtml, 'utf8');
      if (indexContent.includes('/dataprism-apps/')) {
        console.log('  ✅ Correct base path configured');
      } else {
        console.log('  ⚠️  Base path may not be configured for GitHub Pages');
      }
      
    } else {
      console.log('  ❌ index.html not built');
      allGood = false;
    }
  } else {
    console.log('  ❌ dist directory missing - run npm run build');
    allGood = false;
  }
});

// Check GitHub Actions workflow
const workflowFile = path.join(rootDir, '.github', 'workflows', 'deploy-all-apps.yml');
if (fs.existsSync(workflowFile)) {
  console.log('\n✅ GitHub Actions workflow exists');
} else {
  console.log('\n❌ GitHub Actions workflow missing');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\n📝 Next steps:');
  console.log('1. Commit and push changes to main branch');
  console.log('2. GitHub Actions will automatically deploy all apps');
  console.log('3. Visit https://srnarasim.github.io/dataprism-apps/');
  process.exit(0);
} else {
  console.log('❌ Some issues found. Please fix before deployment.');
  process.exit(1);
}