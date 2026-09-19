## Purpose

Allow published Contentful pages to be created, addressed, previewed, and rendered by their Contentful `name` without requiring a code deployment or navigation entry.

## Requirements

### Requirement: Published pages are routable by name
The system SHALL resolve a published page from its Contentful `name` and render its heading and rich content at the corresponding frontend path.

#### Scenario: Root District page
- **WHEN** a visitor requests the root frontend path
- **THEN** the system renders the published District page associated with the root page configuration

#### Scenario: Newly created page
- **WHEN** a visitor requests the path matching a newly published page's name
- **THEN** the system renders that page without requiring a frontend code change or deployment

### Requirement: Page theme comes from Contentful
The system SHALL use the page's explicit Contentful theme when rendering page content and associated page chrome.

#### Scenario: Page has an explicit theme
- **WHEN** a page is loaded successfully
- **THEN** its configured theme is used instead of deriving theme values from the URL or page-name convention

### Requirement: Full themes map to colour themes and logos
The system SHALL use the final segment of a full kebab-case theme name for colour styling, while using the full theme name to select a page-specific logo when one exists.

#### Scenario: Unit-specific theme
- **WHEN** a page theme is `4th-staplehurst-brownies`
- **THEN** Brownies colours are used and the 4th Staplehurst Brownies logo is displayed

### Requirement: Pages need not be navigable
The system SHALL render a published page addressed directly by slug even when no `districtNavigation` item references it.

#### Scenario: Unlisted page
- **WHEN** a visitor requests a published page whose slug is absent from navigation
- **THEN** the page is rendered normally

### Requirement: Missing pages render Not Found
The system SHALL render the client-side Not Found experience when no published page matches the requested frontend slug.

#### Scenario: Unknown slug
- **WHEN** a visitor requests a frontend path with no matching published page
- **THEN** the system renders the Not Found experience rather than an empty page or indefinite loading state
