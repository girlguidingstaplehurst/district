## 1. Contentful data and navigation model

- [x] 1.1 Add a shared frontend Contentful data module/provider for published `districtPage` and `districtNavigation` queries, with finite loading and error states; verify unit tests can mock page and navigation responses without duplicating client setup.
- [x] 1.2 Implement page-name lookup, root District mapping, full-theme colour/logo mapping, and missing-page handling; verify tests cover published, unlisted, unknown, missing-theme, unsupported-theme, and page-specific logo cases.
- [x] 1.3 Normalize navigation entries into ordered recursive trees, classify internal versus external destinations, apply exact `linkOverride` values, and handle missing parents and cycles defensively; verify tests cover ordering, destination types, overrides, malformed relationships, and stable output.
- [x] 1.4 Add depth diagnostics that preserve entries deeper than two levels while logging a warning containing identifying entry context; verify a deep-tree test observes the warning and retains the nested item.

## 2. Dynamic React routing and page rendering

- [x] 2.1 Replace hard-coded page routes with a frontend catch-all route that resolves the current path through the shared page lookup; verify direct navigation to an existing slug renders its Contentful content.
- [x] 2.2 Update managed page rendering and layout theme selection to use the page's explicit Contentful theme rather than pathname parsing; verify existing root and unit pages retain their expected visual themes.
- [x] 2.3 Render the Not Found experience for unknown slugs and Contentful page lookup failures without leaving an indefinite skeleton; verify component tests cover missing and failed page requests.

## 3. Shared navigation surfaces

- [x] 3.1 Replace hard-coded desktop and mobile navigation entries with the shared normalized navigation tree, including the District label and Volunteering hierarchy; verify both renderers display published Contentful entries, exact overrides, internal/external links, and active-page theme colours correctly.
- [x] 3.2 Implement the constrained, vertically scrollable mobile drawer with fixed structural areas and scroll-position hints; verify responsive component tests cover overflow, top/bottom hint visibility, and drawer navigation interactions.
- [x] 3.3 Replace the desktop footer link list with Contentful-driven columns, bold top-level destinations, recursively indented standard-weight descendants, compact single-line links, and metadata/branding below; verify footer tests cover column structure and descendant indentation/order.
- [x] 3.4 Hide footer navigation columns on mobile while retaining KLGC branding, copyright, and version information; verify responsive footer tests confirm links are omitted on mobile.

## 4. Go SPA fallback

- [x] 4.1 Replace the finite frontend route/path list with an embedded `index.html` fallback for unknown frontend `GET` and `HEAD` requests while preserving API and static asset handlers; verify Go tests cover new frontend paths, existing assets, and API requests.
- [x] 4.2 Ensure unsupported methods on unknown paths do not receive a successful React shell response; verify method-specific Go tests assert the normal error/not-found behavior.

## 5. Integration and generated artifacts

- [x] 5.1 Add or update frontend and Go integration tests for direct new-page navigation, unlisted pages, unknown-page Not Found, shared navigation consistency, and SPA fallback behavior; verify `npm test -- --watchAll=false` and `go test ./...` pass.
- [x] 5.2 Build the frontend and refresh embedded build artifacts according to repository generation conventions; verify `npm run build` completes and the generated `build/` output contains the dynamic routing implementation.
- [ ] 5.3 Manually verify Contentful configuration and deployed behavior for District, Volunteering, at least one unit category, an external link, a two-level tree, an unlisted page, and an unknown slug; verify desktop, mobile, and footer layouts at representative viewport sizes.
