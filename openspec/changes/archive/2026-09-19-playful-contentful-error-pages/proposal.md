## Why

Unknown Contentful paths currently surface as router/API errors instead of a useful page, and Contentful request failures do not give visitors a clear recovery path. Distinguishing missing content from failed content retrieval will make client-side routing resilient and provide a consistent, friendly experience.

## What Changes

- Resolve unmatched frontend paths through the React catch-all route and let the page loader distinguish successful, missing, and failed Contentful lookups.
- Render a playful missing-content page explaining that Olivia could not find the requested content.
- Render a separate playful Contentful-error page explaining that Olivia left the page in the kitchen.
- Give both states a reserved image area for a future supplied image.
- Give both states a home link targeting `/`.
- Render both states using the `brand` theme.
- Remove the dedicated `/not-found` route; invalid paths remain at their requested URLs while rendering the appropriate state.
- Preserve the existing Go SPA fallback, API routing, and static asset behavior.

## Capabilities

### New Capabilities
- `playful-contentful-error-pages`: Client-side missing-content and Contentful-error states for unmatched frontend paths.

### Modified Capabilities
- `frontend-routing-fallback`: React, rather than the server or an API operation error, determines the user-facing result for unknown frontend paths.

## Impact

- React routing and Contentful page-loading components under `src/`.
- The not-found presentation and associated tests.
- Frontend build artifacts after implementation.
- Existing Go fallback behavior remains in place and should continue to be covered by its current tests.
