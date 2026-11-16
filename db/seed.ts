import { seed } from "drizzle-seed";
// biome-ignore lint/performance/noNamespaceImport: Seed script, this guarantees every schema is included
import * as schema from "@/db/schema";
import { db } from "@/lib/db";

async function main() {
  console.log("Seeding database with random, valid data...");

  await seed(db, schema).refine((f) => ({
    // ------------------------------------------
    // User & Authentication
    // ------------------------------------------
    user: {
      count: 50,
      columns: {
        name: f.fullName(),
        email: f.email(),
        role: f.valuesFromArray({
          values: [
            "HACKER",
            "ORGANIZER",
            "MENTOR",
            "VOLUNTEER",
            "SPONSOR",
            "ADMIN",
          ],
        }),
        banReason: f.loremIpsum({ sentencesCount: 1 }),
      },
    },

    account: {
      columns: {
        providerId: f.valuesFromArray({
          values: ["credential", "github", "google"],
        }),
      },
    },

    // session: {
    //   count: 0,
    //   columns: {
    //     ipAddress: f.inet(),
    //     userAgent: f.valuesFromArray({
    //       values: [
    //         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    //       ],
    //     }),
    //   },
    // },

    // twoFactor: {
    //   count: 0,
    //   columns: {
    //     failedVerificationCount: f.int({ minValue: 0, maxValue: 5 }),
    //   },
    // },

    // passkey: {
    //   count: 0,
    //   columns: {
    //     name: f.valuesFromArray({
    //       values: ["MacBook Touch ID", "iPhone Passkey", "YubiKey 5C"],
    //     }),
    //     counter: f.int({ minValue: 0, maxValue: 100 }),
    //     deviceType: f.valuesFromArray({
    //       values: ["platform", "cross-platform"],
    //     }),
    //     transports: f.valuesFromArray({
    //       values: ["internal", "usb", "nfc", "ble"],
    //     }),
    //   },
    // },

    // ------------------------------------------
    // Hackathon Participant Details
    // ------------------------------------------
    participantInfo: {
      columns: {
        firstName: f.firstName(),
        lastName: f.lastName(),
        phoneNumber: f.phoneNumber(),
        age: f.int({ minValue: 18, maxValue: 32 }),
        genderIdentity: f.valuesFromArray({
          values: ["Male", "Female", "Non-binary", "Prefer not to say"],
        }),
        race: f.valuesFromArray({
          values: [
            "Asian",
            "White",
            "Black or African American",
            "Hispanic or Latino",
            "Two or more races",
            "Prefer not to say",
          ],
        }),
        hispanicOrLatino: f.valuesFromArray({
          values: ["Yes", "No", "Prefer not to say"],
        }),
        countryOfResidence: f.country(),
        currentSchool: f.valuesFromArray({
          values: [
            "University of Kansas",
            "Kansas State University",
            "University of Missouri-Kansas City",
            "Wichita State University",
            "Iowa State University",
            "University of Nebraska-Lincoln",
          ],
        }),
        levelOfStudy: f.valuesFromArray({
          values: [
            "Freshman",
            "Sophomore",
            "Junior",
            "Senior",
            "Graduate Student",
            "High School Senior",
          ],
        }),
        major: f.valuesFromArray({
          values: [
            "Computer Science",
            "Computer Engineering",
            "Electrical Engineering",
            "Data Science",
            "Information Technology",
            "Mathematics",
          ],
        }),
        minor: f.valuesFromArray({
          values: ["Mathematics", "Business", "Design", "Economics", "None"],
        }),
        previousHackathons: f.int({ minValue: 0, maxValue: 8 }),
        tShirtSize: f.valuesFromArray({
          values: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
        }),
        dietaryRestrictions: f.valuesFromArray({
          values: [
            "None",
            "Vegetarian",
            "Vegan",
            "Gluten-Free",
            "Halal",
            "Kosher",
            "Nut Allergy",
          ],
        }),
        specialAccommodations: f.loremIpsum({ sentencesCount: 1 }),
        chaperoneFirstName: f.firstName(),
        chaperoneLastName: f.lastName(),
        chaperoneEmail: f.email(),
        chaperonePhoneNumber: f.phoneNumber(),
        resumeUrl: f.valuesFromArray({
          values: [
            "https://storage.hackku.org/resumes/sample-1.pdf",
            "https://storage.hackku.org/resumes/sample-2.pdf",
            "https://storage.hackku.org/resumes/sample-3.pdf",
          ],
        }),
      },
    },

    // ------------------------------------------
    // Organizations, Members & Invites (Stubbed)
    // ------------------------------------------
    organization: {
      count: 0,
    },
    // member: {
    //   count: 0,
    // },
    // invitation: {
    //   count: 0,
    // },

    // ------------------------------------------
    // Events, Checkins & Scanning
    // ------------------------------------------
    event: {
      count: 10,
      columns: {
        name: f.valuesFromArray({
          values: [
            "Check-in & Registration",
            "Opening Keynote Ceremony",
            "Intro to Full-Stack with Drizzle Workshop",
            "Sponsor Career Fair",
            "Midnight Pizza & Energy Drinks",
            "Cup Stacking Challenge",
            "Intro to GenAI & LLMs",
            "Hacking Submission Deadline",
            "Project Science Fair & Judging",
            "Closing & Awards Ceremony",
          ],
        }),
        location: f.valuesFromArray({
          values: [
            "Kansas Union - 5th Floor Ballroom",
            "Eaton Hall Room 1001",
            "Learned Hall Room 2111",
            "Engineering Courtyard",
            "Kansas Union - Alderson Auditorium",
          ],
        }),
        description: f.loremIpsum({ sentencesCount: 2 }),
        type: f.valuesFromArray({
          values: schema.eventType.enumValues,
        }),
      },
    },

    // checkin and scanAttempt automatically wire relationships between users and events
    checkin: {
      count: 35,
    },

    scanAttempt: {
      count: 40,
    },

    // ------------------------------------------
    // Projects, Travel, Logistics & Tickets (Stubbed)
    // ------------------------------------------
    // project: {
    //   count: 0,
    // },
    // travelReimbursement: {
    //   count: 0,
    // },
    // reimbursementInvite: {
    //   count: 0,
    // },
    // themedRoom: {
    //   count: 0,
    // },
    // reservationRequest: {
    //   count: 0,
    // },
    // themedRoomReservation: {
    //   count: 0,
    // },
    // infoPageContent: {
    //   count: 0,
    // },
    // ticket: {
    //   count: 0,
    // },
  }));

  console.log("Database seeded successfully!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
