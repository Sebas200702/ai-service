import { createAuthClient } from 'better-auth/client'

import { env } from '@/env'

export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
