#!/usr/bin/env node
/**
 * CreatorVault Routes Verification Script
 * 
 * Verifies that all routes defined in App.tsx have corresponding page components
 * and checks for common routing issues
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 CreatorVault Routes Verification\n');
console.log('='.repeat(50));

const errors = [];
const warnings = [];

// Read App.tsx to extract routes
const appTsxPath = join(__dirname, '..', 'client', 'src', 'App.tsx');
const appTsxContent = readFileSync(appTsxPath, 'utf-8');

// Extract route definitions (handles both component={Component} and component={Component} syntax)
const routeRegex = /<Route\s+path="([^"]+)"\s+component=\{([^}]+)\}|<Route\s+component=\{([^}]+)\}|<Route\s+path="([^"]+)"/g;
const routes = [];
let match;

while ((match = routeRegex.exec(appTsxContent)) !== null) {
  const path = match[1] || match[4] || null;
  const component = match[2] || match[3] || 'NotFound';
  
  if (path || component !== 'NotFound') {
    routes.push({
      path: path || '(catch-all)',
      component: component,
    });
  }
}

console.log(`\n📋 Found ${routes.length} routes in App.tsx\n`);

// Verify each route's component exists
const pagesDir = join(__dirname, '..', 'client', 'src', 'pages');
const srcDir = join(__dirname, '..', 'client', 'src');

routes.forEach(route => {
  // Try pages directory first
  let componentFile = join(pagesDir, `${route.component}.tsx`);
  let exists = existsSync(componentFile);
  
  // If not found, try components directory
  if (!exists) {
    componentFile = join(srcDir, 'components', `${route.component}.tsx`);
    exists = existsSync(componentFile);
  }
  
  // If not found, try root src directory
  if (!exists) {
    componentFile = join(srcDir, `${route.component}.tsx`);
    exists = existsSync(componentFile);
  }
  
  if (exists) {
    console.log(`✅ ${route.path} → ${route.component}`);
  } else {
    console.log(`❌ ${route.path} → ${route.component} (FILE NOT FOUND)`);
    errors.push(`Component ${route.component} not found for route ${route.path}`);
  }
});

// Check for common routing issues
console.log('\n📋 Checking for common routing issues...\n');

// 1. Check for duplicate routes
const pathCounts = {};
routes.forEach(r => {
  pathCounts[r.path] = (pathCounts[r.path] || 0) + 1;
});

Object.entries(pathCounts).forEach(([path, count]) => {
  if (count > 1) {
    console.log(`⚠️  Duplicate route: ${path} (defined ${count} times)`);
    warnings.push(`Duplicate route: ${path}`);
  }
});

// 2. Check for wouter Link usage vs href
const clientSrcDir = join(__dirname, '..', 'client', 'src');
console.log('\n📋 Checking Link component usage...\n');

// Import filesystem functions at the top
import { readdirSync, statSync } from 'fs';
import { join as pathJoin } from 'path';

function getAllTsxFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = pathJoin(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const tsxFiles = getAllTsxFiles(clientSrcDir);
let linkIssues = 0;

tsxFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const relativePath = file.replace(clientSrcDir, '');
  
  // Check if file imports Link from wouter
  const hasWouterLink = /import.*Link.*from ['"]wouter['"]/.test(content);
  
  // Check for Link usage with 'to' prop (incorrect for wouter)
  const linkToMatches = content.match(/<Link\s+to=/g);
  if (linkToMatches && hasWouterLink) {
    console.log(`⚠️  ${relativePath}: Using Link with 'to' prop (should be 'href')`);
    linkIssues++;
  }
});

if (linkIssues === 0) {
  console.log('✅ All Link components use correct props');
} else {
  warnings.push(`${linkIssues} files have incorrect Link usage`);
}

// 3. Check for navigation with setLocation
console.log('\n📋 Checking navigation patterns...\n');

const setLocationUsage = [];
tsxFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const relativePath = file.replace(clientSrcDir, '');
  
  if (content.includes('setLocation(')) {
    const matches = content.match(/setLocation\(['"]([^'"]+)['"]\)/g);
    if (matches) {
      matches.forEach(m => {
        const path = m.match(/['"]([^'"]+)['"]/)[1];
        setLocationUsage.push({ file: relativePath, path });
      });
    }
  }
});

console.log(`Found ${setLocationUsage.length} setLocation() calls`);

// Verify all setLocation paths exist in routes
const routePaths = routes.map(r => r.path);
setLocationUsage.forEach(({ file, path }) => {
  // Check if it's a dynamic route (contains :id or similar)
  const isDynamic = path.includes('${');
  const pathPattern = isDynamic ? path.split('${')[0] : path;
  
  // Check if route exists (simple match)
  const exists = routePaths.some(r => {
    return r === path || r === pathPattern || (r.includes(':') && pathPattern.startsWith(r.split(':')[0]));
  });
  
  if (!exists && !isDynamic) {
    console.log(`⚠️  ${file}: Navigates to "${path}" (no matching route)`);
    warnings.push(`Navigation to undefined route: ${path} in ${file}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Verification Summary\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All routes verified successfully!\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`❌ Errors: ${errors.length}\n`);
  errors.forEach(e => console.log(`   ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings: ${warnings.length}\n`);
  warnings.forEach(w => console.log(`   ${w}`));
}

if (errors.length > 0) {
  console.log('\n🚫 Route verification FAILED\n');
  process.exit(1);
}

console.log('\n⚠️  Route verification passed with warnings\n');
process.exit(0);
