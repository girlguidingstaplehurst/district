## Purpose

Provide a single published Contentful navigation tree that controls site navigation across desktop, mobile, and footer presentations while supporting internal pages and external destinations.

## Requirements

### Requirement: Navigation is loaded from districtNavigation
The system SHALL load published `districtNavigation` entries and use their
navigation-specific labels, destinations, parent relationships, and ordering to
construct the site navigation tree. When a non-empty `linkLabel` is present, the
system SHALL use it as the navigation label. When `linkLabel` is missing or
empty, the system SHALL fall back to the existing `label`, `name`, and `title`
fields in that order.

#### Scenario: Explicit navigation label
- **WHEN** a published navigation entry has a non-empty `linkLabel`
- **THEN** all navigation surfaces display the `linkLabel` value

#### Scenario: Missing navigation label
- **WHEN** a published navigation entry does not have a `linkLabel`
- **THEN** the navigation label is resolved from `label`, `name`, or `title` in that order

#### Scenario: Empty navigation label
- **WHEN** a published navigation entry has an empty `linkLabel`
- **THEN** the navigation label falls back to `label`, `name`, or `title` rather than rendering blank

#### Scenario: Ordered top-level categories
- **WHEN** published top-level navigation entries are loaded
- **THEN** they are presented in their configured order

#### Scenario: Child ordering
- **WHEN** a top-level item has published child entries
- **THEN** its child entries are presented in their configured order

### Requirement: Navigation supports internal and external destinations
The system SHALL navigate internal destinations through the application and open external destinations as external links.

#### Scenario: Internal destination
- **WHEN** a navigation item references a published internal page
- **THEN** selecting it navigates to that page's stable slug within the application

#### Scenario: External destination
- **WHEN** a navigation item specifies an external destination
- **THEN** selecting it follows the configured external URL rather than attempting a Contentful page lookup

### Requirement: Link overrides take precedence
The system SHALL use a navigation item's `linkOverride` value exactly when it is set, before resolving any linked page or generated destination.

#### Scenario: External link override
- **WHEN** a navigation item has `linkOverride` set to an external URL
- **THEN** selecting the item follows that exact URL

### Requirement: District contains Volunteering
The navigation SHALL present the root category as “District” and SHALL allow the existing Volunteering page to appear as a child beneath it.

#### Scenario: District hierarchy
- **WHEN** the District and Volunteering navigation entries are published with that parent relationship
- **THEN** the UI displays Volunteering beneath District and displays District instead of Home

### Requirement: Navigation depth beyond two levels is observable
The system SHALL render navigation data deeper than two levels without enforcing a data-model rejection, SHALL display grandchildren inline within the child menu with indentation, and SHALL log a warning when nesting exceeds two levels.

#### Scenario: Deep navigation
- **WHEN** a published navigation tree contains an item deeper than the supported two display levels
- **THEN** the item remains available according to the renderer's recursive behavior and a warning identifies the excessive depth

### Requirement: Navigation styling follows the active page
The system SHALL style the complete primary navigation using the active page's mapped colour theme, while retaining the full page theme for logo selection.

#### Scenario: Themed primary navigation
- **WHEN** a page with theme `1st-staplehurst-guides` is displayed
- **THEN** the top navigation uses Guides colours and the matching full-theme logo

### Requirement: Desktop navigation uses the shared tree
The system SHALL render the Contentful navigation tree in the desktop primary navigation.

#### Scenario: Desktop navigation
- **WHEN** the site is viewed at desktop width
- **THEN** top-level categories and their child links are rendered from the current Contentful navigation data

#### Scenario: Desktop grandchildren
- **WHEN** a category contains a child with a grandchild
- **THEN** the grandchild is rendered in the same child menu with indentation rather than another popout

### Requirement: Mobile navigation is scrollable
The system SHALL render navigation in a vertically scrollable mobile drawer and SHALL provide visual or textual hints when additional navigation content exists above or below the current scroll position.

#### Scenario: Long mobile navigation
- **WHEN** the navigation content exceeds the available drawer height
- **THEN** the drawer can be scrolled and indicates that more content is available

#### Scenario: Mobile hierarchy styling
- **WHEN** nested navigation is displayed in the mobile drawer
- **THEN** child links are indented, grandchildren are further indented, and grandchildren use normal rather than bold weight

#### Scenario: Drawer at scroll boundary
- **WHEN** the drawer is scrolled to its top or bottom boundary
- **THEN** the corresponding unavailable scroll hint is hidden or disabled

### Requirement: Desktop footer uses the shared tree
The system SHALL render desktop footer navigation from the same Contentful navigation tree used by primary navigation.

#### Scenario: Footer columns
- **WHEN** the site is viewed at desktop width
- **THEN** each top-level navigation category is rendered as a column, its category link is bold, and its child links appear one per line in standard weight

#### Scenario: Footer metadata placement
- **WHEN** desktop footer navigation is displayed
- **THEN** the KLGC logo/link and copyright and version information appear below the navigation columns

#### Scenario: Footer descendants
- **WHEN** a category contains grandchildren
- **THEN** the footer renders them on separate lines with indentation corresponding to their depth

### Requirement: Mobile footer omits navigation links
The system SHALL omit footer navigation links on mobile while retaining the KLGC branding and copyright and version information.

#### Scenario: Mobile footer
- **WHEN** the site is viewed at mobile width
- **THEN** footer navigation links are not displayed and the mobile drawer remains the navigation surface
