## Purpose

This capability keeps the frontend's source-level lint output free of warnings caused by imports that are not used by the application.

## Requirements

### Requirement: Frontend linting reports no unused imports in the affected files

The frontend source files covered by this cleanup SHALL contain no unused imports, so the configured ESLint `no-unused-vars` rule reports no warnings for those files.

#### Scenario: Lint the cleaned frontend files

- **WHEN** the frontend lint/build process analyzes `src/NoMatch.js` and `src/components/Carousel.js`
- **THEN** it reports no unused-variable warnings for those files

### Requirement: Removing unused imports preserves frontend behavior

The cleanup SHALL remove only imports that have no runtime or rendering use and SHALL preserve the existing behavior of the affected components.

#### Scenario: Build the frontend after cleanup

- **WHEN** the production frontend build runs after the unused imports are removed
- **THEN** the build succeeds and the affected components retain their existing rendered behavior
