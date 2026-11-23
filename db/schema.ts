import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ==========================================
// Enums
// ==========================================

export const timeSlot = pgEnum("TimeSlot", [
  "FRI_8_11PM",
  "FRI_11PM_2AM",
  "SAT_2_5AM",
  "SAT_5_8AM",
  "SAT_8_11AM",
  "SAT_11AM_2PM",
  "SAT_2_5PM",
  "SAT_5_8PM",
  "SAT_8_11PM",
  "SAT_11PM_2AM",
  "SUN_2_5AM",
  "SUN_5_8AM",
]);
export type TimeSlot = (typeof timeSlot.enumValues)[number];

export const roomTheme = pgEnum("RoomTheme", ["THEME_1", "THEME_2", "THEME_3"]);
export type RoomTheme = (typeof roomTheme.enumValues)[number];

export const reimbursementInviteStatus = pgEnum("ReimbursementInviteStatus", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
]);
export type ReimbursementInviteStatus =
  (typeof reimbursementInviteStatus.enumValues)[number];

export const eventType = pgEnum("EventType", [
  "FOOD",
  "REQUIRED",
  "WORKSHOPS",
  "SPONSOR",
  "ACTIVITIES",
]);
export type EventType = (typeof eventType.enumValues)[number];

export const ticketType = pgEnum("TicketType", [
  "MENTOR_HELP",
  "INCIDENT_REPORT",
]);
export type TicketType = (typeof ticketType.enumValues)[number];

export const ticketStatus = pgEnum("TicketStatus", [
  "OPEN",
  "CLAIMED",
  "RESOLVED",
]);
export type TicketStatus = (typeof ticketStatus.enumValues)[number];

export const eventTrack = pgEnum("EventTrack", ["GENERAL", "THEME"]);
export type EventTrack = (typeof eventTrack.enumValues)[number];

export const projectVisitType = pgEnum("ProjectVisitType", [
  "TRACK",
  "SPONSOR",
]);
export type ProjectVisitType = (typeof projectVisitType.enumValues)[number];

export const projectVisitStatus = pgEnum("ProjectVisitStatus", [
  "BUSY",
  "COMPLETED",
  "ABSENT",
]);
export type ProjectVisitStatus = (typeof projectVisitStatus.enumValues)[number];

// ==========================================
// Better Auth Core Tables
// ==========================================

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  role: text("role").default("HACKER").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  prefillData: jsonb("prefill_data"),
  isRegistered: boolean("is_registered").default(false).notNull(),
  totpSecret: text("totp_secret"),
  totpBackupCodes: text("totp_backup_codes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});
export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    uniqueIndex("account_providerId_accountId_key").on(
      table.providerId,
      table.accountId,
    ),
  ],
);
export type AccountSelect = typeof account.$inferSelect;
export type AccountInsert = typeof account.$inferInsert;

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
    activeTeamId: text("active_team_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);
export type SessionSelect = typeof session.$inferSelect;
export type SessionInsert = typeof session.$inferInsert;

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
export type VerificationSelect = typeof verification.$inferSelect;
export type VerificationInsert = typeof verification.$inferInsert;

export const twoFactor = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verified: boolean("verified").default(true),
    failedVerificationCount: integer("failed_verification_count").default(0),
    lockedUntil: timestamp("locked_until"),
  },
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ],
);
export type TwoFactorSelect = typeof twoFactor.$inferSelect;
export type TwoFactorInsert = typeof twoFactor.$inferInsert;

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ],
);
export type PasskeySelect = typeof passkey.$inferSelect;
export type PasskeyInsert = typeof passkey.$inferInsert;

// ==========================================
// Custom Event & Checkin Tables
// ==========================================

export const event = pgTable("event", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  startDate: timestamp({ precision: 3 }).notNull(),
  endDate: timestamp({ precision: 3 }).notNull(),
  location: text(),
  description: text(),
  type: eventType().default("REQUIRED").notNull(),
  createdAt: timestamp({ precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export type EventSelect = typeof event.$inferSelect;
export type EventInsert = typeof event.$inferInsert;

export const checkin = pgTable(
  "checkin",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    eventId: text().notNull(),
    adminId: text().notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.adminId],
      foreignColumns: [user.id],
      name: "Checkin_adminId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [event.id],
      name: "Checkin_eventId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Checkin_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);
export type CheckinSelect = typeof checkin.$inferSelect;
export type CheckinInsert = typeof checkin.$inferInsert;

export const scanAttempt = pgTable(
  "scanAttempt",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    eventId: text().notNull(),
    adminId: text().notNull(),
    checkinId: text(),
    successful: boolean().notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.adminId],
      foreignColumns: [user.id],
      name: "ScanAttempt_adminId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.checkinId],
      foreignColumns: [checkin.id],
      name: "ScanAttempt_checkinId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [event.id],
      name: "ScanAttempt_eventId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ScanAttempt_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);
export type ScanAttemptSelect = typeof scanAttempt.$inferSelect;
export type ScanAttemptInsert = typeof scanAttempt.$inferInsert;

export const participantInfo = pgTable(
  "participantInfo",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    phoneNumber: text().notNull(),
    age: integer().notNull(),
    genderIdentity: text().notNull(),
    race: text().notNull(),
    hispanicOrLatino: text().notNull(),
    countryOfResidence: text().notNull(),
    isHighSchoolStudent: boolean().notNull(),
    currentSchool: text(),
    levelOfStudy: text(),
    major: text(),
    minor: text(),
    previousHackathons: integer(),
    tShirtSize: text().notNull(),
    dietaryRestrictions: text(),
    specialAccommodations: text(),
    chaperoneFirstName: text(),
    chaperoneLastName: text(),
    chaperoneEmail: text(),
    chaperonePhoneNumber: text(),
    agreeHackKUCode: boolean().notNull(),
    agreeMLHCode: boolean().notNull(),
    shareWithMLH: boolean().notNull(),
    receiveEmails: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    resumeUrl: text(),
    shareEmailWithSponsors: boolean().default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ParticipantInfo_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("ParticipantInfo_userId_key").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
  ],
);
export type ParticipantInfoSelect = typeof participantInfo.$inferSelect;
export type ParticipantInfoInsert = typeof participantInfo.$inferInsert;

// ==========================================
// Better Auth Organization Tables
// ==========================================

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    creatorId: text("creator_id").references(() => user.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [uniqueIndex("organization_creatorId_key").on(table.creatorId)],
);
export type OrganizationSelect = typeof organization.$inferSelect;
export type OrganizationInsert = typeof organization.$inferInsert;

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);
export type MemberSelect = typeof member.$inferSelect;
export type MemberInsert = typeof member.$inferInsert;

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: text("team_id"),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);
export type InvitationSelect = typeof invitation.$inferSelect;
export type InvitationInsert = typeof invitation.$inferInsert;

// ==========================================
// Judging and Project Tables
// ==========================================

export const judgeInfo = pgTable(
  "judgeInfo",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    track: eventTrack(),
    sponsorAssignment: text().references(() => challenge.id, {
      onDelete: "set null",
    }),
    isPresent: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "JudgeInfo_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.sponsorAssignment],
      foreignColumns: [challenge.id],
      name: "JudgeInfo_sponsorAssignment_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    uniqueIndex("JudgeInfo_userId_key").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
  ],
);
export type JudgeInfoSelect = typeof judgeInfo.$inferSelect;
export type JudgeInfoInsert = typeof judgeInfo.$inferInsert;

export const challenge = pgTable("challenge", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isSponsor: boolean("is_sponsor").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
export type ChallengeSelect = typeof challenge.$inferSelect;
export type ChallengeInsert = typeof challenge.$inferInsert;

export const project = pgTable(
  "project",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    teamId: text("team_id"),
    creatorId: text("creator_id"),
    name: text().notNull(),
    description: text().notNull().default("No description provided."),
    repoURL: text().notNull(),
    location: text(),
    track: eventTrack(),
    challengeIds: text("challenge_ids").array(),
    currentJudgeId: text("current_judge_id"),
    isAbsent: boolean().default(false).notNull(),
    judgeLockExpiresAt: timestamp({ precision: 3 }),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [user.id],
      name: "Project_creatorId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [organization.id],
      name: "Project_teamId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.currentJudgeId],
      foreignColumns: [user.id],
      name: "Project_currentJudgeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    uniqueIndex("Project_creatorId_fkey").using(
      "btree",
      table.creatorId.asc().nullsLast(),
    ),
    uniqueIndex("Project_teamId_fkey").using(
      "btree",
      table.teamId.asc().nullsLast(),
    ),
  ],
);
export type ProjectSelect = typeof project.$inferSelect;
export type ProjectInsert = typeof project.$inferInsert;

export const projectVisit = pgTable(
  "projectVisit",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    previousProjectId: text(),
    currentProjectId: text().notNull(),
    judgeId: text().notNull(),
    rating: integer(),
    comment: text(),
    challengeRatings: jsonb(),
    type: projectVisitType().default("TRACK").notNull(),
    status: projectVisitStatus().default("BUSY").notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.previousProjectId],
      foreignColumns: [project.id],
      name: "ProjectVisit_previousProjectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.currentProjectId],
      foreignColumns: [project.id],
      name: "ProjectVisit_currentProjectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.judgeId],
      foreignColumns: [user.id],
      name: "ProjectVisit_judgeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
export type ProjectVisitSelect = typeof projectVisit.$inferSelect;
export type ProjectVisitInsert = typeof projectVisit.$inferInsert;

export const judgePodium = pgTable(
  "judgePodium",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: text().notNull(),
    judgeId: text().notNull(),
    rank: integer().notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "JudgePodium_projectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.judgeId],
      foreignColumns: [user.id],
      name: "JudgePodium_judgeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("JudgePodium_projectId_judgeId_key").using(
      "btree",
      table.projectId.asc().nullsLast(),
      table.judgeId.asc().nullsLast(),
    ),
    uniqueIndex("JudgePodium_judgeId_rank_key").using(
      "btree",
      table.judgeId.asc().nullsLast(),
      table.rank.asc().nullsLast(),
    ),
  ],
);
export type JudgePodiumSelect = typeof judgePodium.$inferSelect;
export type JudgePodiumInsert = typeof judgePodium.$inferInsert;

export const travelReimbursement = pgTable(
  "travelReimbursement",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    transportationMethod: text().notNull(),
    address: text().notNull(),
    reason: text().notNull(),
    distance: doublePrecision().notNull(),
    estimatedCost: doublePrecision().notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "TravelReimbursement_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("TravelReimbursement_userId_key").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
  ],
);
export type TravelReimbursementSelect = typeof travelReimbursement.$inferSelect;
export type TravelReimbursementInsert = typeof travelReimbursement.$inferInsert;

export const reimbursementInvite = pgTable(
  "reimbursementInvite",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    reimbursementId: text().notNull(),
    userId: text().notNull(),
    status: reimbursementInviteStatus().default("PENDING").notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.reimbursementId],
      foreignColumns: [travelReimbursement.id],
      name: "ReimbursementInvite_reimbursementId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ReimbursementInvite_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    uniqueIndex("ReimbursementInvite_userId_reimbursementId_key").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.reimbursementId.asc().nullsLast(),
    ),
  ],
);
export type ReimbursementInviteSelect = typeof reimbursementInvite.$inferSelect;
export type ReimbursementInviteInsert = typeof reimbursementInvite.$inferInsert;

export const themedRoom = pgTable("themedRoom", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  location: text().notNull(),
});
export type ThemedRoomSelect = typeof themedRoom.$inferSelect;
export type ThemedRoomInsert = typeof themedRoom.$inferInsert;

export const reservationRequest = pgTable(
  "reservationRequest",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    teamName: text().notNull(),
    memberEmails: text().notNull(),
    outOfState: boolean().notNull(),
    themedRoomId: text(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.themedRoomId],
      foreignColumns: [themedRoom.id],
      name: "ReservationRequest_themedRoomId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    uniqueIndex("ReservationRequest_userId_key").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
  ],
);
export type ReservationRequestSelect = typeof reservationRequest.$inferSelect;
export type ReservationRequestInsert = typeof reservationRequest.$inferInsert;

export const themedRoomReservation = pgTable(
  "themedRoomReservation",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(),
    teamName: text().notNull(),
    memberEmails: text().notNull(),
    timeSlot: timeSlot().notNull(),
    theme: roomTheme().notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("ThemedRoomReservation_theme_timeSlot_key").using(
      "btree",
      table.theme.asc().nullsLast(),
      table.timeSlot.asc().nullsLast(),
    ),
    uniqueIndex("ThemedRoomReservation_userId_key").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
  ],
);
export type ThemedRoomReservationSelect =
  typeof themedRoomReservation.$inferSelect;
export type ThemedRoomReservationInsert =
  typeof themedRoomReservation.$inferInsert;

export const infoPageContent = pgTable("infoPageContent", {
  id: text().default("singleton").primaryKey(),
  title: text().default("HackKU Hacker Doc").notNull(),
  content: text().default("").notNull(),
  titleImageUrl: text(),
  logoUrl: text(),
  updatedAt: timestamp({ precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export type InfoPageContentSelect = typeof infoPageContent.$inferSelect;
export type InfoPageContentInsert = typeof infoPageContent.$inferInsert;

export const ticket = pgTable(
  "ticket",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    type: ticketType().notNull(),
    createdById: text(),
    claimedById: text(),
    status: ticketStatus().default("OPEN").notNull(),
    location: text().notNull(),
    category: text(),
    description: text(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.claimedById],
      foreignColumns: [user.id],
      name: "Ticket_claimedById_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [user.id],
      name: "Ticket_createdById_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
export type TicketSelect = typeof ticket.$inferSelect;
export type TicketInsert = typeof ticket.$inferInsert;
