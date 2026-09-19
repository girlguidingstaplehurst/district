## Why

The frontend production build currently succeeds with four ESLint `no-unused-vars` warnings caused by imports that are no longer used. Removing the stale imports will make the lint output clean and reduce noise without changing the application's behavior.

## What Changes

- Remove the unused `Text`, `dayjs`, and `documentToReactComponents` imports from `src/NoMatch.js`.
- Remove the unused `useBreakpoint` import from `src/components/Carousel.js`.
- Verify the frontend lint/build output no longer reports unused-variable warnings.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a tooling/code-quality cleanup with no spec-level behavior change.

## Impact

- Affected frontend source files: `src/NoMatch.js` and `src/components/Carousel.js`.
- No API, runtime behavior, dependency, or deployment changes are expected.
- The existing React build and test tooling will be used for verification.
