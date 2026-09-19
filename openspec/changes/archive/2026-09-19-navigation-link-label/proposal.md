## Why

Contentful navigation entries currently derive their displayed labels from generic
entry fields, which prevents editors from choosing a concise or context-specific
label for a navigation link. Supporting `linkLabel` gives navigation its own
presentation label while preserving the existing fallback behavior.

## What Changes

- Prefer a non-empty `linkLabel` when normalizing each navigation entry.
- Fall back to the existing `label`, `name`, and `title` fields when `linkLabel`
  is missing or empty.
- Continue using the normalized label consistently in desktop, mobile, and footer
  navigation.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `contentful-navigation`: navigation entries support an explicit `linkLabel`
  that takes precedence over the existing label fields, with fallback when it is
  absent or empty.

## Impact

The primary implementation is in `src/content.js`, with tests added or updated
for navigation normalization. Existing navigation renderers in `src/Layout.js`
and `src/components/Footer.js` consume the normalized label and require no API or
deployment changes.
