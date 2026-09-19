## Purpose

Provide friendly, recoverable client-side experiences when a requested Contentful page is missing or when Contentful cannot be reached, while keeping the requested frontend URL intact.

## ADDED Requirements

### Requirement: Missing Contentful pages render a playful missing-page state
The frontend SHALL render a dedicated playful state when the requested frontend path has no matching Contentful page. The state SHALL explain that Olivia could not find the page, display the supplied `/oh-no-olivia.png` image centered below the heading and above the explanation, use the brand visual theme, and provide a link whose destination is `/`.

#### Scenario: Unknown frontend slug
- **WHEN** the React application resolves a frontend path and Contentful returns no matching page
- **THEN** the application renders the playful missing-content state at the requested URL

#### Scenario: Missing-page recovery
- **WHEN** a visitor views the playful missing-page state
- **THEN** the visitor sees the centered Olivia image below the heading and above the explanation, brand styling, and a home link targeting `/`

### Requirement: Contentful failures render a separate playful error state
The frontend SHALL render a dedicated playful state when the Contentful page lookup fails due to an error. The state SHALL explain that Olivia left the page in the kitchen, display the supplied `/oh-no-olivia.png` image centered below the heading and above the explanation, use the brand visual theme, and provide a link whose destination is `/`.

#### Scenario: Contentful lookup failure
- **WHEN** the React application cannot complete the Contentful lookup for a requested frontend path
- **THEN** the application renders the playful Contentful-error state at the requested URL

#### Scenario: Error-page recovery
- **WHEN** a visitor views the playful Contentful-error state
- **THEN** the visitor sees the centered Olivia image below the heading and above the explanation, brand styling, and a home link targeting `/`

### Requirement: Invalid paths do not require a dedicated not-found route
The frontend SHALL resolve missing-page and Contentful-error outcomes directly from the catch-all frontend route without navigating to or requiring a dedicated `/not-found` route.

#### Scenario: Invalid path remains addressable
- **WHEN** a visitor requests an invalid frontend path
- **THEN** the browser URL remains the requested path while the appropriate playful state is rendered

## MODIFIED Requirements

### Requirement: Unknown frontend GET paths serve the application shell
The service SHALL serve the embedded React HTML shell for unknown frontend `GET` and `HEAD` paths so the client can resolve the requested Contentful page and render either the page, the playful missing-content state, or the playful Contentful-error state.

#### Scenario: New Contentful page path
- **WHEN** a browser requests a frontend path created in Contentful after the last service deployment
- **THEN** the service returns the React application shell and the frontend attempts page resolution

#### Scenario: Unknown frontend path
- **WHEN** a browser requests a frontend path with no matching Contentful page
- **THEN** the service returns the React application shell and the frontend renders the playful missing-content state

#### Scenario: Contentful failure path
- **WHEN** a browser requests a frontend path and the Contentful lookup fails
- **THEN** the service returns the React application shell and the frontend renders the playful Contentful-error state

### Requirement: API and static asset routing is preserved
The service SHALL route API requests and requests for existing static assets to their dedicated handlers instead of the React HTML fallback.

#### Scenario: API request
- **WHEN** a client requests an API endpoint
- **THEN** the API handler processes the request and the response is not replaced with the React shell

#### Scenario: Static asset request
- **WHEN** a client requests an existing JavaScript, CSS, image, or other embedded asset
- **THEN** the service returns that asset with its existing behavior

### Requirement: Non-frontend methods are not treated as page navigation
The service SHALL not turn unsupported or non-frontend methods into successful React page responses merely because their path is unknown.

#### Scenario: Unsupported method on unknown path
- **WHEN** a client uses a method other than `GET` or `HEAD` against an unknown frontend path
- **THEN** the service returns its normal method or not-found response rather than the React shell
