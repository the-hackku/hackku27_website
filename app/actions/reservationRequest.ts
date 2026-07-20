"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { TimeSlot, RoomTheme } from "@/prisma/generated/client";

// 1) Import your Google Sheets export function
import {
  exportReservationRequestToGoogleSheet,
  exportThemedRoomReservationToGoogleSheet,
} from "@/scripts/googleSheetsExport";

export async function createReservationRequest(input: {
  teamName: string;
  teamMembers: string; // e.g. "id1, id2, id3"
  memberEmails: string; // e.g. "email1@example.com, email2@example.com"
  outOfState: boolean;
}) {
  try {
    // 1) Get the current user from session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.session.userId) {
      throw new Error("Not authenticated! Please sign in first.");
    }
    const user = await prisma.user.findUnique({
      where: { id: session.session.userId }
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // 2) Create the reservation request record

    const aggEmails = `${user.email}, ${input.memberEmails}`;
    const reservation = await prisma.reservationRequest.create({
      data: {
        userId: session.session.userId,
        teamName: input.teamName,
        memberEmails: aggEmails,
        outOfState: input.outOfState,
      },
    });

    await exportReservationRequestToGoogleSheet(reservation);

    // 4) Return the reservation record
    return reservation;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // e.g., user already has a reservation (unique constraint), or other DB error
      throw new Error(error.message || "Failed to create reservation request.");
    }
    throw new Error("Failed to create reservation request.");
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

  const existing = await prisma.themedRoomReservation.findUnique({
    where: {
      theme_timeSlot: {
        theme: data.theme,
        timeSlot: data.timeSlot,
      },
    },
  });

  if (existing) {
    throw new Error("That theme and time slot is already taken.");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
  });
  if (!user) {
    throw new Error("User not found.");
  }
  const aggEmails = `${user.email}, ${data.memberEmails}`;
  const reservation = await prisma.themedRoomReservation.create({
    data: {
      teamName: data.teamName,
      memberEmails: aggEmails,
      timeSlot: data.timeSlot,
      theme: data.theme,
      userId: session.session.userId,
    },
  });
  await exportThemedRoomReservationToGoogleSheet(reservation);
}

export async function getTakenThemeTimeCombos() {
  const reservations = await prisma.themedRoomReservation.findMany({
    select: {
      theme: true,
      timeSlot: true,
    },
  });

  return reservations;
}
