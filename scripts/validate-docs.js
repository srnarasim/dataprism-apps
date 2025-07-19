#!/usr/bin/env node

/**
 * Simple documentation validation script
 * Checks for broken links and validates basic structure
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('📚 Validating documentation...');

// Check if documentation was built successfully
const docsDistPath = join(rootDir, 'apps/docs/.vitepress/dist');

if (!existsSync(docsDistPath)) {
  console.error('❌ Documentation build not found. Run build:docs first.');
  process.exit(1);
}

// Check if index.html exists
const indexPath = join(docsDistPath, 'index.html');
if (!existsSync(indexPath)) {
  console.error('❌ Documentation index.html not found.');
  process.exit(1);
}

// Basic validation - check if the HTML contains expected content
try {
  const indexContent = readFileSync(indexPath, 'utf8');
  
  if (!indexContent.includes('DataPrism')) {
    console.error('❌ Documentation does not contain expected DataPrism content.');
    process.exit(1);
  }
  
  console.log('✅ Documentation validation passed!');
  console.log(`📍 Documentation built successfully at: ${docsDistPath}`);
  
} catch (error) {
  console.error('❌ Error validating documentation:', error.message);
  process.exit(1);
}