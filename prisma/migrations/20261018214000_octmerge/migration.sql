-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('FRI_8_11PM', 'FRI_11PM_2AM', 'SAT_2_5AM', 'SAT_5_8AM', 'SAT_8_11AM', 'SAT_11AM_2PM', 'SAT_2_5PM', 'SAT_5_8PM', 'SAT_8_11PM', 'SAT_11PM_2AM', 'SUN_2_5AM', 'SUN_5_8AM');

-- CreateEnum
CREATE TYPE "RoomTheme" AS ENUM ('THEME_1', 'THEME_2', 'THEME_3');

-- CreateEnum
CREATE TYPE "ReimbursementInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FOOD', 'REQUIRED', 'WORKSHOPS', 'SPONSOR', 'ACTIVITIES');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('MENTOR_HELP', 'INCIDENT_REPORT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLAIMED', 'RESOLVED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT DEFAULT 'HACKER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "totpSecret" TEXT,
    "totpBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMPTZ(3),
    "travelReimbursementId" TEXT,
    "prefillData" JSONB,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,
    "activeTeamId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "failedVerificationCount" INTEGER NOT NULL,
    "lockedUntil" TIMESTAMPTZ(3),

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMPTZ(3),
    "aaguid" TEXT,

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "eventType" "EventType" NOT NULL DEFAULT 'REQUIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "genderIdentity" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "hispanicOrLatino" TEXT NOT NULL,
    "countryOfResidence" TEXT NOT NULL,
    "isHighSchoolStudent" BOOLEAN NOT NULL,
    "currentSchool" TEXT,
    "levelOfStudy" TEXT,
    "major" TEXT,
    "minor" TEXT,
    "previousHackathons" INTEGER,
    "tShirtSize" TEXT NOT NULL,
    "dietaryRestrictions" TEXT,
    "specialAccommodations" TEXT,
    "chaperoneFirstName" TEXT,
    "chaperoneLastName" TEXT,
    "chaperoneEmail" TEXT,
    "chaperonePhoneNumber" TEXT,
    "agreeHackKUCode" BOOLEAN NOT NULL,
    "agreeMLHCode" BOOLEAN NOT NULL,
    "shareWithMLH" BOOLEAN NOT NULL,
    "receiveEmails" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resumeUrl" TEXT,

    CONSTRAINT "ParticipantInfo_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "TravelReimbursement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transportationMethod" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelReimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReimbursementInvite" (
    "id" TEXT NOT NULL,
    "reimbursementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReimbursementInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReimbursementInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemedRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "ThemedRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "memberEmails" TEXT NOT NULL,
    "outOfState" BOOLEAN NOT NULL,
    "themedRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemedRoomReservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "memberEmails" TEXT NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "theme" "RoomTheme" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemedRoomReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoPageContent" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "title" TEXT NOT NULL DEFAULT 'HackKU Hacker Doc',
    "content" TEXT NOT NULL DEFAULT '',
    "titleImageUrl" TEXT,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoPageContent_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_token_idx" ON "session"("userId", "token");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantInfo_userId_key" ON "ParticipantInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_creatorId_key" ON "organization"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_teamId_key" ON "Project"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_creatorId_key" ON "Project"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelReimbursement_userId_key" ON "TravelReimbursement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReimbursementInvite_userId_reimbursementId_key" ON "ReimbursementInvite"("userId", "reimbursementId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRequest_userId_key" ON "ReservationRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ThemedRoomReservation_userId_key" ON "ThemedRoomReservation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ThemedRoomReservation_theme_timeSlot_key" ON "ThemedRoomReservation"("theme", "timeSlot");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_travelReimbursementId_fkey" FOREIGN KEY ("travelReimbursementId") REFERENCES "TravelReimbursement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantInfo" ADD CONSTRAINT "ParticipantInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelReimbursement" ADD CONSTRAINT "TravelReimbursement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursementInvite" ADD CONSTRAINT "ReimbursementInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursementInvite" ADD CONSTRAINT "ReimbursementInvite_reimbursementId_fkey" FOREIGN KEY ("reimbursementId") REFERENCES "TravelReimbursement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRequest" ADD CONSTRAINT "ReservationRequest_themedRoomId_fkey" FOREIGN KEY ("themedRoomId") REFERENCES "ThemedRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

