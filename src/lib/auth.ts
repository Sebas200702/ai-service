import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

import { env } from '@/env'

const requiredEnv = (value: string, name: string) => {
  if (!value) {
    throw new Error(`${name} is required for Better Auth configuration`)
  }

  return value
}

const requiredSecret = (value: string) => {
  const secret = requiredEnv(value, 'BETTER_AUTH_SECRET')

  if (secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET must be at least 32 characters long for Better Auth'
    )
  }

  return secret
}

const normalizeOrigin = (value: string) => {
  const url = new URL(requiredEnv(value, 'BETTER_AUTH_URL'))
  return url.origin
}

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
}

export const auth = betterAuth({
  appName: 'AI Service',
  baseURL: normalizeOrigin(env.BETTER_AUTH_URL),
  secret: requiredSecret(env.BETTER_AUTH_SECRET),
  trustedOrigins: [normalizeOrigin(env.BETTER_AUTH_URL)],
  database: new Pool({
    connectionString: requiredEnv(env.DATABASE_URL, 'DATABASE_URL'),
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
})
