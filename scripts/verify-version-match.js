const fs = require('fs');
const path = require('path');

const DEFAULT_PACKAGE_PATH = path.join(__dirname, '../package.json');

function normalizeVersionName(value, label) {
  const raw = String(value ?? '').trim().replace(/^[vV]/, '');
  if (/^[0-9]+$/.test(raw)) return `${raw}.0.0`;
  if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(raw)) return raw;
  throw new Error(`${label} must be a semantic version such as 4.2.6.`);
}

function readPackageVersion(packagePath = DEFAULT_PACKAGE_PATH) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return normalizeVersionName(pkg.version, 'package.json version');
}

function assertVersionNameMatchesPackage(requestedVersion, packageVersion = readPackageVersion()) {
  const requested = normalizeVersionName(requestedVersion, 'Android version name');
  const authoritative = normalizeVersionName(packageVersion, 'package.json version');
  if (requested !== authoritative) {
    throw new Error(
      `Android version name "${requested}" does not match the authoritative web/package version ` +
      `"${authoritative}". Update package.json first or request the matching version.`,
    );
  }
  return authoritative;
}

if (require.main === module) {
  try {
    const requestedVersion = process.argv[2];
    if (!requestedVersion) throw new Error('Pass the requested Android version name to validate.');
    const version = assertVersionNameMatchesPackage(requestedVersion);
    console.log(`Android and web version names agree: ${version}`);
  } catch (error) {
    console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

module.exports = {
  assertVersionNameMatchesPackage,
  normalizeVersionName,
  readPackageVersion,
};
