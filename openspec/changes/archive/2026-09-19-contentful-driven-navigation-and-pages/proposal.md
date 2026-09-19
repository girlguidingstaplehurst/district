## Why

The site currently hard-codes its pages and navigation in the React application, so adding or reorganizing content requires a code change and deployment. Contentful already owns the page content and now provides page names, full logo theme names, and `districtNavigation` entries; making those models authoritative will let editors publish new pages and navigation without changing the application.

## What Changes

- Resolve published internal pages from Contentful by page `name`, including pages that are not linked from navigation.
- Replace the hard-coded React route and navigation lists with Contentful-driven page routing and a shared navigation tree.
- Rename the visible root navigation item from “Home” to “District” and place Volunteering beneath it.
- Support internal and external navigation destinations, ordered top-level categories, and child links.
- Preserve arbitrary navigation depth, render grandchildren inline with indentation, and log a warning when nesting exceeds two levels.
- Render the same Contentful navigation in desktop navigation and the desktop footer.
- Render desktop footer navigation as columns, with bold top-level links and standard-weight child links, followed by KLGC branding, copyright, and version information.
- Omit footer navigation links on mobile and provide a scrollable mobile navigation drawer with scroll-position hints.
- Replace the Go frontend path allowlist with a safe SPA HTML fallback for unknown frontend requests, allowing React to render the client-side Not Found page for unknown slugs.
- Preserve API and static asset routing while serving the React shell for frontend paths.
- Allow `linkOverride` to replace the generated internal destination exactly, including external URLs.
- Map full theme names such as `2nd-staplehurst-rainbows` to the corresponding colour theme while using the full theme name for page-specific logos.

## Capabilities

### New Capabilities

- `contentful-pages`: Published Contentful pages are routable by stable slug and render with their explicit theme, including pages omitted from navigation.
- `contentful-navigation`: Published `districtNavigation` entries provide shared, ordered, hierarchical navigation for desktop, mobile, and footer surfaces.
- `frontend-routing-fallback`: Unknown frontend paths receive the React application shell while API and static asset paths retain their existing behavior.

### Modified Capabilities

- None. No existing main capability specifications are present in the repository.

## Impact

- React routing, page loading, theme selection, navigation, mobile drawer, and footer components under `src/`.
- Contentful queries and client-side loading/error handling.
- Go HTTP frontend serving and its route fallback behavior.
- Frontend and Go tests covering navigation normalization, page lookup, missing pages, responsive rendering, and SPA fallback behavior.
- Generated frontend build artifacts after implementation, without changing Contentful schema definitions (which are already supplied).
