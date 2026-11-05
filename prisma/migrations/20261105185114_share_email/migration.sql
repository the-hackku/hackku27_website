-- AlterTable
ALTER TABLE "ParticipantInfo" ADD COLUMN     "shareEmailWithSponsors" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "receiveEmails" SET DEFAULT false;
