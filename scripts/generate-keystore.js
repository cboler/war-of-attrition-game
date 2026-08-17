const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const opensslPath = 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe';
const outputDir = path.join(__dirname, '..', 'android');
const keyPath = path.join(outputDir, 'upload-key.pem');
const certPath = path.join(outputDir, 'upload-cert.pem');
const keystorePath = path.join(outputDir, 'upload-keystore.p12');
const jksPath = path.join(outputDir, 'upload-keystore.jks');

const KEY_ALIAS = 'upload';
const STORE_PASS = 'warofattrition2026';

console.log('Generating Android Upload Keystore and Fingerprints...');

// 1. Generate RSA private key and self-signed certificate (valid for 10,000 days)
const genCertCmd = `"${opensslPath}" req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 10000 -nodes -subj "/CN=War of Attrition/OU=Game/O=War of Attrition/C=US"`;
execSync(genCertCmd, { stdio: 'inherit' });

// 2. Export to PKCS12 (.p12 / .keystore)
const exportPkcs12Cmd = `"${opensslPath}" pkcs12 -export -in "${certPath}" -inkey "${keyPath}" -out "${keystorePath}" -name "${KEY_ALIAS}" -passout "pass:${STORE_PASS}"`;
execSync(exportPkcs12Cmd, { stdio: 'inherit' });

// Copy to .jks / .keystore standard names
fs.copyFileSync(keystorePath, jksPath);
fs.copyFileSync(keystorePath, path.join(outputDir, 'upload-keystore.keystore'));

// 3. Extract SHA-1 Fingerprint
const sha1Output = execSync(`"${opensslPath}" x509 -in "${certPath}" -noout -fingerprint -sha1`, { encoding: 'utf8' }).trim();
const sha1 = sha1Output.replace(/^SHA1 Fingerprint=/, '').trim();

// 4. Extract SHA-256 Fingerprint
const sha256Output = execSync(`"${opensslPath}" x509 -in "${certPath}" -noout -fingerprint -sha256`, { encoding: 'utf8' }).trim();
const sha256 = sha256Output.replace(/^SHA256 Fingerprint=/, '').trim();

// Clean up temporary pem files
if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
if (fs.existsSync(certPath)) fs.unlinkSync(certPath);

console.log('\n======================================================');
console.log('ANDROID UPLOAD KEYSTORE GENERATED SUCCESSFULLY');
console.log('======================================================');
console.log(`Keystore Location: ${keystorePath}`);
console.log(`Key Alias:         ${KEY_ALIAS}`);
console.log(`Keystore Password: ${STORE_PASS}`);
console.log('------------------------------------------------------');
console.log(`SHA-1 Fingerprint:   ${sha1}`);
console.log(`SHA-256 Fingerprint: ${sha256}`);
console.log('======================================================\n');
