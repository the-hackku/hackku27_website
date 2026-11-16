"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "@/app/actions/register";
import { GenericForm } from "@/components/forms/GenericForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import constants from "@/constants";
import type { FormConfig } from "@/types/form";

const LOCAL_STORAGE_KEY = "hackku_registration_form";

export function JudgeForm({
  prefillData,
}: {
  prefillData: RegistrationData | null |undefined;
}) {
  const router = useRouter();

  const formConfig: FormConfig<RegistrationData> = {
     firstName: {
     type: "text",
     label: "First Name",
     placeholder: "First name",
     required: true,
     group: "Personal Information",
    },
    lastName: {
      type: "text",
      label: "Last Name",
      placeholder: "Last name",
      required: true,
      group: "Personal Information",
    },
    email: {
      type: "email",
      label: "Email",
      placeholder: "Email",
      required: true,
      group: "Personal Information",
    },
    discord: {
      type: "select",
      label: "Have you joined the HackKU Discord? If not, please do so here:  https://discord.gg/fSWMAADzar",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      required: true,
      group: "Additional Information",
    },
    discordUsername: {
      type: "text",
      label: "Discord Username",
      placeholder: "Username",
      required: false,
      group: "Personal Information",
    },
    company: {
      type: "text",
      label: "Company (if applicable)",
      placeholder: "Company",
      required: false,
      group: "Personal Information",
    },
    tShirtSize: {
      type: "select",
      label: "T-Shirt Size",
      options: [
        { label: "Small", value: "S" },
        { label: "Medium", value: "M" },
        { label: "Large", value: "L" },
        { label: "XL", value: "XL" },
        { label: "XXL", value: "XXL" },
        { label: "XXXL", value: "XXXL" },
      ],
      required: true,
      group: "Additional Information",
    },
    resumerUrl: {
      type: "file",
      label: "Upload Resume (PDF)",
      required: false,
      group: "Personal Information",
    },
    agreeHackKUCode: {
      type: "checkbox",
      label: (
        <>
          I agree to the{" "}
          <Link
            href="/legal/code-of-conduct"
            className="underline"
            target="_blank">
            HackKU Code of Conduct
          </Link>
          .
        </>
      ),
      required: true,
      fullWidth: true,
      group: "Agreements",
    },
    photoWaiver: {
      type: "checkbox",
      label: (
        <>
          I certify that I am the participant (or parent/guardian if under 18)
          and consent to the terms of the{" "}
          <Link href="/legal/waiver" className="underline" target="_blank">
            HackKU Waiver / Photo Release
          </Link>
          .
        </>
      ),
      required: true,
      fullWidth: true,
      group: "Agreements",
    },
    agreeMLHCode: {
      type: "checkbox",
      label: (
        <>
          I agree to the{" "}
          <Link
            href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
            className="underline"
            target="_blank">
            MLH Code of Conduct
          </Link>
          .
        </>
      ),
      required: true,
      fullWidth: true,
      group: "Agreements",
    },
    shareWithMLH: {
      type: "checkbox",
      label: (
        <>
          I authorize you to share my registration information with Major League
          Hacking in-line with the{" "}
          <Link
            href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
            target="_blank"
            className="underline">
            MLH Privacy Policy
          </Link>
          .
        </>
      ),
      required: true,
      fullWidth: true,
      group: "Agreements",
    },
  };

const onSubmit = (data: RegistrationData) => {
  toast.promise(
    (async () => {
      let uploadedResumeUrl: string | undefined;

      // react-hook-form binds file inputs to a FileList
      const fileList = data.resumeUrl as unknown as FileList;
      const file = fileList?.[0];

      // Ensure we only process if a real file was selected
      if (file instanceof File) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `/api/upload?filename=${encodeURIComponent(file.name)}`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("File upload failed");
        }

        const result = await response.json();
        uploadedResumeUrl = result.downloadUrl;
      }  
      {
        loading: "Submitting registration...",
        success: (
          <div>
            Registration successful!
            {/* Please join our discord{" "}
            <a
              className="text-blue-500 font-bold"
              href={constants.discordInvite}>
              here
            </a>
            ! */}
          </div>
        ),
        error: "Registration failed. Please try again.",
      },
    );
    window.location.replace("/");
  };

  return (
    <Card className="max-w-3xl mx-auto mt-2 border-none shadow-none">
      <CardHeader className="bg-white">
        <CardTitle className="text-center text-xl py-4">
          {constants.hackathonName} Registration
        </CardTitle>
        <p className="pt-4 text-sm">
          {constants.hackathonName} will be held at {constants.location} from{" "}
          {constants.dates}, in-person. For more information, reach out to{" "}
          <Link href={`mailto:${constants.supportEmail}`} className="underline">
            {constants.supportEmail}
          </Link>
          .
        </p>
        <p className="pt-2 text-sm">
          <b>ALL</b> high schoolers under the age of 18 must have an adult
          chaperone in attendance with them.
        </p>
        <p className="pt-2 text-sm">
          You must be a student to attend, if you are a working professional and
          would like to volunteer, please contact us via{" "}
          <Link href={`mailto:${constants.supportEmail}`} className="underline">
            {constants.supportEmail}
          </Link>
          .
        </p>
        <p className="py-2 text-sm">
          We are excited to create with you in April! ❤😁
        </p>
        <hr />
      </CardHeader>

      <CardContent>
        <GenericForm
          schema={participantRegistrationSchema as never}
          config={formConfig}
          onSubmit={onSubmit}
          defaultValues={prefillData ?? undefined}
          localStorageKey={LOCAL_STORAGE_KEY}
          submitLabel="Register!"
        />

        <p className="text-xs text-center mt-8 text-gray-500">
          Have questions? Email us at{" "}
          <Link href={`mailto:${constants.supportEmail}`} className="underline">
            {constants.supportEmail}
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
