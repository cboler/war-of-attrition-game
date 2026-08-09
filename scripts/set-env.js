const fs = require('fs');
const path = require('path');

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

const envConfigFile = `export const environment = {
  production: true,
  googleClientId: '${googleClientId}'
};
`;

const devEnvConfigFile = `export const environment = {
  production: false,
  googleClientId: '${googleClientId}'
};
`;

const envDir = path.join(__dirname, '../src/environments');

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envConfigFile);
fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvConfigFile);

console.log(`Environment files generated successfully. Google Client ID configured: ${!!googleClientId}`);
