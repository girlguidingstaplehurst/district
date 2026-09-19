## Context

The production React build currently completes but emits four `no-unused-vars` warnings: three unused imports in `src/NoMatch.js` and one unused import in `src/components/Carousel.js`. The repository uses Create React App's ESLint configuration through `react-scripts`; no separate lint configuration or new dependency is needed.

## Goals / Non-Goals

**Goals:**

- Remove the four stale imports identified by ESLint.
- Confirm the affected files produce no unused-variable warnings.
- Confirm the production build remains successful.

**Non-Goals:**

- Changing component behavior, layout, routing, or Contentful integration.
- Introducing a standalone lint tool or changing lint rules.
- Addressing the unrelated Browserslist database notice or existing Go build failures.

## Decisions

- **Delete unused imports rather than suppress warnings.** The warnings identify imports with no references, so deletion keeps the source accurate and avoids hiding future warnings. Adding ESLint disable comments was considered but would preserve dead code and reduce lint coverage.
- **Use the existing project tooling for verification.** `npx eslint src --ext .js` directly reports source lint warnings, while `npm run build` verifies the normal production path. Adding a new npm script or dependency was considered unnecessary for this narrow cleanup.
- **Limit the source scope to the reported files.** The current lint output identifies only `src/NoMatch.js` and `src/components/Carousel.js`; broad refactoring is not needed to satisfy the change.

## Risks / Trade-offs

- [An import may have an indirect side effect] -> Verify the affected imports are unused bindings and run the production build after removal; the listed imports are library/component symbols rather than explicit side-effect imports.
- [Other warnings may appear later] -> Treat this change as the cleanup of the currently observed four warnings and keep verification focused on the complete lint output.
