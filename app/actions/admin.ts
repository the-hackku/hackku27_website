"use server";

import { and, eq, ilike, type SQL } from "drizzle-orm";
import { headers } from "next/headers";
import {
  checkin as checkinTable,
  event as eventTable,
  participantInfo as participantInfoTable,
  scanAttempt as scanAttemptTable,
  user as userTable,
} from "@/db/schema";
import { auth, hasPermissions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { batchBackupRegistration } from "@/scripts/googleSheetsExport";

type AdminThemedRoom = {
  id: string;
  name: string;
  location: string;
};

type AdminReservationRequest = {
  id: string;
  teamName: string;
  userEmail: string;
  memberEmails: string;
  outOfState: boolean;
  themedRoomId: string | null;
  themedRoomName: string | null;
  themedRoomLocation: string | null;
  createdAt: Date;
};

type ValidateQrCodeResult =
  | {
      success: true;
      id: string;
      name: string;
      message: string;
      isHighSchoolStudent: boolean;
      chaperoneInfo?: {
        chaperoneName: string;
        chaperoneEmail: string;
        chaperonePhone: string;
      };
    }
  | {
      success: false;
      message: string;
    };

// CRUD operations for the admin dashboard

// Fetch all users and return their names and emails
export async function getUsers(page = 1, pageSize = 20, searchQuery = "") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["view"] });

  // const skip = (page - 1) * pageSize;
  const users = await db.query.user.findMany({
    where: {
      OR: [
        { email: { ilike: searchQuery } },
        {
          participantInfo: {
            OR: [
              { firstName: { ilike: searchQuery } },
              { lastName: { ilike: searchQuery } },
            ],
          },
        },
      ],
    },
    with: {
      participantInfo: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { users, totalUsers: users.length };
}

// Fetch all check-ins and return user names, event names, and check-in time
export async function getCheckins(page = 1, pageSize = 20, searchQuery = "") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { checkins: ["view"] });

  //const skip = (page - 1) * pageSize;

  const checkins = await db.query.checkin.findMany({
    with: {
      userUser: {
        where: {
          OR: [
            { email: { ilike: searchQuery } },
            {
              participantInfo: {
                OR: [
                  { firstName: { ilike: searchQuery } },
                  { lastName: { ilike: searchQuery } },
                ],
              },
            },
          ],
        },
        with: {
          participantInfo: true,
        },
      },
      event: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { checkins, totalCheckins: checkins.length };
}
/**
 * Batch update check-ins
 */
export async function batchUpdateCheckins(
  changes: Record<string, Partial<typeof checkinTable._.columns>>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { checkins: ["manage"] });

  const updatedCheckins = await db.transaction(async (tx) => {
    const updatePromises = Object.entries(changes).map(([checkinId, fields]) =>
      tx.update(checkinTable).set(fields).where(eq(checkinTable.id, checkinId)),
    );
    return await Promise.all(updatePromises);
  });
  return updatedCheckins;
}

// Create a new event
export async function createEvent(data: typeof eventTable.$inferInsert) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { events: ["create"] });

  return await db
    .insert(eventTable)
    .values({
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      location: data.location || null,
      description: data.description,
      type: data.type,
    })
    .returning({
      id: eventTable.id,
      name: eventTable.name,
      startDate: eventTable.startDate,
      endDate: eventTable.endDate,
      location: eventTable.location,
      description: eventTable.description,
      type: eventTable.type,
    });
}

export async function updateEvent(
  eventId: string,
  data: typeof eventTable.$inferInsert,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { events: ["manage"] });

  return await db
    .update(eventTable)
    .set({
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      location: data.location || null,
      description: data.description,
      type: data.type,
    })
    .where(eq(eventTable.id, eventId))
    .returning({
      id: eventTable.id,
      name: eventTable.name,
      startDate: eventTable.startDate,
      endDate: eventTable.endDate,
      location: eventTable.location,
      description: eventTable.description,
      type: eventTable.type,
    });
}

// Delete an event
export async function deleteEvent(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { events: ["delete"] });

  return await db
    .delete(eventTable)
    .where(eq(eventTable.id, eventId))
    .returning({
      id: eventTable.id,
      name: eventTable.name,
    });
}

export async function validateQrCode(
  scannedCode: string,
  eventId: string,
): Promise<ValidateQrCodeResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { checkins: ["perform"] });

  const admin = await db.query.user.findFirst({
    where: { id: session?.session.userId },
    columns: { id: true },
  });

  if (!admin) {
    return {
      success: false,
      message: "Admin not found.",
    };
  }

  // Fetch the user associated with the scanned QR code
  const user = await db.query.user.findFirst({
    where: { id: scannedCode },
    with: {
      participantInfo: {
        columns: {
          firstName: true,
          lastName: true,
          isHighSchoolStudent: true,
          chaperoneFirstName: true,
          chaperoneLastName: true,
          chaperoneEmail: true,
          chaperonePhoneNumber: true,
        },
      },
    },
    columns: { id: true },
  });

  if (!user) {
    return {
      success: false,
      message: "Invalid QR code. No matching user found.",
    };
  }

  // Check if the user has already checked in for this event
  const existingCheckin = await db.query.checkin.findFirst({
    where: { userId: user.id, eventId },
  });

  if (existingCheckin) {
    // Create a 'failed' Scan record if you still want to log the attempt with the real user.id
    await db.insert(scanAttemptTable).values({
      userId: user.id,
      adminId: admin.id,
      eventId,
      successful: false,
    });
    return {
      success: false,
      message: "User has already checked in.",
    };
  }

  // If user exists and hasn't checked in, create a check-in + successful scan
  await db.transaction(async (tx) => {
    await tx.insert(checkinTable).values({
      userId: user.id,
      adminId: admin.id,
      eventId,
    });
    await tx.insert(scanAttemptTable).values({
      userId: user.id,
      adminId: admin.id,
      eventId,
      successful: true,
    });
  });

  const fullName = user.participantInfo
    ? `${user.participantInfo.firstName} ${user.participantInfo.lastName}`
    : "Participant";

  const isHighSchoolStudent = Boolean(
    user.participantInfo?.isHighSchoolStudent,
  );
  const chaperoneInfo = isHighSchoolStudent
    ? {
        chaperoneName: `${user.participantInfo?.chaperoneFirstName || ""} ${
          user.participantInfo?.chaperoneLastName || ""
        }`.trim(),
        chaperoneEmail: user.participantInfo?.chaperoneEmail || "N/A",
        chaperonePhone: user.participantInfo?.chaperonePhoneNumber || "N/A",
      }
    : undefined;

  return {
    success: true,
    id: user.id,
    name: fullName,
    message: "User successfully checked in.",
    isHighSchoolStudent,
    chaperoneInfo,
  };
}

export async function manualCheckIn(
  userId: string,
  eventId: string,
): Promise<{
  success: boolean;
  message: string;
  isHighSchoolStudent?: boolean;
  name?: string;
  chaperoneInfo?: {
    chaperoneName: string;
    chaperoneEmail: string;
    chaperonePhone: string;
  };
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { checkins: ["perform"] });

  const admin = await db.query.user.findFirst({
    where: { id: session?.session.userId },
    columns: { id: true },
  });

  if (!admin) {
    return {
      success: false,
      message: "Admin/Volunteer not found.",
    };
  }

  // Fetch the user by userId
  const user = await db.query.user.findFirst({
    where: { id: userId },
    columns: {
      id: true,
    },
    with: {
      participantInfo: {
        columns: {
          firstName: true,
          lastName: true,
          isHighSchoolStudent: true,
          chaperoneFirstName: true,
          chaperoneLastName: true,
          chaperoneEmail: true,
          chaperonePhoneNumber: true,
        },
      },
    },
  });

  if (!user) {
    return {
      success: false,
      message: "No matching user found for the given userId.",
    };
  }

  // Check if the user is already checked in for this event
  const existingCheckin = await db.query.checkin.findFirst({
    where: { userId: user.id, eventId },
  });

  if (existingCheckin) {
    return {
      success: false,
      message: "User has already been checked in for this event.",
    };
  }

  // If not checked in yet, proceed with a check-in
  await db.transaction(async (tx) => {
    await tx.insert(checkinTable).values({
      userId: user.id,
      adminId: admin.id,
      eventId,
    });
    await tx.insert(checkinTable).values({
      userId: user.id,
      adminId: admin.id,
      eventId,
    });
  });

  const fullName = user.participantInfo
    ? `${user.participantInfo.firstName} ${user.participantInfo.lastName}`.trim()
    : "Participant";

  const isHighSchoolStudent = Boolean(
    user.participantInfo?.isHighSchoolStudent,
  );

  let chaperoneInfo:
    | {
        chaperoneName: string;
        chaperoneEmail: string;
        chaperonePhone: string;
      }
    | undefined;
  if (isHighSchoolStudent) {
    chaperoneInfo = {
      chaperoneName: `${user.participantInfo?.chaperoneFirstName ?? ""} ${
        user.participantInfo?.chaperoneLastName ?? ""
      }`.trim(),
      chaperoneEmail: user.participantInfo?.chaperoneEmail ?? "N/A",
      chaperonePhone: user.participantInfo?.chaperonePhoneNumber ?? "N/A",
    };
  }

  return {
    success: true,
    message: `Successfully checked in ${fullName}`,
    name: fullName,
    isHighSchoolStudent,
    chaperoneInfo,
  };
}

export async function fetchScanHistory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { checkins: ["view"] });

  const history = await db.query.scanAttempt.findMany({
    with: {
      userUser: {
        with: {
          participantInfo: true,
        },
      },
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return history.map((scan) => ({
    id: scan.id,
    name:
      scan.userUser?.participantInfo?.firstName &&
      scan.userUser?.participantInfo?.lastName
        ? `${scan.userUser.participantInfo.firstName} ${scan.userUser.participantInfo.lastName}`
        : scan.userUser?.name || "Unknown User",
    eventName: scan.event?.name,
    successful: scan.successful,
    timestamp: scan.createdAt.toISOString(),
  }));
}

export async function updateUserField(
  userId: string,
  field: string,
  value: unknown,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["manage"] });
  return await db
    .update(userTable)
    .set({ [field]: value })
    .where(eq(userTable.id, userId))
    .returning({ id: userTable.id });
}

// Update participant field
export async function updateParticipantField(
  participantId: string,
  field: string,
  value: unknown,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["manage"] });
  return await db
    .update(participantInfoTable)
    .set({ [field]: value })
    .where(eq(participantInfoTable.id, participantId))
    .returning({ id: participantInfoTable.id });
}

export async function batchUpdateUsers(
  changes: Record<string, Partial<typeof userTable.$inferInsert>>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["manage"] });

  const updatedUsers = await db.transaction(async (tx) => {
    const updatePromises = Object.entries(changes).map(([userId, fields]) =>
      tx
        .update(userTable)
        .set(fields)
        .where(eq(userTable.id, userId))
        .returning({ id: userTable.id }),
    );
    return await Promise.all(updatePromises);
  });
  return updatedUsers;
}

export async function getEventById(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { events: ["manage"] });
  return await db.query.event.findFirst({
    where: { id: eventId },
    columns: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      description: true,
      type: true,
    },
  });
}

export async function getUserById(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["view"] });
  return await db.query.user.findFirst({
    where: { id: userId },
    with: {
      participantInfo: true,
      checkins: {
        with: {
          event: true,
        },
        orderBy: { createdAt: "desc" },
      },
      travelReimbursement: true,
    },
  });
}

export async function batchUpdateParticipants(
  changes: Record<string, Partial<typeof participantInfoTable.$inferInsert>>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["manage"] });

  const updatedParticipants = await db.transaction(async (tx) => {
    const updatePromises = Object.entries(changes).map(
      ([participantId, fields]) =>
        tx
          .update(participantInfoTable)
          .set(fields)
          .where(eq(participantInfoTable.id, participantId))
          .returning({ id: participantInfoTable.id }),
    );
    return await Promise.all(updatePromises);
  });
  return updatedParticipants;
}

export async function getTotalRegistrationNumber() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["view"] });
  return await db.$count(participantInfoTable);
}

export async function getEventCheckinCount(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { checkins: ["view"] });
  return await db.$count(checkinTable, eq(checkinTable.eventId, eventId));
}

export async function searchUsers(searchQuery: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { user_data: ["view"] });
  const trimmed = searchQuery.trim();
  const [first, last] = trimmed.split(" ", 2);

  const users = await db.query.user.findMany({
    where: {
      participantInfo: {
        OR: [
          { firstName: { ilike: `%${trimmed}%` } },
          { lastName: { ilike: `%${trimmed}%` } },
          {
            AND: [
              { firstName: { ilike: `%${first}%` } },
              { lastName: { ilike: `%${last}%` } },
            ],
          },
        ],
      },
    },
    with: {
      participantInfo: true,
    },
    limit: 50,
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.participantInfo?.firstName ?? "",
    lastName: user.participantInfo?.lastName ?? "",
  }));
}

export async function getReservationRequests(
  page = 1,
  pageSize = 10,
  searchQuery = "",
): Promise<{ requests: AdminReservationRequest[]; total: number }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { room_reservations: ["view"] });
  const skip = (page - 1) * pageSize;
  const where = searchQuery
    ? {
        OR: [
          { teamName: { contains: searchQuery, mode: "insensitive" as const } },
          {
            memberEmails: {
              contains: searchQuery,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const rawRequests = await prisma.reservationRequest.findMany({
    where,
    include: { themedRoom: true },
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.reservationRequest.count({ where });

  const userIds = rawRequests.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  return {
    requests: rawRequests.map((r) => ({
      id: r.id,
      teamName: r.teamName,
      userEmail: emailMap[r.userId] ?? "N/A",
      memberEmails: r.memberEmails,
      outOfState: r.outOfState,
      themedRoomId: r.themedRoomId,
      themedRoomName: r.themedRoom?.name ?? null,
      themedRoomLocation: r.themedRoom?.location ?? null,
      createdAt: r.createdAt,
    })),
    total,
  };
}

export async function assignRoomToRequest(
  requestId: string,
  themedRoomId: string | null,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { room_reservations: ["manage"] });
  await prisma.reservationRequest.update({
    where: { id: requestId },
    data: { themedRoomId },
  });
}

export async function deleteReservationRequest(
  requestId: string,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { room_reservations: ["delete"] });
  await prisma.reservationRequest.delete({ where: { id: requestId } });
}

export async function getThemedRooms(): Promise<AdminThemedRoom[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { room_reservations: ["view"] });
  return prisma.themedRoom.findMany({ orderBy: { name: "asc" } });
}

export async function createThemedRoom(data: {
  name: string;
  location: string;
}): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { themed_rooms: ["create"] });
  await prisma.themedRoom.create({ data });
}

export async function updateAdminThemedRoom(
  id: string,
  data: { name?: string; location?: string },
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { themed_rooms: ["manage"] });
  await prisma.themedRoom.update({ where: { id }, data });
}

export async function deleteAdminThemedRoom(id: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { themed_rooms: ["delete"] });
  await prisma.themedRoom.delete({ where: { id } });
}

export type { AdminReservationRequest, AdminThemedRoom };
