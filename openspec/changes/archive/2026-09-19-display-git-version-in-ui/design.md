## Context

District embeds the React production build into the Go service. The frontend must therefore receive the release version before the assets are generated, while local builds should remain useful when no release environment variable is present.

## Approach

Use the same two-stage resolution as Booking:

1. Prefer `REACT_APP_VERSION` when supplied by CI.
2. Otherwise run `git describe --tags --always --dirty`.
3. Fall back to `development` if Git metadata cannot be read or is empty.

The npm build command will invoke a small Node wrapper. The wrapper resolves the version and passes it to `react-scripts` through `REACT_APP_VERSION`. The footer reads that compiled environment value and renders it below the copyright notice.

```text
CI release tag
      |
      v
REACT_APP_VERSION --> frontend build --> embedded assets --> footer

No supplied tag --> git describe --> frontend build --> footer
                         |
                         +--> unavailable: development
```

## Scope Boundaries

- No version HTTP endpoint is introduced.
- No runtime Git inspection is performed by the Go service.
- No booking functionality or other Booking features are migrated.

## Verification

- Unit tests cover supplied release versions, Git descriptions, unavailable Git metadata, and footer rendering.
- The production frontend build is run before the container build in CI.
