const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../docs/browser');
const destDir = path.join(__dirname, '../docs');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const oldPath = path.join(srcDir, file);
    const newPath = path.join(destDir, file);
    fs.renameSync(oldPath, newPath);
  }
  try {
    fs.rmdirSync(srcDir);
  } catch (e) {
    console.warn('Could not remove browser directory:', e.message);
  }
}

// Ensure 404.html exists for GitHub Pages SPA fallback
const indexPath = path.join(destDir, 'index.html');
const fallbackPath = path.join(destDir, '404.html');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, fallbackPath);
}

console.log('Build files moved successfully to docs/ with 404.html fallback.');
