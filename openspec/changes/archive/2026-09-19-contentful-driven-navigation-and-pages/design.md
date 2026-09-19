## Context

See proposal.md for the motivation and externally visible scope. The current React application declares every page route and navigation item in `src/index.js`, `src/Layout.js`, and `src/components/Footer.js`. `ManagedContent` queries Contentful directly for `districtPage` entries by name, while page theme is currently inferred from URL conventions. The Go service embeds the built React application and currently has frontend path handling that must be changed to support arbitrary client-side routes.

Contentful now provides page names and full logo theme names on pages, plus a `districtNavigation` content type with labels, ordering, parent relationships, link overrides, and internal or external destinations.

## Goals / Non-Goals

**Goals:**

- Establish one client-side Contentful data layer for page lookup and navigation.
- Normalize published navigation entries into an ordered tree shared by desktop navigation, the mobile drawer, and the desktop footer.
- Keep routing independent of navigation membership so unlisted published pages remain directly addressable.
- Make explicit Contentful page theme data authoritative.
- Preserve the separation between API/static asset handling and the React SPA fallback.
- Make malformed or unexpectedly deep navigation observable without rejecting otherwise usable content.

**Non-Goals:**

- Adding or changing the Contentful content model; the required fields and content type already exist.
- Supporting draft-preview API credentials or a separate preview environment; published pages reachable by slug are the initial preview mechanism.
- Server-side rendering, server-side Contentful page lookup, or HTTP-level 404 generation for missing client-side pages.
- Enforcing a maximum navigation depth in Contentful.
- Changing unrelated API endpoints or authentication behavior.

## Decisions

### Use page names as the routing contract

The React router will use a catch-all frontend route and resolve the current path to a published `districtPage` by `name`. The root path will retain its existing District page mapping, while non-root paths map directly to page names. Navigation will link to page names but will not be required for a page to be routable.

This is preferred over resolving routes through navigation because it supports unlisted pages, direct links, and previewing without coupling page existence to menu visibility.

### Centralize Contentful reads and normalized navigation state

Introduce a shared frontend content/navigation layer that fetches published page and navigation data, normalizes navigation entries into a tree, and exposes loading/error states. Desktop navigation, the mobile drawer, and the footer will consume the same normalized data rather than each maintaining separate lists or issuing independent queries.

The layer will distinguish internal page references from external URLs. Internal references produce React Router destinations; external destinations produce normal anchors. `linkOverride`, when present, is used verbatim before any generated destination.

### Preserve arbitrary depth, warn beyond the supported presentation depth

Tree construction will be recursive and will retain entries deeper than two levels. During normalization or rendering, the system will emit a `console.warn` that includes enough entry context to identify the deep item whenever depth exceeds two. Renderers may present deep entries recursively rather than silently dropping them, so future navigation data remains discoverable while the current two-level design is monitored.

Malformed parent references will be handled defensively: entries whose parent cannot be resolved will be promoted to the top level with a warning, while cycle detection will prevent infinite traversal and report the malformed relationship.

### Make page theme explicit

Page rendering and layout chrome will use the theme returned by the page entry. The final kebab-case segment maps full themes such as `2nd-staplehurst-rainbows` to the `rainbows` colour palette. The full theme value selects a matching page-specific logo, with a colour-theme fallback logo. URL parsing and unit-name conventions will no longer determine theme.

### Use one catch-all SPA fallback after API and asset handling

The Go service will retain explicit API routing and embedded-asset serving, then serve the embedded `index.html` for unknown frontend `GET` and `HEAD` paths. Other methods will not be converted into successful page responses. React will perform the final page lookup and render Not Found for an unknown slug.

This is preferred over keeping a frontend path allowlist because an allowlist necessarily prevents newly published Contentful pages from working until deployment. HTTP-level Not Found responses for client-side page misses are intentionally deferred because the current architecture is client-rendered.

### Render responsive navigation surfaces from the same tree

Desktop primary navigation will render top-level entries as links or grouped menus based on their children. Grandchildren and deeper descendants render inline in the child menu with indentation rather than opening additional popouts. The mobile drawer will use a constrained, vertically scrollable region with fixed header/footer areas, indentation by depth, normal weight for grandchildren, and scroll-position indicators.

The desktop footer will render each top-level item as a column, with the top-level destination in bold and all descendants in standard weight on separate lines, indented by depth. Footer links use compact non-wrapping text. Branding, copyright, and version information will render below the navigation. The mobile footer will omit navigation columns and retain only branding and metadata.

### Test the data layer separately from responsive presentation

Navigation normalization, ordering, destination classification, malformed-data handling, and depth warnings should be tested as deterministic logic. Component tests should verify page loading states, missing-page behavior, desktop footer structure, and mobile drawer scrolling/hints. Go tests should verify the SPA fallback does not intercept API, asset, or unsupported-method requests.

## Risks / Trade-offs

- [Contentful query failure] -> Show a finite error/Not Found state instead of an indefinite skeleton, log the failure, and keep API/static asset behavior unaffected.
- [Unpublished or missing linked page] -> Treat the navigation item as invalid for internal navigation, log identifying context, and avoid producing a broken application route.
- [Navigation cycles] -> Detect cycles while building/rendering the tree, log a warning, and stop traversing the cyclic edge.
- [Deep navigation] -> Preserve and render the data while warning beyond depth two; this may create a layout that is not optimized for very deep trees, which is intentional until product requirements change.
- [Client-side 404 semantics] -> Direct unknown frontend requests initially receive HTTP 200 with the app shell; React renders Not Found. Server-side SEO-aware 404 behavior is outside this design.
- [Footer width on desktop] -> A large number of top-level categories may create crowded columns; use responsive wrapping/overflow-safe layout rather than reintroducing a hard-coded category limit.
- [Contentful credentials in frontend] -> Continue the existing public delivery-client approach for published content; draft preview and secret-token handling are not added by this change.

## Migration Plan

1. Deploy the frontend data layer and dynamic routing while retaining compatibility with the existing root and unit page slugs.
2. Deploy the Go SPA fallback so direct requests to new frontend paths reach React.
3. Publish or verify `districtNavigation` entries, including District as the root category and Volunteering as its child, then confirm desktop, mobile, and footer rendering.
4. Verify direct access to an unlisted published page and an unknown slug.
5. If rollback is required, revert the frontend and service deployment together; Contentful navigation entries can remain published because the old hard-coded UI will ignore them, while existing hard-coded routes continue to serve known pages.

## Open Questions

- None that change the defined behavior or implementation approach. Draft-content preview using Contentful's preview API can be designed separately if needed.
