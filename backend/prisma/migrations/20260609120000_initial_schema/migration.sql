CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TYPE "SubmissionStatus" AS ENUM (
    'ACCEPTED',
    'WRONG_ANSWER',
    'TIME_LIMIT_EXCEEDED',
    'RUNTIME_ERROR',
    'COMPILE_ERROR'
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "leetcodeUrl" TEXT,
    "neetcodeSheet" BOOLEAN NOT NULL DEFAULT false,
    "blind75Sheet" BOOLEAN NOT NULL DEFAULT false,
    "grind169Sheet" BOOLEAN NOT NULL DEFAULT false,
    "testCases" JSONB NOT NULL,
    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StarterCode" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    CONSTRAINT "StarterCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "runtime" INTEGER,
    "memory" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "lastSolved" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "rawQuery" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "revealedHints" INTEGER NOT NULL DEFAULT 0,
    "codeDrafts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key"
ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");
CREATE UNIQUE INDEX "UserProgress_userId_problemId_key"
ON "UserProgress"("userId", "problemId");
CREATE UNIQUE INDEX "Note_userId_problemId_key"
ON "Note"("userId", "problemId");

ALTER TABLE "Account"
ADD CONSTRAINT "Account_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session"
ADD CONSTRAINT "Session_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Streak"
ADD CONSTRAINT "Streak_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StarterCode"
ADD CONSTRAINT "StarterCode_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Submission"
ADD CONSTRAINT "Submission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Submission"
ADD CONSTRAINT "Submission_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserProgress"
ADD CONSTRAINT "UserProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserProgress"
ADD CONSTRAINT "UserProgress_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Note"
ADD CONSTRAINT "Note_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Note"
ADD CONSTRAINT "Note_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningSession"
ADD CONSTRAINT "LearningSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
