import { Elysia } from 'elysia'

import { validateApiKey } from '@/core/auth/apikey'
import { auth } from '@/lib/auth'

export type RequestIdentityTier =  'registered' | 'anonymous'

export interface RequestIdentity {
  tier: RequestIdentityTier
  userId: string
}

export const resolveRequestIdentity = async (
  request: Request
): Promise<RequestIdentity> => {
  const apiKey = request.headers.get('x-api-key')

  if (apiKey) {
    const user = await validateApiKey(apiKey)

    if (user) {
      return {
        tier: 'registered',
        userId: user.id,
      }
    }
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (session) {
    return {
      tier: 'registered',
      userId: session.user.id,
    }
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const userId =
    forwardedFor?.split(',')[0]?.trim() || realIp?.trim() || 'anonymous'

  return {
    tier: 'anonymous',
    userId,
  }
}

export const identifyUser = new Elysia({ name: 'identify-user' }).derive(
  async ({ request }) => {
    const identity = await resolveRequestIdentity(request)

    return {
      identity,
    }
  }
)
