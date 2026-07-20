import { createAuthClient } from "better-auth/react"
import { magicLinkClient, twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"

export const authClient = createAuthClient({
    plugins: [
        magicLinkClient(),
        twoFactorClient(),
        passkeyClient()
    ]
});

export const { useSession } = authClient;