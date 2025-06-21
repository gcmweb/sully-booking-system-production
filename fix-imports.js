const fs = require('fs');
const path = require('path');

// Get all files with @/ imports (excluding node_modules and .next)
const { execSync } = require('child_process');
const files = execSync(`find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .next | xargs grep -l "@/" 2>/dev/null`, { encoding: 'utf8' }).trim().split('\n').filter(f => f);

console.log(`Found ${files.length} files with @/ imports`);

files.forEach(filePath => {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace @/components/ imports
  content = content.replace(/from ['"]@\/components\/([^'"]+)['"]/g, (match, componentPath) => {
    const currentDir = path.dirname(filePath);
    const targetPath = path.join('app/components', componentPath);
    let relativePath = path.relative(currentDir, targetPath);
    
    // Ensure forward slashes and proper ./ prefix
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    return `from "${relativePath}"`;
  });
  
  // Replace @/lib/ imports
  content = content.replace(/from ['"]@\/lib\/([^'"]+)['"]/g, (match, libPath) => {
    const currentDir = path.dirname(filePath);
    const targetPath = path.join('app/lib', libPath);
    let relativePath = path.relative(currentDir, targetPath);
    
    // Ensure forward slashes and proper ./ prefix
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    return `from "${relativePath}"`;
  });
  
  // Replace @/hooks/ imports
  content = content.replace(/from ['"]@\/hooks\/([^'"]+)['"]/g, (match, hookPath) => {
    const currentDir = path.dirname(filePath);
    const targetPath = path.join('app/hooks', hookPath);
    let relativePath = path.relative(currentDir, targetPath);
    
    // Ensure forward slashes and proper ./ prefix
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    return `from "${relativePath}"`;
  });
  
  // Replace any other @/ imports (catch-all)
  content = content.replace(/from ['"]@\/([^'"]+)['"]/g, (match, importPath) => {
    const currentDir = path.dirname(filePath);
    const targetPath = path.join('app', importPath);
    let relativePath = path.relative(currentDir, targetPath);
    
    // Ensure forward slashes and proper ./ prefix
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    return `from "${relativePath}"`;
  });
  
  // Also handle import statements (not just from)
  content = content.replace(/import ([^'"]+) from ['"]@\/([^'"]+)['"]/g, (match, importName, importPath) => {
    const currentDir = path.dirname(filePath);
    const targetPath = path.join('app', importPath);
    let relativePath = path.relative(currentDir, targetPath);
    
    // Ensure forward slashes and proper ./ prefix
    relativePath = relativePath.replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    return `import ${importName} from "${relativePath}"`;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated: ${filePath}`);
  } else {
    console.log(`- No changes: ${filePath}`);
  }
});

console.log('Import replacement complete!');
