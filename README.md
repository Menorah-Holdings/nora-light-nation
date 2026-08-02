# Nora Light Nation (Web)

Nora Light Nation is the React + Vite frontend for NoraPlus.

## Development

1. Install dependencies:

```bash
npm install
```

1. Create local environment file (if needed):

```bash
cp .env.example .env.local
```

1. Start dev server:

```bash
npm run dev
```

## Quality and Release Gates

```bash
npm run test           # Required gate
npm run build          # Required gate
npm run lint           # Lint report (may fail on existing debt)
npm run lint:warn      # Non-blocking lint gate for this sprint
npm run release:check  # test + build + lint:warn
```

Lint policy for this sprint:

- Build and tests are required for release readiness.
- Lint runs as a warning gate while pre-existing lint debt is being retired.

## CI

A lightweight CI gate is available at:

- `.github/workflows/release-gates.yml`

It runs tests and build as required checks and lint with continue-on-error.
