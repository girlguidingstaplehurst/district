## Context

The existing `contentful-navigation` capability already produces one normalized
navigation tree in `src/content.js`. Desktop, mobile, and footer components
consume the normalized `label` field, so the change can remain localized to
navigation entry normalization and its unit tests.

## Goals / Non-Goals

**Goals:**

- Resolve a non-empty Contentful `linkLabel` before the existing label fields.
- Preserve current fallback behavior for missing or empty values.
- Ensure every existing navigation presentation receives the resolved label.
- Add focused regression coverage for precedence and fallback cases.

**Non-Goals:**

- Changing navigation destinations, hierarchy, ordering, or link behavior.
- Changing the Contentful model, API requests, or generated assets.
- Updating desktop, mobile, or footer rendering components independently.

## Decisions

- **Resolve the label during normalization.** The normalized tree is the shared
  boundary for all navigation renderers, so resolving `linkLabel` there avoids
  duplicated precedence logic and guarantees consistent labels across surfaces.
- **Treat empty strings as absent.** Use the existing truthy fallback convention
  so an accidentally blank `linkLabel` cannot create an unusable blank link.
- **Preserve existing fallback ordering.** Keep `label`, then `name`, then
  `title`, followed by `Untitled`, minimizing compatibility risk for existing
  Contentful entries.
- **Test the normalization contract rather than renderers.** The renderer code
  already displays `item.label`; testing the shared normalized output directly
  provides focused coverage without duplicating component tests.

## Risks / Trade-offs

- [Contentful editors may enter whitespace-only labels] -> The requested
  fallback contract explicitly covers empty values; implementation should follow
  the existing field semantics and tests should cover the chosen empty-value
  behavior.
- [A renderer could bypass the normalized label in the future] -> Keep the
  navigation label contract documented in the capability spec and retain the
  normalization tests.

## Migration Plan

No data migration or deployment sequencing is required. Existing entries retain
their current displayed labels; entries with a populated `linkLabel` begin using
it after the frontend is deployed. Rollback is the normal frontend rollback.
