# version-display Specification

## Purpose

Expose the release or Git revision represented by the running embedded frontend so users and maintainers can identify the deployed application build.

## Requirements

### Requirement: Application displays its build version in the shared footer

The system SHALL display the application build version at the bottom of the shared UI footer. A local or development build SHALL use the full Git description form when available, such as `v0.57.0-3-g2b856b6`, while a production release build SHALL display the exact release tag supplied by the release workflow.

#### Scenario: Production release displays its release tag

- **WHEN** a production frontend is built with a release tag such as `v0.58.0`
- **THEN** the shared footer displays `v0.58.0` as the application version

#### Scenario: Development build displays its Git description

- **WHEN** a local frontend build is created from a commit described as `v0.57.0-3-g2b856b6`
- **THEN** the shared footer displays `v0.57.0-3-g2b856b6` as the application version

#### Scenario: Version metadata is unavailable

- **WHEN** a frontend build has no supplied release version and Git metadata cannot be read
- **THEN** the shared footer displays `development` instead of being blank or failing to build

### Requirement: Production frontend assets contain the release version

The production build workflow SHALL provide its calculated release tag to the frontend build before the generated frontend assets are embedded into the Go service container.

#### Scenario: Release build embeds the calculated version

- **WHEN** the release workflow calculates the next release tag and builds the service container
- **THEN** the frontend build receives that exact tag
- **AND** the generated frontend assets embedded in the container display the same tag
