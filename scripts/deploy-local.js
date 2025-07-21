#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building all DataPrism Apps...');

try {
  // Build demo analytics
  console.log('📊 Building demo analytics...');
  execSync('cd apps/demo-analytics && npm run build', { stdio: 'inherit' });
  
  // Build docs
  console.log('📚 Building documentation...');
  execSync('cd apps/docs && npm run build', { stdio: 'inherit' });
  
  // Build ironcalc spreadsheet  
  console.log('📱 Building IronCalc spreadsheet...');
  execSync('cd apps/ironcalc-spreadsheet && NODE_ENV=production npm run build', { stdio: 'inherit' });
  
  // Create combined dist directory
  console.log('📁 Creating combined distribution...');
  
  // Clean and create dist
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  
  // Copy demo analytics to subdirectory
  console.log('📋 Copying demo analytics...');
  fs.mkdirSync('dist/demo-analytics', { recursive: true });
  execSync('cp -r apps/demo-analytics/dist/* dist/demo-analytics/');
  
  // Copy docs content to guide, api, and other doc subdirectories
  console.log('📋 Copying documentation...');
  ['guide', 'api', 'examples', 'plugins'].forEach(dir => {
    fs.mkdirSync(`dist/${dir}`, { recursive: true });
  });
  
  try {
    // Copy doc subdirectories if they exist
    if (fs.existsSync('apps/docs/.vitepress/dist/guide')) {
      execSync('cp -r apps/docs/.vitepress/dist/guide/* dist/guide/');
    }
    if (fs.existsSync('apps/docs/.vitepress/dist/api')) {
      execSync('cp -r apps/docs/.vitepress/dist/api/* dist/api/');
    }
    if (fs.existsSync('apps/docs/.vitepress/dist/examples')) {
      execSync('cp -r apps/docs/.vitepress/dist/examples/* dist/examples/');
    }
    if (fs.existsSync('apps/docs/.vitepress/dist/plugins')) {
      execSync('cp -r apps/docs/.vitepress/dist/plugins/* dist/plugins/');
    }
    // Copy docs assets (CSS, JS, fonts) but not index.html
    execSync('find apps/docs/.vitepress/dist -name "*.css" -o -name "*.js" -o -name "*.woff*" -o -name "*.ico" -exec cp {} dist/ \\; 2>/dev/null || true');
  } catch (error) {
    console.log('⚠️  Some docs files may not exist, continuing...');
  }
  
  // Copy ironcalc spreadsheet to subdirectory
  console.log('📋 Copying IronCalc spreadsheet...');
  fs.mkdirSync('dist/ironcalc-spreadsheet', { recursive: true });
  execSync('cp -r apps/ironcalc-spreadsheet/dist/* dist/ironcalc-spreadsheet/');
  
  // Create index page with app links
  console.log('📄 Creating main index page...');
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DataPrism Apps</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #f8fafc; }
        .header { text-align: center; margin-bottom: 3rem; }
        .logo { font-size: 2.5rem; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .tagline { color: #64748b; font-size: 1.1rem; margin-top: 0.5rem; }
        .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .app-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); transition: transform 0.2s, box-shadow 0.2s; }
        .app-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .app-card h3 { margin-top: 0; color: #1e293b; font-size: 1.3rem; }
        .app-card p { color: #64748b; line-height: 1.6; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 1rem; font-weight: 500; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-1px); }
        .status { display: inline-block; padding: 0.25rem 0.5rem; background: #10b981; color: white; font-size: 0.75rem; border-radius: 4px; margin-left: 0.5rem; }
        footer { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="logo">DataPrism</h1>
        <p class="tagline">Browser-native analytics with WebAssembly</p>
    </div>
    
    <div class="app-grid">
        <div class="app-card">
            <h3>Demo Analytics <span class="status">Live</span></h3>
            <p>Interactive data analytics demo showcasing DataPrism's core capabilities with DuckDB, WebAssembly, and visualization plugins.</p>
            <a href="./demo-analytics/" class="btn">Launch Demo</a>
        </div>
        
        <div class="app-card">
            <h3>IronCalc Spreadsheet <span class="status">New</span></h3>
            <p>Excel-compatible spreadsheet application powered by IronCalc formula engine with 180+ functions and real-time calculation.</p>
            <a href="./ironcalc-spreadsheet/" class="btn">Launch Spreadsheet</a>
        </div>
        
        <div class="app-card">
            <h3>Documentation</h3>
            <p>Complete documentation for DataPrism Core, plugins, and integration guides.</p>
            <a href="https://docs.dataprism.dev" class="btn">View Docs</a>
        </div>
    </div>
    
    <footer>
        <p>DataPrism - Experience the future of browser-based data analytics</p>
        <p><small>Built with ❤️ using WebAssembly, React, and DuckDB</small></p>
    </footer>
</body>
</html>`;

  fs.writeFileSync('dist/index.html', indexHtml);
  
  console.log('✅ Build complete!');
  console.log('📁 Distribution created in ./dist/');
  console.log('🌐 Apps available at:');
  console.log('   • Main: ./dist/index.html');
  console.log('   • Demo Analytics: ./dist/demo-analytics/index.html');
  console.log('   • Documentation: ./dist/guide/index.html');
  console.log('   • API Reference: ./dist/api/index.html');
  console.log('   • IronCalc Spreadsheet: ./dist/ironcalc-spreadsheet/index.html');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}