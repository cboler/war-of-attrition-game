const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../docs/browser');
const destDir = path.join(__dirname, '../docs');

if (fs.existsSync(srcDir)) {
  try {
    fs.cpSync(srcDir, destDir, { recursive: true });
    fs.rmSync(srcDir, { recursive: true, force: true });
  } catch (e) {
    console.warn('Error syncing browser build files:', e.message);
  }
}

// Ensure 404.html exists for GitHub Pages SPA fallback
const indexPath = path.join(destDir, 'index.html');
const fallbackPath = path.join(destDir, '404.html');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, fallbackPath);
}

console.log('Build files moved successfully to docs/ with 404.html fallback.');
