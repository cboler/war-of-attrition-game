# Repository Versioning Rules

1. **Authoritative Version**: `package.json` is the single source of truth for the application version name (`X.Y.Z`).
2. **Android Packed Version Code**: Android Play Console `versionCode` must always be calculated as:
   $$\text{versionCode} = \text{MAJOR} \times 10000 + \text{MINOR} \times 100 + \text{PATCH}$$
3. **Synchronization**: Whenever the version is changed, all 11 linked files documented in the `bump-version` skill must be updated together so web, Android, test suites, and GitHub Actions CI remain in lockstep.
4. **Validation**: Always run `npm run test:version` (or `node --test scripts/verify-version-match.spec.js`) to verify version agreement before committing.
