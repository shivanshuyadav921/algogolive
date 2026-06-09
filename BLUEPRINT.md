# AlgoVerse Production Blueprint

## Product Vision

AlgoVerse is a universal DSA learning platform that accepts problem URLs, natural-language prompts, pseudocode, and user code, then produces a structured learning experience: concept diagnosis, tutor explanations, executable traces, visual playback, quizzes, practice recommendations, and mastery analytics.

The target product should feel closer to an interactive technical interview coach than a static problem bank. It must support beginners without limiting advanced users, and it must treat visualization, testing, notes, and recommendations as one connected learning loop.

## Architecture

The system is split into five domains:

1. Experience layer: Next.js App Router, Tailwind CSS, shadcn/ui primitives, Framer Motion, Zustand for local playback state, React Query for server state.
2. API layer: NestJS modules for auth, ingestion, problem catalog, visualization, tutor generation, quizzes, notes, progress, submissions, and analytics.
3. Intelligence layer: deterministic parsers plus LLM-assisted enrichment for problem classification, explanation generation, quiz generation, and recommendation ranking.
4. Execution layer: isolated sandbox workers for Python, C++, Java, and JavaScript with strict CPU, memory, filesystem, process, and network limits.
5. Data layer: PostgreSQL for durable records, Prisma ORM, Redis for job queues/cache/rate limits, object storage for exports and generated assets.

## Core User Flow

1. User submits a LeetCode URL, Codeforces URL, GeeksforGeeks URL, HackerRank prompt, algorithm name, English description, pseudocode, or source code.
2. Ingestion normalizes the input into `LearningArtifact`.
3. Classifier assigns topic, pattern, data structures, constraints, difficulty, source, and confidence.
4. Tutor generator creates problem statement, intuition, brute-force route, optimized route, edge cases, common mistakes, complexity, and interview insights.
5. Trace planner chooses a visualization plugin and produces a typed step stream.
6. Playback UI renders every intermediate state with variables, active indices, pointer movement, stack/queue/heap contents, tree/graph traversal, and step reasoning.
7. Practice engine creates quizzes, dry-run checks, related problems, and timed sessions.
8. Progress engine records mastery, weak areas, streaks, notes, bookmarks, submissions, and recommended next topics.

## Universal Input Model

```ts
type LearningArtifact = {
  id: string;
  sourceType: 'url' | 'code' | 'pseudocode' | 'plain_text' | 'catalog_problem';
  rawInput: string;
  normalizedTitle: string;
  sourceUrl?: string;
  language?: 'cpp' | 'java' | 'python' | 'javascript';
  detectedPatterns: PatternMatch[];
  constraints: Constraint[];
  examples: TestCase[];
  confidence: number;
};
```

The classifier should combine URL parsing, known catalog lookup, AST parsing, regex heuristics, constraint extraction, and LLM enrichment. Low-confidence classifications should still produce a useful general trace while marking assumptions in server metadata.

## Visualization Engine

Each visualization is a plugin implementing:

```ts
interface VisualizationPlugin {
  id: string;
  supportedPatterns: string[];
  canHandle(artifact: LearningArtifact): number;
  createTrace(input: TraceInput): Promise<TraceStep[]>;
  renderHints: RenderHint[];
}
```

Trace steps must include:

- Current state.
- Active variables.
- Current indices.
- Pointer movement.
- Queue, stack, heap, set, map, and priority queue snapshots.
- Tree or graph traversal metadata.
- What happened, why it happened, and what alternative was possible.

The first production plugin set should cover arrays, linked lists, stacks, queues, heaps, sorting, binary search on monotonic spaces, two pointers, sliding windows, trees, tries, graphs, DFS, BFS, topological sort, union find, MST, shortest paths, DP, greedy, backtracking, recursion, bit manipulation, segment trees, Fenwick trees, string algorithms, math, and number theory.

## API Surface

```text
POST /api/ingest
POST /api/visualizer/parse
POST /api/visualizer/trace
POST /api/tutor/generate
POST /api/quizzes/generate
POST /api/sandbox/run
GET  /api/problems
GET  /api/problems/:slug
GET  /api/roadmaps
GET  /api/progress/me
PATCH /api/progress/:problemId
GET  /api/notes
POST /api/notes
PATCH /api/notes/:id
DELETE /api/notes/:id
```

All write endpoints should require authentication in production. Public demo endpoints should be rate-limited and isolated from user-owned records.

## Database Roadmap

Existing Prisma models cover users, accounts, sessions, streaks, problems, starter code, submissions, progress, and notes. Production should add:

- `LearningArtifact` for normalized user inputs.
- `VisualizationTrace` for cached typed traces.
- `Quiz`, `QuizAttempt`, and `QuizQuestion`.
- `TopicMastery` for spaced-repetition style mastery scoring.
- `Recommendation` for next-action queues.
- `ExecutionJob` for sandbox auditability.
- `Roadmap`, `RoadmapSection`, and `RoadmapItem` for curated tracks.
- `AuditLog` for security-sensitive actions.

## Frontend Experience

Primary app screens:

- Landing page with hero, interactive demo, feature showcase, testimonials, FAQ, pricing, CTA, and footer.
- Playground with universal input, canvas, playback controls, code editor, tutor mode, quiz panel, and notes.
- Problems catalog with filters for topic, difficulty, sheet, status, and source.
- Roadmaps for Blind 75, NeetCode 150, Grind 169, topic tracks, and mock assessments.
- Dashboard with streaks, solved count, topic mastery, weak areas, heatmaps, and recommended next topics.
- Notes workspace with tags, bookmarks, export, and problem links.
- Profile/settings with auth providers, billing, privacy, notification, and account controls.

Accessibility requirements:

- Keyboard-operable controls.
- Visible focus states.
- Semantic buttons/tabs/forms.
- Color contrast meeting WCAG AA.
- Reduced-motion behavior for animated playback.

## Backend Modules

Recommended NestJS modules:

- `AuthModule`: Google, GitHub, email/password, session/JWT strategy.
- `IngestionModule`: URL fetching, source parsing, classifier orchestration.
- `CatalogModule`: problem sheets, roadmaps, metadata sync.
- `VisualizerModule`: plugin routing, trace generation, cached traces.
- `TutorModule`: explanation generation and review.
- `QuizModule`: question generation, attempts, scoring.
- `SandboxModule`: job creation and worker dispatch.
- `ProgressModule`: mastery scoring, streaks, solved state.
- `NotesModule`: notes, bookmarks, tags, exports.
- `ObservabilityModule`: metrics, tracing, health checks.

## Security

- Never execute user code in the API container.
- Run code in short-lived sandbox workers with no network access, read-only base filesystem, memory limits, process limits, CPU quotas, and execution timeout.
- Store OAuth secrets, JWT secrets, database credentials, Sentry DSNs, and provider keys in managed secrets.
- Validate request bodies with DTOs and class-validator.
- Rate-limit unauthenticated parser, tutor, quiz, and execution endpoints.
- Add audit logs for auth changes, billing changes, exports, and destructive actions.
- Use signed URLs for exports and generated assets.

## Observability

- Sentry for frontend and backend errors.
- OpenTelemetry traces across ingestion, generation, sandbox jobs, and database queries.
- Metrics for parse latency, trace-generation latency, sandbox failure rate, quiz completion rate, recommendation acceptance, and endpoint saturation.
- Structured logs with request IDs and user IDs when authenticated.

## Testing Strategy

- Unit tests for classifiers, trace plugins, recommendation scoring, services, and DTO validation.
- Integration tests for Prisma-backed modules and API routes.
- Sandbox tests for each language and failure mode.
- Playwright tests for landing, playground, playback, notes, problems, roadmaps, and dashboard workflows.
- Accessibility tests with automated checks and manual keyboard review.
- Load tests for parser, cached traces, and sandbox queue throughput.

## Deployment

Frontend:

- Vercel or containerized Next.js behind CDN.
- Environment variables for API URL, auth providers, Sentry, and analytics.

Backend:

- Railway, AWS ECS/Fargate, or Kubernetes.
- Horizontal scaling for stateless API containers.
- Dedicated worker pool for sandbox jobs.

Data:

- Managed PostgreSQL with daily backups and point-in-time recovery.
- Managed Redis for queue/cache/rate limits.
- Object storage for exports and large generated artifacts.

CI/CD:

- Typecheck, lint, unit tests, integration tests, build, container build, vulnerability scan, deployment.
- Separate preview, staging, and production environments.
- Database migrations gated behind staging verification.

## Implementation Phases

Phase 1: Stabilize the current scaffold with compile-clean frontend/backend, seed catalog, core visualizer payloads, notes, dashboard, and Docker Compose.

Phase 2: Add typed ingestion, AST-based code detection, plugin-based traces, DTO validation, auth, and authenticated progress.

Phase 3: Add sandbox worker isolation, queueing, production test execution, quizzes, mastery scoring, and recommendations.

Phase 4: Expand visualization plugins for full DSA coverage, add roadmaps, mock assessments, exports, and analytics.

Phase 5: Harden security, observability, load testing, billing, admin tools, and production deployment.

## Acceptance Criteria

- Any supported input type returns a structured artifact or a clear recoverable error.
- Every generated trace is deterministic, typed, replayable, and cacheable.
- Playback controls support play, pause, next, previous, restart, speed, scrub, and jump.
- Tutor mode always includes statement, intuition, brute force, optimized approach, pattern recognition, mistakes, interview insights, edge cases, dry runs, and complexity.
- Quizzes cover concepts, dry runs, complexity, and edge cases.
- Progress tracks streaks, solved problems, mastery, weak areas, heatmaps, bookmarks, and recommendations.
- No user code runs outside the isolated execution layer.
- CI blocks type errors, failing tests, broken builds, and unsafe migrations.
