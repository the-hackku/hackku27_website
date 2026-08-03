import { z } from "zod";

export const participantRegistrationSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    phoneNumber: z.e164(),
    age: z.coerce
      .number()
      .int()
      .min(14, "You must be at least 14 years old.")
      .max(100, "You must be at most 100 years old."),
    resumeUrl: z.any().optional(),

    genderIdentity: z
      .enum(["Male", "Female", "Non-binary", "Other", "Prefer not to Answer"])
      .optional(),
    race: z.array(z.string()).min(1, "Select at least one option"),
    hispanicOrLatino: z.enum(["Yes", "No", "Prefer not to answer"]),
    countryOfResidence: z.string().min(2, "Please enter a valid country."),
    tShirtSize: z.enum(["S", "M", "L", "XL", "XXL", "XXXL"]),
    dietaryRestrictions: z.string().optional(),
    specialAccommodations: z.string().optional(),
    currentSchool: z.string(),
    levelOfStudy: z.enum(["High School", "Undergraduate", "Graduate", "Other"]),
    major: z.array(z.string()).optional(),
    minor: z.array(z.string()).optional(),
    previousHackathons: z.coerce.number(),
    chaperoneFirstName: z.string().optional(),
    chaperoneLastName: z.string().optional(),
    chaperoneEmail: z.string().optional(),
    chaperonePhoneNumber: z.string().optional(),
    agreeHackKUCode: z.boolean().refine((value) => value === true, {
      message: "You must agree to the HackKU Code of Conduct.",
    }),
    agreeMLHCode: z.boolean().refine((value) => value === true, {
      message: "You must agree to the MLH Code of Conduct.",
    }),
    shareWithMLH: z.boolean().refine((value) => value === true, {
      message: "You must agree to share your data with MLH and DEV.",
    }),
    receiveEmails: z.boolean().optional(),
    photoWaiver: z.boolean().refine((value) => value === true, {
      message: "You must agree to the waiver.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.levelOfStudy === "High School") {
      if (!data.chaperoneFirstName) {
        ctx.addIssue({
          code: "custom",
          path: ["chaperoneFirstName"],
          message: "Chaperone first name is required for high school students.",
        });
      }
      if (!data.chaperoneLastName) {
        ctx.addIssue({
          code: "custom",
          path: ["chaperoneLastName"],
          message: "Chaperone last name is required for high school students.",
        });
      }
      if (!data.chaperoneEmail) {
        ctx.addIssue({
          code: "custom",
          path: ["chaperoneEmail"],
          message: "Chaperone email is required for high school students.",
        });
      }
      if (!data.chaperonePhoneNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["chaperonePhoneNumber"],
          message:
            "Chaperone phone number is required for high school students.",
        });
      }
    }
  });

export type RegistrationData = z.infer<typeof participantRegistrationSchema>;
