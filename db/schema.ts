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

export const roomTheme = pgEnum("RoomTheme", ["THEME_1", "THEME_2", "THEME_3"]);

export const reimbursementInviteStatus = pgEnum("ReimbursementInviteStatus", [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
]);

export const eventType = pgEnum("EventType", [
  "FOOD",
  "REQUIRED",
  "WORKSHOPS",
  "SPONSOR",
  "ACTIVITIES",
]);

export const ticketType = pgEnum("TicketType", [
  "MENTOR_HELP",
  "INCIDENT_REPORT",
]);

export const ticketStatus = pgEnum("TicketStatus", [
  "OPEN",
  "CLAIMED",
  "RESOLVED",
]);

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

// ==========================================
// Custom Event & Checkin Tables
// ==========================================

export const event = pgTable("Event", {
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

export const checkin = pgTable(
  "Checkin",
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

export const scanAttempt = pgTable(
  "ScanAttempt",
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

export const participantInfo = pgTable(
  "ParticipantInfo",
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
    updatedAt: timestamp({ precision: 3 }).notNull(),
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
    createdAt: timestamp("created_at").notNull(),
    creatorId: text("creator_id").references(() => user.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [uniqueIndex("organization_creatorId_key").on(table.creatorId)],
);

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
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

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

// ==========================================
// Custom Project, Travel & Logistics Tables
// ==========================================

export const project = pgTable(
  "Project",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    teamId: text(),
    creatorId: text(),
    name: text().notNull(),
    description: text(),
    devpostURL: text().notNull(),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 }).notNull(),
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
    uniqueIndex("Project_creatorId_key").using(
      "btree",
      table.creatorId.asc().nullsLast(),
    ),
    uniqueIndex("Project_teamId_key").using(
      "btree",
      table.teamId.asc().nullsLast(),
    ),
  ],
);

export const travelReimbursement = pgTable(
  "TravelReimbursement",
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
    updatedAt: timestamp({ precision: 3 }).notNull(),
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

export const reimbursementInvite = pgTable(
  "ReimbursementInvite",
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
    updatedAt: timestamp({ precision: 3 }).notNull(),
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

export const themedRoom = pgTable("ThemedRoom", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  location: text().notNull(),
});

export const reservationRequest = pgTable(
  "ReservationRequest",
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
    updatedAt: timestamp({ precision: 3 }).notNull(),
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

export const themedRoomReservation = pgTable(
  "ThemedRoomReservation",
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
    updatedAt: timestamp({ precision: 3 }).notNull(),
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

export const infoPageContent = pgTable("InfoPageContent", {
  id: text().default("singleton").primaryKey(),
  title: text().default("HackKU Hacker Doc").notNull(),
  content: text().default("").notNull(),
  titleImageUrl: text(),
  logoUrl: text(),
  updatedAt: timestamp({ precision: 3 }).notNull(),
});

export const ticket = pgTable(
  "Ticket",
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
    updatedAt: timestamp({ precision: 3 }).notNull(),
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
