"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  exportRegistrationToGoogleSheet,
  UserWithParticipantInfo,
} from "@/scripts/googleSheetsExport";
import { RegistrationData } from "@/app/actions/schemas";
import { prisma } from "@/lib/prisma";

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

  // Create the participant record including the blob URL.
  const participantInfo = await prisma.participantInfo.create({
    data: {
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      age: data.age,
      resumeUrl: resumeUrl ?? "",
      genderIdentity: data.genderIdentity ?? "",
      race: data.race ?? "",
      hispanicOrLatino: data.hispanicOrLatino ?? "",
      countryOfResidence: data.countryOfResidence ?? "",
      tShirtSize: data.tShirtSize,
      dietaryRestrictions: data.dietaryRestrictions ?? "",
      specialAccommodations: data.specialAccommodations ?? "",
      currentSchool: data.currentSchool ?? "",
      levelOfStudy: data.levelOfStudy ?? "",
      major: data.major ?? "",
      minor: data.minor ?? "",
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
  });
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
        race: data.race ?? "",
        hispanicOrLatino: data.hispanicOrLatino ?? "",
        countryOfResidence: data.countryOfResidence ?? "",
        tShirtSize: data.tShirtSize,
        dietaryRestrictions: data.dietaryRestrictions ?? "",
        specialAccommodations: data.specialAccommodations ?? "",
        currentSchool: data.currentSchool ?? "",
        levelOfStudy: data.levelOfStudy ?? "",
        major: data.major ?? "",
        minor: data.minor ?? "",
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
    })
  ]);

  // (Optional) Export to Google Sheets.
  /*
  try {
    const userWithInfo: UserWithParticipantInfo = {
      ...user,
      ParticipantInfo: participantInfo,
    };
    await exportRegistrationToGoogleSheet(userWithInfo);
  } catch (error) {
    console.error("Error updating Google Sheet:", error);
  }
    */

  // Optionally, revalidate the profile page if you're using ISR.
  //revalidatePath("/profile");

  return { success: true };
}
