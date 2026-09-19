# Agent instructions

## Repository shape

- This is a Go 1.25 service (`cmd/district`) that serves the React frontend embedded from `build/`; the frontend source is under `src/` and its npm project is at the repository root.
- The HTTP API is defined by `api/public-api.yaml`; generated server/models live in `internal/rest/`, and generated test client/builders live in `internal/test/`. Do not hand-edit generated `*.gen.go` files; update the OpenAPI spec/config or generator source instead.
- `internal/service/service.go` is the runtime wiring: it loads config, serves embedded frontend assets, validates OpenAPI requests, protects `/api/v1/admin` with Google JWT auth, and listens on `:8080`.
- `deploy/k8s/local` is the local Skaffold/Kubernetes setup, including PostgreSQL; production manifests are under `deploy/k8s/prod`, with Azure deployment configuration under `deploy/azure/prod`.

## Commands

- Frontend dependencies are locked by `package-lock.json`; use `npm ci` before frontend work. Use `npm start` for the React dev server, `npm run build` to regenerate `build/`, and `npm test -- --watchAll=false` for a non-interactive frontend test run.
- Run the Go service directly with `go run ./cmd/district` (or `mage run`). `mage dev` runs `skaffold dev`, builds with ko, applies `deploy/k8s/local`, and port-forwards the service to `localhost:8080` and PostgreSQL to `localhost:5432`; it requires Docker/Kubernetes, Skaffold, and ko.
- Run Go tests with `go test ./...`; format changed Go files with `gofmt`. There is no repository-specific lint or typecheck command configured.
- `mage generate` runs `go generate ./...`. Generation includes the React build (`embed.go`), oapi-codegen server/models, mock generation, and the test client/builder; run it after changing the OpenAPI document or generator inputs, then inspect generated diffs.
- After archiving an OpenSpec change, run `npm run build` and inspect the generated `build/` artifact changes so the embedded frontend assets are up to date.

## Runtime and deployment details

- Local Kubernetes supplies PostgreSQL and `DATABASE_URL`; production deployment expects secret-backed `DATABASE_URL`, SMTP settings, and `GOOGLE_RECAPTCHA_SECRET` (see `deploy/k8s/*/patches`). Never commit those values.
- The GitHub Actions workflow on pushes to `main` creates a semver release, builds multi-architecture images with ko, updates production image references, and deploys the Azure Container App. Changes to deployment image tags may be overwritten by that workflow.
