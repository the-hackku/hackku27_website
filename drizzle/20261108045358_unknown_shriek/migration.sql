CREATE TYPE "EventType" AS ENUM('FOOD', 'REQUIRED', 'WORKSHOPS', 'SPONSOR', 'ACTIVITIES');--> statement-breakpoint
CREATE TYPE "ReimbursementInviteStatus" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED');--> statement-breakpoint
CREATE TYPE "RoomTheme" AS ENUM('THEME_1', 'THEME_2', 'THEME_3');--> statement-breakpoint
CREATE TYPE "TicketStatus" AS ENUM('OPEN', 'CLAIMED', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "TicketType" AS ENUM('MENTOR_HELP', 'INCIDENT_REPORT');--> statement-breakpoint
CREATE TYPE "TimeSlot" AS ENUM('FRI_8_11PM', 'FRI_11PM_2AM', 'SAT_2_5AM', 'SAT_5_8AM', 'SAT_8_11AM', 'SAT_11AM_2PM', 'SAT_2_5PM', 'SAT_5_8PM', 'SAT_8_11PM', 'SAT_11PM_2AM', 'SUN_2_5AM', 'SUN_5_8AM');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Checkin" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"eventId" text NOT NULL,
	"adminId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"startDate" timestamp(3) NOT NULL,
	"endDate" timestamp(3) NOT NULL,
	"location" text,
	"description" text,
	"eventType" "EventType" DEFAULT 'REQUIRED'::"EventType" NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "InfoPageContent" (
	"id" text PRIMARY KEY DEFAULT 'singleton',
	"title" text DEFAULT 'HackKU Hacker Doc' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"titleImageUrl" text,
	"logoUrl" text,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL,
	"team_id" text
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	"creator_id" text
);
--> statement-breakpoint
CREATE TABLE "ParticipantInfo" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"phoneNumber" text NOT NULL,
	"age" integer NOT NULL,
	"genderIdentity" text NOT NULL,
	"race" text NOT NULL,
	"hispanicOrLatino" text NOT NULL,
	"countryOfResidence" text NOT NULL,
	"isHighSchoolStudent" boolean NOT NULL,
	"currentSchool" text,
	"levelOfStudy" text,
	"major" text,
	"minor" text,
	"previousHackathons" integer,
	"tShirtSize" text NOT NULL,
	"dietaryRestrictions" text,
	"specialAccommodations" text,
	"chaperoneFirstName" text,
	"chaperoneLastName" text,
	"chaperoneEmail" text,
	"chaperonePhoneNumber" text,
	"agreeHackKUCode" boolean NOT NULL,
	"agreeMLHCode" boolean NOT NULL,
	"shareWithMLH" boolean NOT NULL,
	"receiveEmails" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"resumeUrl" text,
	"shareEmailWithSponsors" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" text PRIMARY KEY,
	"teamId" text,
	"creatorId" text,
	"name" text NOT NULL,
	"description" text,
	"devpostURL" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ReimbursementInvite" (
	"id" text PRIMARY KEY,
	"reimbursementId" text NOT NULL,
	"userId" text NOT NULL,
	"status" "ReimbursementInviteStatus" DEFAULT 'PENDING'::"ReimbursementInviteStatus" NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ReservationRequest" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"teamName" text NOT NULL,
	"memberEmails" text NOT NULL,
	"outOfState" boolean NOT NULL,
	"themedRoomId" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ScanAttempt" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"eventId" text NOT NULL,
	"adminId" text NOT NULL,
	"checkinId" text,
	"successful" boolean NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	"active_team_id" text
);
--> statement-breakpoint
CREATE TABLE "ThemedRoom" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"location" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ThemedRoomReservation" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"teamName" text NOT NULL,
	"memberEmails" text NOT NULL,
	"timeSlot" "TimeSlot" NOT NULL,
	"theme" "RoomTheme" NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Ticket" (
	"id" text PRIMARY KEY,
	"type" "TicketType" NOT NULL,
	"createdById" text,
	"claimedById" text,
	"status" "TicketStatus" DEFAULT 'OPEN'::"TicketStatus" NOT NULL,
	"location" text NOT NULL,
	"category" text,
	"description" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TravelReimbursement" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"transportationMethod" text NOT NULL,
	"address" text NOT NULL,
	"reason" text NOT NULL,
	"distance" double precision NOT NULL,
	"estimatedCost" double precision NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true,
	"failed_verification_count" integer DEFAULT 0,
	"locked_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false,
	"role" text DEFAULT 'HACKER' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"prefill_data" jsonb,
	"is_registered" boolean DEFAULT false NOT NULL,
	"totp_secret" text,
	"totp_backup_codes" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_creatorId_key" ON "organization" ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ParticipantInfo_userId_key" ON "ParticipantInfo" ("userId");--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "passkey" ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "passkey" ("credential_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Project_creatorId_key" ON "Project" ("creatorId");--> statement-breakpoint
CREATE UNIQUE INDEX "Project_teamId_key" ON "Project" ("teamId");--> statement-breakpoint
CREATE UNIQUE INDEX "ReimbursementInvite_userId_reimbursementId_key" ON "ReimbursementInvite" ("userId","reimbursementId");--> statement-breakpoint
CREATE UNIQUE INDEX "ReservationRequest_userId_key" ON "ReservationRequest" ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ThemedRoomReservation_theme_timeSlot_key" ON "ThemedRoomReservation" ("theme","timeSlot");--> statement-breakpoint
CREATE UNIQUE INDEX "ThemedRoomReservation_userId_key" ON "ThemedRoomReservation" ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "TravelReimbursement_userId_key" ON "TravelReimbursement" ("userId");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ParticipantInfo" ADD CONSTRAINT "ParticipantInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ReimbursementInvite" ADD CONSTRAINT "ReimbursementInvite_reimbursementId_fkey" FOREIGN KEY ("reimbursementId") REFERENCES "TravelReimbursement"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ReimbursementInvite" ADD CONSTRAINT "ReimbursementInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ReservationRequest" ADD CONSTRAINT "ReservationRequest_themedRoomId_fkey" FOREIGN KEY ("themedRoomId") REFERENCES "ThemedRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "Checkin"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "ScanAttempt" ADD CONSTRAINT "ScanAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "TravelReimbursement" ADD CONSTRAINT "TravelReimbursement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;