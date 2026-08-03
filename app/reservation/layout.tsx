// app/reservation/layout.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

/**
 * Layout that checks if the current user already has a reservation.
 * If yes, redirect them to their profile. Otherwise, continue.
 */
export default async function ReservationLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 1) Ensure the user is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    // If not logged in, redirect to sign-in (or wherever you want).
    redirect("/signin");
  }

  // 2) Check if a reservation already exists for this user
  const existingReservation = await prisma.reservationRequest.findUnique({
    where: { userId: session.session.userId },
  });

  // 3) If found, redirect to their profile (or any other route).
  if (existingReservation) {
    redirect("/profile");
  }

  // 4) Otherwise, render the reservation form (children).
  return <>{children}</>;
}
