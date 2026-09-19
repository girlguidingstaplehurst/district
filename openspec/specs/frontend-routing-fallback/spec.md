## Purpose

Serve the React application shell for arbitrary frontend paths so Contentful can introduce new routable pages while preserving dedicated API and static asset behavior.

## Requirements

### Requirement: Unknown frontend GET paths serve the application shell
The service SHALL serve the embedded React HTML shell for unknown frontend `GET` and `HEAD` paths so the client can resolve the requested Contentful page.

#### Scenario: New Contentful page path
- **WHEN** a browser requests a frontend path created in Contentful after the last service deployment
- **THEN** the service returns the React application shell and the frontend attempts page resolution

#### Scenario: Unknown frontend path
- **WHEN** a browser requests a frontend path with no matching Contentful page
- **THEN** the service returns the React application shell and the frontend renders Not Found

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
