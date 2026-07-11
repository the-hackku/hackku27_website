import { createAuthClient } from "better-auth/react"
import { magicLinkClient, twoFactorClient, inferAdditionalFields, customSessionClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import type { auth } from "@/lib/auth/auth"

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        magicLinkClient(),
        twoFactorClient(),
        customSessionClient<typeof auth>(),
        passkeyClient()
    ]
});

export const { useSession } = authClient;