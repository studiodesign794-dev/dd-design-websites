const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const output = path.join(root, 'dist');
const publicFiles = [
  'index.html',
  'styles.css',
  'script.js',
  'admin.html',
  'admin.css',
  'admin.js',
  'admin-preview.css',
  'book.html',
  'book-page.css',
  'book-page.js',
];

for (const file of publicFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Required website asset is missing: ${file}`);
  }
}

fs.mkdirSync(output, { recursive: true });
for (const file of publicFiles) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

console.log(`Prepared ${publicFiles.length} public website files in ${output}`);
