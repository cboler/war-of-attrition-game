const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.resolve(projectRoot, 'store-assets', 'screenshots');
const expectedParent = path.resolve(projectRoot, 'store-assets');

if (
  path.dirname(outputDirectory) !== expectedParent ||
  path.basename(outputDirectory) !== 'screenshots' ||
  !outputDirectory.startsWith(`${projectRoot}${path.sep}`)
) {
  throw new Error(`Refusing to clean unexpected screenshot path: ${outputDirectory}`);
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });
console.log(`Cleaned generated screenshot output: ${outputDirectory}`);
