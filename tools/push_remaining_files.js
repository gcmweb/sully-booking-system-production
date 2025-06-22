#!/usr/bin/env node

const fs = require('fs');

// Read all files from the JSON
const allFiles = JSON.parse(fs.readFileSync('/tmp/files_to_push.json', 'utf8'));

// Skip the first file since it was already pushed
const remainingFiles = allFiles.slice(1);

// Split into batches of 10 files each
const batchSize = 10;
const batches = [];

for (let i = 0; i < remainingFiles.length; i += batchSize) {
  batches.push(remainingFiles.slice(i, i + batchSize));
}

// Write each batch to a separate file
batches.forEach((batch, index) => {
  fs.writeFileSync(`/tmp/batch_${index + 1}.json`, JSON.stringify(batch, null, 2));
  console.log(`Created batch ${index + 1} with ${batch.length} files`);
});

console.log(`Total batches created: ${batches.length}`);
console.log(`Total remaining files: ${remainingFiles.length}`);
