## Why

Users and maintainers need to identify which release or Git revision is running. A visible build version improves deployment verification, support requests, and local development diagnostics.

## What Changes

- Display the application version in the shared footer.
- Resolve local and development versions from Git metadata when no release version is supplied.
- Use the CI-provided release tag for production frontend builds.
- Fall back to `development` when version metadata is unavailable.

## Capabilities

### New Capabilities

- `version-display`: Expose the build or Git-derived application version in the shared user interface.

### Modified Capabilities

None.

## Impact

- React footer and frontend build scripts.
- npm build configuration.
- GitHub Actions release workflow.
- No API, database, authentication, or runtime service contract changes.
