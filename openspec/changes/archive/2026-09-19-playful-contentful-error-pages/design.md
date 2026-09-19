## Context

The React entry point uses a React Router catch-all route to derive a Contentful page name from the browser pathname. `getPage` returns either a page or `null`, while Contentful request failures reject the lookup. The current page-loading path needs to preserve those outcomes instead of treating both as an operation-routing failure. The existing `NoMatch` component and `/not-found` route are not sufficient for the two requested user-facing states.

The Go service already serves the embedded React shell for unknown `GET` and `HEAD` paths after registering API handlers and static assets. This design leaves that server behavior unchanged.

## Goals / Non-Goals

**Goals:**

- Make page resolution expose three explicit outcomes: loading, page found, and missing/error.
- Render separate, reusable playful components for missing content and Contentful failures.
- Keep invalid URLs unchanged and make both recovery links point to `/`.
- Apply the existing `brand` theme to the fallback states.
- Provide a stable image-placeholder region that can later be replaced with supplied artwork.
- Remove the obsolete dedicated `/not-found` route.
- Add focused frontend tests for outcome selection, displayed messages, theme usage, image placeholder, and home-link destination.

**Non-Goals:**

- Changing the Contentful schema, query shape, or credentials.
- Changing Go server routing, API behavior, or static asset handling.
- Adding retry behavior or a new error-reporting service.
- Replacing the normal loading state for Contentful pages.

## Decisions

### Represent missing and failed lookups separately

The page-loading component will distinguish a successful `null` result from a rejected Contentful request. A missing result selects the missing-content presentation; a rejected promise selects the Contentful-error presentation. This preserves useful semantics for visitors and tests rather than collapsing all non-successes into one generic state.

**Alternative considered:** Treat every non-success as Not Found. Rejected requests are operational failures, so presenting them as a missing page would be misleading and would hide the distinction requested by the product behavior.

### Render fallback states in place

The catch-all route will continue to render the page-loading component, which selects the appropriate fallback directly. It will not navigate to `/not-found`; the browser keeps the originally requested path. This matches SPA behavior and avoids an extra route whose only purpose is presentation.

**Alternative considered:** Redirect to `/not-found`. That loses the requested URL and cannot distinguish missing content from a failed Contentful lookup without adding query or state conventions.

### Use dedicated fallback components with shared visual structure

Missing and error states will be separate components or explicit variants sharing a small presentational structure: brand-themed container, Olivia message, image placeholder, and a React Router link to `/`. The wording remains distinct while layout and accessibility behavior stay consistent.

**Alternative considered:** One generic `NoMatch` component with a dynamic message. Separate named states make the semantic distinction clear and avoid retaining misleading “not found” terminology for Contentful failures.

### Use the existing brand theme rather than introducing theme-specific data

The fallback view will select the existing `brand` Chakra theme and use the application’s established typography/layout primitives. The image area will be a non-networked placeholder with accessible labeling, so no asset or Contentful model change is required now.

**Alternative considered:** Add a new theme or commit temporary artwork. That adds unnecessary design/data scope before the supplied image is available.

### Test at the page-resolution boundary

Tests will mock or control the Contentful lookup and verify that `null`, resolved page data, and rejected lookup outcomes select the expected UI. Component-level assertions will verify the two messages, `/` link, placeholder, and brand styling without coupling tests to generated build output.

**Alternative considered:** Test only through the browser build. That is slower and would make the missing/error distinction harder to isolate.

## Risks / Trade-offs

- [Contentful errors may be transient] -> The error page will provide a home link but no retry control, keeping the requested scope small; future retry behavior can be added separately.
- [A placeholder may be interpreted as final artwork] -> Give it an explicit accessible label and stable styling that communicates reserved image space.
- [Existing tests may assume `NoMatch` or `/not-found`] -> Update those tests to assert the new in-place states and confirm no dedicated route is required.
- [Build artifacts can become stale] -> Run the repository’s frontend build as part of implementation and inspect generated changes before completion.
