#!/usr/bin/env node

/**
 * Local Build Script for All DataPrism Apps
 * Builds all apps and creates a local deployment directory
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apps = ['mcp-analytics-workflow', 'demo-analytics', 'ironcalc-spreadsheet'];
const rootDir = path.join(__dirname, '..');

console.log('🏗️  Building All DataPrism Apps...\n');

// Clean previous build
const deployDir = path.join(rootDir, 'local-deploy');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
  console.log('🧹 Cleaned previous build directory');
}

fs.mkdirSync(deployDir, { recursive: true });

// Copy main index.html
const mainIndex = path.join(rootDir, 'index.html');
if (fs.existsSync(mainIndex)) {
  fs.copyFileSync(mainIndex, path.join(deployDir, 'index.html'));
  console.log('✅ Copied main index.html');
} else {
  console.log('❌ Main index.html not found');
}

// Build each app
for (const app of apps) {
  console.log(`\n📱 Building ${app}:`);
  
  const appDir = path.join(rootDir, 'apps', app);
  const distDir = path.join(appDir, 'dist');
  const deployAppDir = path.join(deployDir, app);
  
  if (!fs.existsSync(appDir)) {
    console.log(`  ⚠️  App directory not found: ${appDir}`);
    continue;
  }
  
  try {
    // Build the app
    console.log(`  🔨 Building...`);
    execSync('npm run build', { 
      cwd: appDir, 
      stdio: 'pipe'
    });
    
    // Copy build output
    if (fs.existsSync(distDir)) {
      fs.mkdirSync(deployAppDir, { recursive: true });
      
      // Copy all files from dist to deploy directory
      const files = fs.readdirSync(distDir);
      for (const file of files) {
        const srcPath = path.join(distDir, file);
        const destPath = path.join(deployAppDir, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
          fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
      
      console.log(`  ✅ Deployed to /local-deploy/${app}`);
    } else {
      console.log(`  ❌ Build output not found in ${distDir}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Build failed: ${error.message}`);
    
    // Create fallback page
    fs.mkdirSync(deployAppDir, { recursive: true });
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${app} - Build Failed</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .error { color: #e74c3c; }
        .back-link { margin-top: 20px; }
        .back-link a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="error">Build Failed</h1>
        <h2>${app}</h2>
        <p>This application failed to build. Please check the build logs and try again.</p>
        <div class="back-link">
            <a href="/">← Back to DataPrism Apps</a>
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(deployAppDir, 'index.html'), fallbackHtml);
    console.log(`  ⚠️  Created fallback page`);
  }
}

// Copy docs and examples if they exist
const docsDir = path.join(rootDir, 'apps', 'docs');
const examplesDir = path.join(rootDir, 'examples'); 

if (fs.existsSync(docsDir)) {
  const deployDocsDir = path.join(deployDir, 'docs');
  fs.cpSync(docsDir, deployDocsDir, { recursive: true });
  console.log('\n✅ Deployed docs');
} else if (fs.existsSync(path.join(rootDir, 'docs'))) {
  const deployDocsDir = path.join(deployDir, 'docs');
  fs.cpSync(path.join(rootDir, 'docs'), deployDocsDir, { recursive: true });
  console.log('\n✅ Deployed docs from root');
}

if (fs.existsSync(examplesDir)) {
  const deployExamplesDir = path.join(deployDir, 'examples');
  fs.cpSync(examplesDir, deployExamplesDir, { recursive: true });
  console.log('✅ Deployed examples');
}

// List final structure
console.log('\n📂 Local deployment structure:');
try {
  const items = fs.readdirSync(deployDir);
  items.forEach(item => {
    const itemPath = path.join(deployDir, item);
    const isDir = fs.statSync(itemPath).isDirectory();
    console.log(`  ${isDir ? '📁' : '📄'} ${item}`);
    
    if (isDir) {
      const subItems = fs.readdirSync(itemPath);
      if (subItems.includes('index.html')) {
        console.log(`    ✅ index.html`);
      }
    }
  });
} catch (error) {
  console.log('  Error listing structure:', error.message);
}

console.log('\n🎉 Local build complete!');
console.log('📝 To test locally:');
console.log('   1. cd local-deploy');
console.log('   2. npx serve . -p 3000');
console.log('   3. Open http://localhost:3000');
console.log('\n🚀 To deploy to GitHub Pages:');
console.log('   1. Commit and push changes to main branch');
console.log('   2. GitHub Actions will automatically deploy');