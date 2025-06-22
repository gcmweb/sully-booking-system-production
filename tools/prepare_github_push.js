#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {
  // Read the list of changed files
  const changedFiles = fs.readFileSync('/tmp/all_changed_files.txt', 'utf8')
    .split('\n')
    .filter(line => line.trim() !== '');

  const files = [];

  for (const filePath of changedFiles) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        files.push({
          path: filePath,
          content: content
        });
      }
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
    }
  }

  // Write the files array as JSON
  fs.writeFileSync('/tmp/files_to_push.json', JSON.stringify(files, null, 2));
  console.log(`Prepared ${files.length} files for GitHub push`);
}

main();
