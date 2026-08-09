/*
  Warnings:

  - You are about to drop the column `selfCheckin` on the `Checkin` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `user` table. All the data in the column will be lost.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailVerified` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Scan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `adminId` on table `Checkin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Checkin" DROP CONSTRAINT "Checkin_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_checkinId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_teamId_fkey";

-- DropIndex
DROP INDEX "session_userId_idx";

-- AlterTable
ALTER TABLE "Checkin" DROP COLUMN "selfCheckin",
ALTER COLUMN "adminId" SET NOT NULL;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeOrganizationId" TEXT,
ADD COLUMN     "activeTeamId" TEXT,
ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "teamId",
ADD COLUMN     "banExpires" TIMESTAMPTZ(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT DEFAULT 'HACKER',
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "twoFactorEnabled" DROP NOT NULL;
ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";

-- DropTable
DROP TABLE "Scan";

-- DropTable
DROP TABLE "Team";

-- DropEnum
DROP TYPE "ROLE";

-- CreateTable
CREATE TABLE "ScanAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "checkinId" TEXT,
    "successful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_creatorId_key" ON "organization"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "session_userId_token_idx" ON "session"("userId", "token");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "Checkin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
