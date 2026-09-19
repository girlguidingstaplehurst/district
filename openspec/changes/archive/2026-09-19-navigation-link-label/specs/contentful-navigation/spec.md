## MODIFIED Requirements

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
