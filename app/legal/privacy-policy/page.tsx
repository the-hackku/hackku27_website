import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md text-gray-800">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
          HackKU Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          <strong>Last Updated:</strong> June 28, 2026
        </p>

        {/* Section 1 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          1. Introduction
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Welcome to HackKU! This Privacy Policy explains how the HackKU
          organizing team collects, uses, shares, and protects your personal
          information when you apply for, attend, or interact with our event and
          website. We are committed to protecting your privacy and complying
          with applicable global and state privacy regulations, including the
          General Data Protection Regulation (GDPR) and state-specific laws. By
          participating in HackKU, you agree to the practices described in this
          policy.
        </p>

        {/* Section 2 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          2. Information We Collect
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          We collect information to run a safe, engaging, inclusive, and
          well-managed event.
        </p>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-4">
          <li>
            <strong>Required Registration Information:</strong> To attend, you
            must be at least 14 years of age and provide your name, phone
            number, age, email address, country of residence, t-shirt size,
            current school, and level of study.
          </li>
          <li>
            <strong>Minor Chaperone Information:</strong> If you are between the
            ages of 14 and 17, we require the name, email address, and phone
            number of your designated chaperone for safety and liability
            purposes.
          </li>
          <li>
            <strong>Optional Registration Information:</strong> You may choose
            to provide additional details, including your resume, gender
            identity, race, Hispanic/Latino identification, dietary
            restrictions, special accommodations, major, minor, and the number
            of previously attended hackathons.
          </li>
          <li>
            <strong>OAuth & Third-Party Sign-In:</strong> If you choose to
            register or log in using a third-party OAuth provider (Google,
            Discord, GitHub, LinkedIn, or MyMLH), we automatically collect the
            profile information permitted by your provider and your
            authorization settings. While some providers only share basic
            authentication details (like your name and email address), others
            (such as MyMLH) may automatically pre-fill required registration
            fields on your application based on your profile settings with that
            platform. Third-party authentication usage is subject to the
            respective provider's policies (see Section 4).
          </li>
          <li>
            <strong>Event and Participation Data:</strong> During the event, we
            collect information regarding the teams you form and the projects
            you build and submit. We track this information internally and
            utilize an external platform for project hosting and judging (see
            Section 4).
          </li>
          <li>
            <strong>Media and Photography:</strong> Please note that
            photography, filming, and media recording occur throughout the
            hackathon. Media captured at the event is governed by our separate{" "}
            <Link
              href="INSERT_YOUR_LINK_HERE"
              className="text-blue-600 hover:underline"
            >
              HackKU Photo Waiver
            </Link>
            , which all participants must review and agree to during the
            application process.
          </li>
          <li>
            <strong>Automatically Collected Information & Analytics:</strong>{" "}
            When you visit our website, we use{" "}
            <strong>Vercel Web Analytics</strong> to collect basic technical
            data (such as your IP address, browser type, and operating system)
            to maintain security, manage sessions, and track aggregate usage
            trends. We also employ automated bot-detection services during
            authentication (see Section 4).
          </li>
        </ul>

        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 my-6 rounded-r text-gray-700">
          <p className="text-sm leading-relaxed">
            <strong>Your Privacy Choices:</strong> We respect your right to
            privacy. You can explicitly opt out of Vercel Web Analytics tracking
            at any time by enabling a <strong>Do Not Track (DNT)</strong> signal
            in your browser settings, or by clicking the opt-out button on our
            privacy banner. If you opt out, this preference is saved as an{" "}
            <strong>essential cookie</strong> on your browser. This cookie does
            not track you; it is strictly required to ensure our systems
            remember your choice and stop collecting your session data.
          </p>
        </div>

        {/* Section 3 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          3. How and Why We Use Your Information
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Under laws like the GDPR, we must have a "lawful basis" for processing
          your data. We process your data to fulfill our commitment to provide
          you with the hackathon experience (Contract), to ensure a safe and
          secure event (Legitimate Interest), and based on your explicit
          permission (Consent). Specifically, we use it to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
          <li>
            Process your application, authenticate your account, prevent
            automated spam, and communicate event updates.
          </li>
          <li>
            Manage event logistics, including catering (via dietary
            restrictions), accessibility (via special accommodations), and swag
            distribution.
          </li>
          <li>
            Provide a safe, age-appropriate environment for all attendees.
          </li>
          <li>
            Facilitate project submissions, community communication, and
            judging.
          </li>
          <li>
            Analyze registration demographics and trends to improve the
            inclusivity and reach of future HackKU events.
          </li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          4. Third-Party Platforms and Services
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          To host a hackathon on our web platform, HackKU integrates several
          external services. Each service handles your data independently
          according to its own policies. Additionally, any participant activity
          on our interactive third-party platforms is strictly subject to the{" "}
          <Link
            href="INSERT_YOUR_COC_LINK_HERE"
            className="text-blue-600 hover:underline"
          >
            HackKU Code of Conduct
          </Link>
          .
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
          Event Operations & Security
        </h3>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-4">
          <li>
            <strong>Devpost (Project Submissions & Judging):</strong> We use
            Devpost to manage, showcase, and judge project submissions. Your use
            of this service is governed by the{" "}
            <Link
              href="https://devpost.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Devpost Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://devpost.com/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Devpost Terms of Service
            </Link>
            .
          </li>
          <li>
            <strong>Discord (Community & Communication):</strong> We use Discord
            for official event announcements, digital mentoring, and teammate
            matching. While joining our Discord server is strongly suggested, it
            is entirely optional. Your activity on Discord is governed by the{" "}
            <Link
              href="https://discord.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Discord Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://discord.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Discord Terms of Service
            </Link>
            .
          </li>
          <li>
            <strong>Cloudflare Turnstile (Bot Protection):</strong> We use
            Cloudflare Turnstile on authenticated areas of our website to
            evaluate browser telemetry and block malicious bot activity. Data
            processed by this security service is subject to the{" "}
            <Link
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Cloudflare Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://www.cloudflare.com/terms/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Cloudflare Terms of Service
            </Link>
            . Our technical use of this service and its data collection
            parameters are explicitly detailed in Cloudflare's specific{" "}
            <Link
              href="https://www.cloudflare.com/turnstile-privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Turnstile Privacy Addendum
            </Link>
            .
          </li>
          <li>
            <strong>Major League Hacking (Tournament Administration):</strong>{" "}
            HackKU is an official Major League Hacking (MLH) member event. By
            registering, you authorize us to share your required application and
            registration details with MLH for tournament administration,
            aggregate event statistics, and ensuring compliance with community
            guidelines. Your data shared with MLH is subject to the{" "}
            <Link
              href="https://mlh.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              MLH Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://mlh.io/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              MLH Terms of Service
            </Link>
            .
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
          Authentication Providers (OAuth)
        </h3>
        <p className="mb-2 text-gray-700">
          If you utilize third-party credentials to log into our platform, your
          data handling by those platforms is governed by their respective
          agreements:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
          <li>
            <strong>Google:</strong> Subject to the{" "}
            <Link
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Terms of Service
            </Link>
            .
          </li>
          <li>
            <strong>GitHub:</strong> Subject to the{" "}
            <Link
              href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub Privacy Statement
            </Link>{" "}
            and{" "}
            <Link
              href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub Terms of Service
            </Link>
            .
          </li>
        </ul>

        {/* Section 5 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          5. Sharing with Sponsors (Anonymized & Opt-In)
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          HackKU is made possible by our sponsors. We share attendee data with
          them in two specific ways:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
          <li>
            <strong>Anonymized Analytics:</strong> We share aggregated,
            non-personally identifiable information with our sponsors to
            demonstrate the impact and demographics of our event. This includes
            high-level summaries of majors, graduation years, general geographic
            reach, and demographic breakdowns.{" "}
            <strong>
              This data is strictly aggregated and cannot be used to identify
              you.
            </strong>
          </li>
          <li>
            <strong>Opt-In Sharing:</strong> If you explicitly opt-in during
            registration to share your specific information for recruiting
            purposes (such as your resume, name, and email address), we will
            pass that directly to our sponsors. You are never required to opt-in
            to this sharing to attend the event.
          </li>
        </ul>

        {/* Section 6 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          6. Data Storage, Security, and Retention
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          We take reasonable steps to protect your data from unauthorized access
          or disclosure. Your information is stored securely using
          industry-standard databases and access controls, and it is only
          accessible by authorized HackKU organizing team members.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          <strong>Data Retention and Prefilling:</strong> To streamline your
          experience, we retain your registration data across years so that your
          information can be securely prefilled when you register for future
          HackKU events. This long-term retention includes your logistical
          details like dietary restrictions and special accommodations to ensure
          your future event needs are pre-loaded. You can update any of this
          information or request its complete erasure at any time.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          <strong>International Transfers:</strong> HackKU is based in the
          United States. If you are accessing our website or applying from
          outside the US (such as the European Economic Area), please be aware
          that your information will be transferred to, stored, and processed in
          the United States.
        </p>

        {/* Section 7 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          7. Your Data Rights
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Regardless of where you live, you own your data. Depending on your
          region (such as under the GDPR or CCPA), you have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
          <li>
            <strong>Access:</strong> Request a copy of the personal data we hold
            about you.
          </li>
          <li>
            <strong>Rectification:</strong> Request that we correct any
            inaccurate or incomplete personal data.
          </li>
          <li>
            <strong>Erasure (Right to be Forgotten):</strong> Request that we
            delete your personal data from our systems.
          </li>
          <li>
            <strong>Data Portability:</strong> Request a copy of your data in a
            structured, commonly used, machine-readable format.
          </li>
          <li>
            <strong>Withdraw Consent:</strong> Withdraw your consent for sponsor
            data sharing or other optional processing at any time. (Note:
            withdrawing consent for basic event communications or required
            safety fields may result in losing your registration spot).
          </li>
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed">
          To exercise any of these rights, please contact us using the
          information below. We will respond to your request within the
          timeframe required by applicable law (typically 30 days).
        </p>

        {/* Section 8 */}
        <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900">
          8. Contact Us
        </h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          If you have any questions, concerns, or requests regarding this
          Privacy Policy, your data rights, or the event itself, please reach
          out to our team at:{" "}
          <a
            href="mailto:hack@ku.edu"
            className="text-blue-600 hover:underline font-semibold"
          >
            hack@ku.edu
          </a>
        </p>
      </div>
    </div>
  );
}
