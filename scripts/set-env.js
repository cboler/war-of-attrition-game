const fs = require('fs');
const path = require('path');

let packageVersion = '';
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  packageVersion = pkg.version || '';
} catch (e) {}

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const ga4MeasurementId = process.env.GA4_MEASUREMENT_ID || '';
const appVersion = process.env.APP_VERSION || process.env.npm_package_version || packageVersion || '0.0.0';
const rulesetVersion = process.env.RULESET_VERSION || '2026.08.1';

const stringLiteral = value => JSON.stringify(String(value));

const envConfigFile = `export const environment = {
  production: true,
  googleClientId: ${stringLiteral(googleClientId)},
  ga4MeasurementId: ${stringLiteral(ga4MeasurementId)},
  appVersion: ${stringLiteral(appVersion)},
  rulesetVersion: ${stringLiteral(rulesetVersion)}
};
`;

const devEnvConfigFile = `export const environment = {
  production: false,
  googleClientId: ${stringLiteral(googleClientId)},
  ga4MeasurementId: ${stringLiteral(ga4MeasurementId)},
  appVersion: ${stringLiteral(`${appVersion}-dev`)},
  rulesetVersion: ${stringLiteral(rulesetVersion)}
};
`;

const envDir = path.join(__dirname, '../src/environments');

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envConfigFile);
fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvConfigFile);

console.log(
  `Environment files generated successfully. Google Client ID configured: ${!!googleClientId}. ` +
  `GA4 configured: ${!!ga4MeasurementId}. App version: ${appVersion}.`
);
