/*
  Warnings:

  - The values [DUNGEONS_AND_DRAGONS,HOW_TO_TRAIN_YOUR_DRAGON,DARK_FAIRY] on the enum `RoomTheme` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `ReimbursementInvite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `ReimbursementInvite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ThemedRoomReservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReimbursementInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('MENTOR_HELP', 'INCIDENT_REPORT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLAIMED', 'RESOLVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ROLE" ADD VALUE 'MENTOR';
ALTER TYPE "ROLE" ADD VALUE 'JUDGE';

-- AlterEnum
BEGIN;
CREATE TYPE "RoomTheme_new" AS ENUM ('THEME_1', 'THEME_2', 'THEME_3');
ALTER TABLE "ThemedRoomReservation" ALTER COLUMN "theme" TYPE "RoomTheme_new" USING ("theme"::text::"RoomTheme_new");
ALTER TYPE "RoomTheme" RENAME TO "RoomTheme_old";
ALTER TYPE "RoomTheme_new" RENAME TO "RoomTheme";
DROP TYPE "public"."RoomTheme_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Checkin" DROP CONSTRAINT "Checkin_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_adminId_fkey";

-- AlterTable
ALTER TABLE "Checkin" ADD COLUMN     "selfCheckin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ReimbursementInvite" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ReimbursementInviteStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ReservationRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Scan" ADD COLUMN     "selfScan" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "mfaVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ThemedRoomReservation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TravelReimbursement" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "multiFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "totpBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "totpSecret" TEXT;

-- DropEnum
DROP TYPE "InviteStatus";

-- CreateTable
CREATE TABLE "PrefillData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countryOfResidence" TEXT,
    "currentSchool" TEXT,
    "levelOfStudy" TEXT,
    "major" TEXT,
    "race" TEXT,
    "genderIdentity" TEXT,
    "age" INTEGER,
    "phoneNumber" TEXT,

    CONSTRAINT "PrefillData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inviteCode" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "creatorId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "devpostURL" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "createdById" TEXT,
    "claimedById" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "location" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrefillData_userId_key" ON "PrefillData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_creatorId_key" ON "Team"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_inviteCode_key" ON "Team"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Project_teamId_key" ON "Project"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_creatorId_key" ON "Project"("creatorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrefillData" ADD CONSTRAINT "PrefillData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
