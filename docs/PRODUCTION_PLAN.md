# AlgoVerse Production Implementation Plan

## Scope

AlgoVerse is a universal DSA learning platform, not a collection of hand-authored algorithm demos. The production system should accept URLs, problem statements, pseudocode, and source code, normalize them into typed learning artifacts, classify the underlying pattern, generate a deterministic visualization trace, and attach tutor content, quizzes, notes, progress, and practice recommendations.

## Target Folder Structure

```text
.
|-- frontend/
|   |-- src/app/                 # Next.js App Router routes
|   |-- src/components/          # Playback, tutor, quiz, notes, editor, catalog UI
|   |-- src/store/               # Zustand playback state
|   `-- src/lib/                 # API clients, validators, formatting helpers
|-- backend/
|   |-- src/ingestion/           # URL, text, pseudocode, and code normalization
|   |-- src/visualizer/          # Pattern registry and trace generation
|   |-- src/tutor/               # Explanations, dry runs, interview guidance
|   |-- src/quizzes/             # Concept, dry-run, edge-case, complexity quizzes
|   |-- src/progress/            # Mastery, streaks, weak areas, recommendations
|   |-- src/sandbox/             # Execution API facade, never inline execution
|   |-- src/notes/               # Notes, bookmarks, tags, exports
|   `-- prisma/                  # PostgreSQL schema, migrations, seed catalog
|-- sandbox/                     # Isolated execution image and runner
|-- docs/                        # API, operations, security, release guidance
`-- docker-compose.yml
```

## Core Services

### Ingestion

Input is converted into a `LearningArtifact` with source type, raw input, normalized title, source URL, language, detected patterns, extracted constraints, sample tests, and classifier confidence. URL parsing, code heuristics, AST parsing, known-catalog matching, and LLM enrichment should be layered so the system works even when one signal is weak.

### Visualization

Trace generation should use a plugin contract:

```ts
interface VisualizationPlugin {
  id: string;
  supportedPatterns: string[];
  canHandle(artifact: LearningArtifact): number;
  createTrace(input: TraceInput): Promise<TraceStep[]>;
}
```

Every `TraceStep` must include current state, active variables, pointer/index metadata, collection snapshots, traversal metadata where applicable, and three explanations: what changed, why it changed, and what alternative was possible.

### Tutor And Quiz

Tutor responses always include problem statement, intuition, brute force, optimized approach, pattern recognition, mistakes, interview insights, edge cases, dry runs, and best/average/worst complexity. Quiz generation must cover concept checks, dry-run predictions, edge cases, and complexity reasoning.

### Practice And Progress

The practice engine should serve Blind 75, NeetCode 150, Grind 169, topic roadmaps, mock assessments, timed sessions, and adaptive recommendations. Progress scoring should blend completion, quiz accuracy, recency, retry count, notes, and missed edge cases.

## API Contract

```text
POST /api/visualizer/parse     # Current scaffold endpoint for universal input
POST /api/ingest               # Normalize user input into LearningArtifact
POST /api/visualizer/trace     # Generate or fetch cached TraceStep stream
POST /api/tutor/generate       # Generate tutor mode content
POST /api/quizzes/generate     # Generate quiz pack
POST /api/sandbox/run          # Dispatch isolated execution job
GET  /api/problems             # Catalog filters and sheets
GET  /api/problems/:slug       # Problem detail, examples, starter code
GET  /api/roadmaps             # Curated and adaptive roadmaps
GET  /api/progress/me          # Streaks, solved count, mastery, weak areas
PATCH /api/progress/:problemId # Completion, bookmark, mastery update
GET  /api/notes                # Notes and bookmarks
POST /api/notes                # Create note
PATCH /api/notes/:id           # Update note/tags/bookmark
DELETE /api/notes/:id          # Delete note
```

Production write endpoints require authentication, DTO validation, request IDs, rate limits, and audit logs for security-sensitive actions.

## Environment

Frontend:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-me
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SENTRY_DSN=
```

Backend:

```text
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/algoverse
REDIS_URL=redis://redis:6379
JWT_SECRET=replace-me
CORS_ORIGIN=http://localhost:3000
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
SANDBOX_IMAGE=algoverse-sandbox
```

## Deployment

Use Vercel for the frontend or a containerized Next.js service behind a CDN. Run the NestJS API as stateless containers on Railway, ECS/Fargate, or Kubernetes. PostgreSQL and Redis should be managed services with backups, point-in-time recovery, and separate staging/production instances. Sandbox execution must run in isolated workers with no network, strict CPU and memory limits, short timeouts, read-only base filesystem, and per-job scratch directories.

## CI/CD

Required checks:

```text
npm run build --prefix frontend
npm run build --prefix backend
npm run prisma:generate --prefix backend
docker compose -f docker-compose.yml config
```

Add Jest unit tests for classifiers, trace plugins, progress scoring, DTO validation, and services. Add Playwright coverage for landing, visualize, playback, notes, problems, roadmaps, dashboard, and keyboard accessibility.

## Monitoring

Instrument Sentry for frontend and backend exceptions. Use OpenTelemetry spans for ingestion, classification, trace generation, tutor generation, sandbox jobs, Prisma queries, and cache hits. Track parse latency, trace generation latency, sandbox failure rate, quiz completion, recommendation acceptance, active users, and endpoint saturation.

## Security

Never execute user code in the API container. Validate all request bodies with DTOs and class-validator. Rate-limit unauthenticated parser, tutor, quiz, and sandbox endpoints. Store OAuth, JWT, database, Redis, Sentry, and provider secrets in managed secret stores. Add audit logs for auth changes, exports, billing changes, and destructive actions. Use signed URLs for exports and generated assets.

## Scaling Plan

Start with one API service, managed PostgreSQL, managed Redis, and a small sandbox worker pool. Split ingestion/enrichment, trace generation, and sandbox execution into queues as traffic grows. Cache deterministic traces by artifact hash, source version, plugin version, and input examples. Keep the plugin registry versioned so future algorithms can be added without breaking old traces.
