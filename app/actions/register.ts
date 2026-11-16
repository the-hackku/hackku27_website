"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  participantInfo as participantInfoTable,
  user as userTable,
} from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import type { RegistrationData } from "@/types/schemas/participant";

export async function registerUser(data: RegistrationData, resumeUrl?: string) {
  // Authenticate the user.
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.query.user.findFirst({
    where: { id: session.session.userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isRegistered) {
    throw new Error("User is already registered");
  }

  await db.transaction(async (tx) => {
    await tx.insert(participantInfoTable).values({
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      age: data.age,
      resumeUrl: resumeUrl ?? "",
      genderIdentity: data.genderIdentity ?? "",
      race: data.race.join(", ") ?? "",
      hispanicOrLatino: data.hispanicOrLatino ?? "",
      countryOfResidence: data.countryOfResidence ?? "",
      tShirtSize: data.tShirtSize,
      dietaryRestrictions: data.dietaryRestrictions ?? "",
      specialAccommodations: data.specialAccommodations ?? "",
      currentSchool: data.currentSchool ?? "",
      levelOfStudy: data.levelOfStudy ?? "",
      major: data.major?.join(", ") ?? "",
      minor: data.minor?.join(", ") ?? "",
      previousHackathons: data.previousHackathons ?? 0,
      chaperoneFirstName: data.chaperoneFirstName ?? "",
      chaperoneLastName: data.chaperoneLastName ?? "",
      chaperoneEmail: data.chaperoneEmail ?? "",
      chaperonePhoneNumber: data.chaperonePhoneNumber ?? "",
      agreeHackKUCode: data.agreeHackKUCode,
      agreeMLHCode: data.agreeMLHCode,
      shareWithMLH: data.shareWithMLH ?? false,
      receiveEmails: data.receiveEmails ?? false,
      shareEmailWithSponsors: data.shareEmailWithSponsors ?? false,
      isHighSchoolStudent: data.levelOfStudy === "High School",
    });
    await tx
      .update(userTable)
      .set({ isRegistered: true })
      .where(eq(userTable.id, user.id));
  });
  return { success: true };
}
