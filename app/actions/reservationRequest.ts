"use server";

import { headers } from "next/headers";
import {
  type RoomTheme,
  reservationRequest as reservationRequestTable,
  type TimeSlot,
  themedRoomReservation as themedRoomReservationTable,
} from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";

// import {
//   exportReservationRequestToGoogleSheet,
//   exportThemedRoomReservationToGoogleSheet,
// } from "@/scripts/googleSheetsExport";

export async function createReservationRequest(input: {
  teamName: string;
  teamMembers: string; // e.g. "id1, id2, id3"
  memberEmails: string; // e.g. "email1@example.com, email2@example.com"
  outOfState: boolean;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.session.userId) {
      throw new Error("Not authenticated! Please sign in first.");
    }
    const user = await db.query.user.findFirst({
      where: { id: session.session.userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const reservation = await db.insert(reservationRequestTable).values({
      userId: session.session.userId,
      teamName: input.teamName,
      memberEmails: `${user.email}, ${input.memberEmails}`,
      outOfState: input.outOfState,
    });

    // await exportReservationRequestToGoogleSheet(reservation);

    return reservation;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // e.g., user already has a reservation (unique constraint), or other DB error
      throw new Error(
        error.message || "Failed to create reservation request.",
        { cause: error },
      );
    }
    throw new Error("Failed to create reservation request.", { cause: error });
  }
}

export async function createThemedRoomReservation(data: {
  teamName: string;
  memberEmails: string[];
  timeSlot: TimeSlot;
  theme: RoomTheme;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("Not authenticated. Please sign in.");
  }

  const existing = await db.query.themedRoomReservation.findFirst({
    where: {
      theme: data.theme,
      timeSlot: data.timeSlot,
    },
  });

  if (existing) {
    throw new Error("That theme and time slot is already taken.");
  }
  const user = await db.query.user.findFirst({
    where: { id: session.session.userId },
  });
  if (!user) {
    throw new Error("User not found.");
  }
  const aggEmails = `${user.email}, ${data.memberEmails}`;
  const reservation = await db.insert(themedRoomReservationTable).values({
    teamName: data.teamName,
    memberEmails: aggEmails,
    timeSlot: data.timeSlot,
    theme: data.theme,
    userId: session.session.userId,
  });
  //await exportThemedRoomReservationToGoogleSheet(reservation);
}

export async function getTakenThemeTimeCombos() {
  const reservations = await db.query.themedRoomReservation.findMany({
    columns: {
      theme: true,
      timeSlot: true,
    },
  });

  return reservations;
}
