## 1. Page-resolution outcomes

- [x] 1.1 Update the Contentful page-loading flow to preserve successful page results, `null` missing-page results, and rejected lookup errors as distinct states; verify with focused frontend tests for all three outcomes
- [x] 1.2 Remove the dedicated `/not-found` route and keep fallback rendering in the catch-all route; verify an invalid path remains in the browser URL while selecting a fallback state

## 2. Playful fallback presentations

- [x] 2.1 Implement the missing-content presentation with Olivia’s “couldn’t find the content” message, an accessible reserved image area, brand styling, and a link targeting `/`; verify its rendered text, placeholder, theme, and link destination
- [x] 2.2 Implement the Contentful-error presentation with Olivia’s “left the page in the kitchen” message, an accessible reserved image area, brand styling, and a link targeting `/`; verify its rendered text, placeholder, theme, and link destination
- [x] 2.3 Update or add frontend component tests to ensure missing and error states are visually distinct and successful Contentful pages remain unaffected

## 3. Integration and generated assets

- [x] 3.1 Run the frontend test suite with `npm test -- --watchAll=false` and resolve regressions related to routing or fallback rendering
- [x] 3.2 Run `npm run build` and inspect generated `build/` changes so the embedded frontend reflects the new fallback behavior
- [x] 3.3 Run the relevant Go tests with `go test ./...` and verify API, static asset, and SPA fallback behavior remains unchanged
