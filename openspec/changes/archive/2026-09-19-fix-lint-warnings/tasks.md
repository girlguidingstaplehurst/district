## 1. Remove reported unused imports

- [x] 1.1 Remove the unused `Text`, `dayjs`, and `documentToReactComponents` imports from `src/NoMatch.js`.
- [x] 1.2 Remove the unused `useBreakpoint` import from `src/components/Carousel.js`.

## 2. Verify lint and build behavior

- [x] 2.1 Run `npx eslint src --ext .js` and confirm the affected files report no `no-unused-vars` warnings.
- [x] 2.2 Run `npm run build` and confirm the production frontend build succeeds.
- [x] 2.3 Run the relevant frontend tests with `npm test -- --watchAll=false` and record the result. Both suites passed (10 tests); existing React act and Contentful/Jest console warnings remain.
