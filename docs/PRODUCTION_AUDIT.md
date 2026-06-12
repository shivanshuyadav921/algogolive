# AlgoVerse Production Audit

Audit date: 2026-06-09

This audit records the application state before critical repairs began. "Placeholder"
means the UI or endpoint exists but returns hardcoded, simulated, or misleading data.

## Feature Status

| Priority | Feature | Status | Evidence / failure |
| --- | --- | --- | --- |
| CRITICAL | LeetCode URL import | Placeholder | The parser only derives a title from the final URL segment. It does not validate LeetCode URLs, fetch problem content, resolve catalog data, constraints, examples, starter code, or test cases. |
| CRITICAL | Raw text import | Partial | Input is accepted, but only the first line becomes a title. Problem structure, examples, constraints, and inputs are not extracted. |
| CRITICAL | Pseudocode import | Partial | Source type detection checks three words. The pseudocode is not parsed into operations, state, a recipe, or a trace. |
| CRITICAL | Code snippet import | Partial | A few language tokens identify code, but code structure and behavior are ignored. The result is a generic pattern trace. |
| CRITICAL | Pattern detection | Placeholder | Five keyword lists choose a broad category. Common patterns such as binary search, sliding window, two pointers, hashing, sorting, backtracking, and union-find are not reliably distinguished. |
| CRITICAL | Recipe generation | Placeholder | Tutor text is static per broad category and is unrelated to the imported problem. No problem-specific recipe is generated. |
| CRITICAL | Progressive hints | No implementation | There is no hint model, API, state machine, reveal sequence, or persistence. |
| CRITICAL | Session persistence | No implementation | Visualizer query, imported artifact, trace position, code edits, hints, and quiz state are lost on refresh. Prisma Session is an auth-shaped table with no application session workflow. |
| CRITICAL | Feedback engine | No implementation | Quiz feedback is fixed answer text. Code execution does not diagnose mistakes or connect results to hints, recipes, or learning progress. |
| CRITICAL | Visualization generation | Placeholder | The backend returns one of five fixed four-step traces. Tree and graph canvases also hardcode their own nodes and edges instead of rendering returned state. |
| HIGH | Tutor explanation | Partial | Tabs render correctly, but all educational content is static broad-category copy. |
| HIGH | Code execution | Partial / unsafe | Execution exists for four languages, but runners assume four seeded function names, C++ calls methods that may not exist, process failures are weakly handled, and code runs in the API container rather than the declared sandbox service. |
| HIGH | Quizzes | Partial | Quiz interaction works locally, but questions are generic, not problem-specific, and scores are not persisted. |
| HIGH | Problem catalog | Partial | Four seeded problems can be queried when PostgreSQL is configured. There is no migration, empty/error UI is masked by mock data, and selecting a problem does not import it into the playground. |
| HIGH | Progress tracking | Partial | Backend calculations exist, but the frontend uses an invalid literal user ID and silently replaces failures with fabricated analytics. |
| HIGH | Recommendations | Partial | Backend recommends unsolved weak-topic problems, but there is no real user/session identity and links do not load the selected problem. |
| HIGH | Notes and bookmarks | Partial | CRUD services exist, but the playground submits invalid literal user/problem IDs, bookmark state is not loaded, failures are not checked, and the UI falsely says notes are auto-saved. |
| MEDIUM | Dashboard | Placeholder | A failed API call displays fabricated metrics. A thrown network error can leave `data` null and crash rendering. Ranking and badge values are hardcoded. |
| MEDIUM | Roadmaps | Placeholder | Counts can come from the database, but progress percentages are hardcoded and fallback counts claim full commercial sheets that are not present. |
| MEDIUM | Problem filters | Partial | Filters call the backend, but categories are hardcoded to four seed categories and errors are hidden by mock results. |
| MEDIUM | Playback controls | Functional for supplied traces | Manual stepping, autoplay, reset, jump, and speed work, but only over placeholder traces. |
| MEDIUM | Settings | Placeholder | Controls update component state and simulate a save timer. Nothing is applied or persisted. |
| MEDIUM | Profile | Placeholder | All identity, subscription, achievements, and difficulty data are hardcoded. |
| MEDIUM | Authentication / user identity | No implementation | NextAuth is installed and auth models exist, but there is no auth route, provider config, session provider, or authenticated API identity. |
| MEDIUM | API validation | Partial | A global ValidationPipe exists, but controllers use raw body fields without DTOs, so whitelist and validation provide little protection. |
| MEDIUM | Error handling | Partial | Some services throw Nest exceptions, while frontend pages commonly swallow failures, use alerts, or substitute fake success data. |
| LOW | Landing demo | Placeholder by design | The demo animates highlights without changing the array while its text claims swaps occurred. |
| LOW | Responsive navigation | Partial | Primary navigation is hidden on small screens with no mobile replacement. |
| LOW | Character encoding | Broken polish | Several files contain mojibake in metadata, bullets, and achievement icons. |
| LOW | Accessibility | Partial | Native controls are present, but icon links lack accessible names and status/error feedback is often delivered through alerts or console logs. |
| LOW | Observability | No implementation | No request IDs, structured logs, tracing, metrics, or error reporting are configured. |

## Critical Bug List

1. The universal parser is not an ingestion system. It performs shallow source detection and keyword scoring only.
2. LeetCode URLs are never resolved to problem data.
3. Raw text, pseudocode, and source code are not normalized into a shared artifact.
4. Classification is too broad and ignores structured evidence.
5. Recipes, hints, feedback, and traces are static or absent.
6. The frontend discards imported data and supplies hardcoded code/test fixtures.
7. Visual canvases render hardcoded graph/tree structures instead of backend trace state.
8. No learning session is created, restored, or updated.
9. There is no automated test command or test suite.

## Critical Root Causes

| Critical area | Root cause | Proposed repair |
| --- | --- | --- |
| LeetCode URL import | URL handling stops after splitting the path. | Add a typed ingestion service that validates hosts/routes, extracts slugs, resolves the local catalog first, queries LeetCode metadata when needed, sanitizes content, and returns explicit import errors. |
| Raw text import | No statement parser or artifact contract. | Parse headings, constraints, examples, and candidate inputs into a normalized learning artifact with validation. |
| Pseudocode import | Detection is lexical and no operation parser exists. | Normalize pseudocode lines into operations, variables, control flow, and pattern signals. |
| Pattern detection | One broad profile wins by substring count. | Add weighted, source-aware classifiers with exact pattern profiles, negative signals, confidence, and deterministic tie-breaking. |
| Recipe generation | Tutor copy lives inside broad profiles. | Generate a deterministic problem-specific recipe from artifact, pattern, constraints, examples, and recognized operations. |
| Progressive hints | No domain model or endpoint. | Generate ordered hints with reveal levels and store reveal progress in the learning session. |
| Session persistence | No application session model or client restore flow. | Persist normalized artifacts and learning state through a dedicated session store/API, with local recovery for anonymous use. |
| Feedback engine | Execution and quiz results are isolated UI outputs. | Evaluate attempts against artifact expectations and return actionable, pattern-aware feedback without inventing results. |
| Visualization generation | Trace factories return fixed sample states. | Generate traces from normalized examples and recognized algorithms; make renderers consume trace state rather than local constants. |

## Proposed Implementation Order

| Order | Fix | Estimate |
| --- | --- | --- |
| 1 | LeetCode URL ingestion and tests | 1-2 days |
| 2 | Raw text normalization and tests | 1-2 days |
| 3 | Pseudocode and code normalization and tests | 2-3 days |
| 4 | Pattern classifier expansion and tests | 2-3 days |
| 5 | Problem-specific recipe generation and tests | 2 days |
| 6 | Progressive hints and tests | 1-2 days |
| 7 | Deterministic visualization trace generation and renderer repair | 4-6 days |
| 8 | Session persistence and restore tests | 3-4 days |
| 9 | Feedback engine and end-to-end attempt tests | 3-5 days |

Estimates assume one engineer familiar with the current NestJS/Next.js stack and
include implementation, focused automated tests, and error-path verification.

## Repair Progress

| Critical issue | Status | Verification |
| --- | --- | --- |
| LeetCode URL import | Fixed | Local catalog resolution, remote metadata fallback, validation, explicit upstream errors, frontend artifact wiring, 8 automated tests, backend/frontend production builds. |
| Raw text import | Fixed | Multiline input, title/example/constraint extraction, conservative test-case creation, edge-case tests, backend/frontend production builds. |
| Pseudocode import | Fixed | Named and unnamed pseudocode normalization, parameters, variables, typed operations, edge-case tests, backend build. |
| Code snippet import | Fixed | Language, signature, parameter, variable, and operation normalization for Python, JavaScript/TypeScript, Java, and C++; tests and backend build. |
| Pattern detection | Fixed | Source-aware weighted classifier, exact signal boundaries, dedicated common-pattern rules, confidence/ambiguity handling, automated tests. |
| Recipe generation | Fixed | Problem-specific deterministic recipes use imported inputs, constraints, parsed operations, detected evidence, and invariants; rendered in Tutor Mode and tested. |
| Progressive hints | Fixed | Four-level artifact-aware hints reveal sequentially, persist across refresh, synchronize to learning sessions, and have automated generation tests. |
| Visualization generation | Fixed for supported core patterns | Deterministic traces cover binary search, Two Sum hashing, bracket stacks, LCS DP, graph edge lists, level-order trees, and parsed-operation fallback. Renderers consume backend state. |
| Session persistence | Fixed | Prisma model/API/migration, browser recovery, server restore, and synchronization for trace position, hint progress, and code drafts; service tests and builds pass. |
| Feedback engine | Fixed | Deterministic compile/runtime/no-output/wrong-answer/coverage diagnostics and pattern-aware next actions are rendered in the execution console and tested. |
