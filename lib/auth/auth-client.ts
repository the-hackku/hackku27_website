import { createAuthClient } from "better-auth/react"
import { magicLinkClient, twoFactorClient, inferAdditionalFields, customSessionClient, adminClient, organizationClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import type { auth } from "@/lib/auth/auth"
import { ac, roles } from "@/lib/auth/permissions"

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        magicLinkClient(),
        twoFactorClient(),
        customSessionClient<typeof auth>(),
        passkeyClient(),
        adminClient({
            ac,
            roles: {
                hacker: roles.hacker,
                mentor: roles.mentor,
                judge: roles.judge,
                bronze_sponsor: roles.bronze_sponsor,
                silver_sponsor: roles.silver_sponsor,
                gold_sponsor: roles.gold_sponsor,
                volunteer: roles.volunteer,
                writer: roles.writer,
                admin: roles.admin
            }
        }),
        organizationClient()
    ]
});

export const { useSession } = authClient;