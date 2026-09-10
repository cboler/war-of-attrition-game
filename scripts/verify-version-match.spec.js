const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertVersionNameMatchesPackage,
  normalizeVersionName,
  readPackageVersion,
} = require('./verify-version-match');

test('normalizes supported workflow version-name forms', () => {
  assert.equal(normalizeVersionName('v4.2.5', 'version'), '4.2.5');
  assert.equal(normalizeVersionName('4', 'version'), '4.0.0');
  assert.throws(() => normalizeVersionName('release-next', 'version'), /semantic version/);
});

test('accepts only an Android version name matching the package version', () => {
  assert.equal(assertVersionNameMatchesPackage('v4.2.5', '4.2.5'), '4.2.5');
  assert.throws(
    () => assertVersionNameMatchesPackage('4.2.4', '4.2.5'),
    /does not match the authoritative web\/package version/,
  );
});

test('keeps the checked-in authoritative package version at 4.2.5', () => {
  assert.equal(readPackageVersion(), '4.2.5');
});
