-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "refreshRate" INTEGER NOT NULL DEFAULT 300,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenkinsJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "lastBuildStatus" TEXT,
    "lastBuildUrl" TEXT,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "lastBuildDate" TIMESTAMP(3),
    "lastSuccessfulDate" TIMESTAMP(3),
    "lastFailedDate" TIMESTAMP(3),
    "daysSinceLastBuild" INTEGER,
    "totalBuilds" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isTestJob" BOOLEAN NOT NULL DEFAULT false,
    "lastBuildDuration" INTEGER NOT NULL DEFAULT 0,
    "lastSuccessfulDuration" INTEGER NOT NULL DEFAULT 0,
    "lastFailedDuration" INTEGER NOT NULL DEFAULT 0,
    "avgBuildDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSuccessfulDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFailedDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minBuildDuration" INTEGER NOT NULL DEFAULT 0,
    "maxBuildDuration" INTEGER NOT NULL DEFAULT 0,
    "totalBuildDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JenkinsJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildHistory" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "buildNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildHistory" ADD CONSTRAINT "BuildHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JenkinsJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
