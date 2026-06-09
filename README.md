# AlgoVerse

Learn. Visualize. Master.

AlgoVerse is an AI-powered DSA learning platform scaffold with a Next.js App Router frontend, a NestJS API, PostgreSQL/Prisma persistence, Redis-ready infrastructure, and a sandbox service for code execution. The repository also includes a production blueprint that describes the target architecture for universal parsing, adaptive tutoring, visualizations, quizzes, progress tracking, observability, security, and deployment.

## Repository Structure

```text
.
|-- docker-compose.yml
|-- BLUEPRINT.md
|-- README.md
|-- backend/
|   |-- src/
|   |-- prisma/
|   |-- Dockerfile
|   `-- package.json
|-- frontend/
|   |-- src/
|   |-- Dockerfile
|   `-- package.json
|-- sandbox/
|   |-- Dockerfile
|   `-- run.sh
|-- css/
|-- js/
`-- index.html
```

## Run With Docker Compose

```bash
docker-compose up --build
docker-compose exec backend npx prisma migrate dev --name init
docker-compose exec backend npx prisma db seed
```

Frontend: http://localhost:3000

Backend API: http://localhost:4000/api

## Local Development

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev

cd ../frontend
npm install
npm run dev
```

Create `frontend/.env.local` when the API is not running on the default local URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Current Capabilities

- Universal query endpoint for URLs, problem names, descriptions, and code snippets.
- Step-based visualizer payloads for arrays, stacks/lists, DP tables, graphs, and trees.
- Tutor mode, quizzes, playback controls, notes, roadmaps, dashboard, and practice pages.
- Prisma models for users, OAuth accounts, sessions, problems, starter code, submissions, progress, streaks, and notes.
- Docker Compose services for frontend, backend, PostgreSQL, and Redis.

## Target Blueprint

Read [BLUEPRINT.md](./BLUEPRINT.md) for the complete production architecture and implementation plan.
Read [docs/PRODUCTION_PLAN.md](./docs/PRODUCTION_PLAN.md) for API contracts, environment variables, CI/CD, deployment, security, monitoring, and scaling guidance.
