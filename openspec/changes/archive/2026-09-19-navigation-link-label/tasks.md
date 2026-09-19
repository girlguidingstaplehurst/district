## 1. Navigation Label Resolution

- [x] 1.1 Update navigation entry normalization in `src/content.js` to prefer a non-empty `linkLabel` before `label`, `name`, and `title`, preserving the `Untitled` fallback; verify the existing navigation tree behavior remains unchanged for entries without `linkLabel`.

## 2. Regression Coverage

- [x] 2.1 Add normalization tests in `src/content.test.js` covering non-empty `linkLabel` precedence and fallback when `linkLabel` is missing or empty; verify with `npm test -- --watchAll=false`.
- [x] 2.2 Run the relevant frontend test suite and confirm the resolved label is consumed by the shared navigation tree without changes to desktop, mobile, or footer renderers.
