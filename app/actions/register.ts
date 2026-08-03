"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { RegistrationData } from "@/types/schemas/participant";

export async function registerUser(data: RegistrationData, resumeUrl?: string) {
  // Authenticate the user.
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.$transaction([
    prisma.participantInfo.create({
      data: {
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
        isHighSchoolStudent: data.levelOfStudy === "High School",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isRegistered: true },
    }),
  ]);

  return { success: true };
}
