import { Elysia } from 'elysia'

import {
  resolveRequestIdentity,
  type RequestIdentity,
  type RequestIdentityTier,
} from '@/http/middlewares/identity'
import type { ApiResponse } from '@/types'

const RATE_LIMIT_WINDOW_MS = 60_000

const RATE_LIMITS_BY_TIER = {
  anonymous: 10,
  registered: 60,
} as const satisfies Record<RequestIdentityTier, number>

const RATE_LIMIT_MESSAGES_BY_TIER = {
  anonymous:
    'Límite anónimo alcanzado. ¡Regístrate gratis para aumentar tus créditos!',
  registered: 'Has superado tu límite actual.',
} as const satisfies Record<RequestIdentityTier, string>

interface RateLimitBucket {
  count: number
  resetAt: number
}

type RateLimitContext = {
  request: Request
  set: { headers: Record<string, string | number>; status?: number }
}

type RateLimitState = {
  tier: RequestIdentityTier
  maxRequests: number
  remaining: number
  resetAt: number
  limited: boolean
  retryAfter?: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()
const requestRateLimitState = new WeakMap<Request, RateLimitState>()

const getRateLimitKey = (identity: RequestIdentity) =>
  `${identity.tier}:${identity.userId}`

const createRateLimitResponse = (
  tier: RequestIdentityTier
): ApiResponse<null> => ({
  success: false,
  data: null,
  error: {
    code: 'RATE_LIMIT.EXCEEDED',
    message: RATE_LIMIT_MESSAGES_BY_TIER[tier],
  },
  modelMetadata: null,
})

const setRateLimitHeaders = (
  set: { headers: Record<string, string | number> },
  maxRequests: number,
  remaining: number,
  resetAt: number
) => {
  set.headers = {
    ...set.headers,
    'x-ratelimit-limit': String(maxRequests),
    'x-ratelimit-remaining': String(Math.max(remaining, 0)),
    'x-ratelimit-reset': String(Math.ceil(resetAt / 1000)),
  }
}

const buildRateLimitHeaders = (state: RateLimitState) => ({
  'x-ratelimit-limit': String(state.maxRequests),
  'x-ratelimit-remaining': String(Math.max(state.remaining, 0)),
  'x-ratelimit-reset': String(Math.ceil(state.resetAt / 1000)),
  ...(state.retryAfter ? { 'retry-after': String(state.retryAfter) } : {}),
})

const cleanupExpiredBucket = (key: string, now: number) => {
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.delete(key)
    return null
  }

  return bucket
}

export const rateLimitBeforeHandle = async (context: unknown) => {
  const { request, set } = context as RateLimitContext
  const identity = await resolveRequestIdentity(request)
  const { tier } = identity
  const maxRequests = RATE_LIMITS_BY_TIER[tier]
  const now = Date.now()
  const key = getRateLimitKey(identity)
  const bucket = cleanupExpiredBucket(key, now)

  if (!bucket) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS

    rateLimitBuckets.set(key, { count: 1, resetAt })

    const state: RateLimitState = {
      tier,
      maxRequests,
      remaining: maxRequests - 1,
      resetAt,
      limited: false,
    }

    requestRateLimitState.set(request, state)

    setRateLimitHeaders(set, maxRequests, maxRequests - 1, resetAt)

    return
  }

  bucket.count += 1

  const remaining = maxRequests - bucket.count
  const limited = bucket.count > maxRequests
  const retryAfter = limited
    ? Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    : undefined

  const state: RateLimitState = {
    tier,
    maxRequests,
    remaining,
    resetAt: bucket.resetAt,
    limited,
    retryAfter,
  }

  requestRateLimitState.set(request, state)

  setRateLimitHeaders(set, maxRequests, remaining, bucket.resetAt)

  if (limited) {
    set.status = 429
    return new Response(JSON.stringify(createRateLimitResponse(tier)), {
      status: 429,
      headers: {
        'content-type': 'application/json',
        ...buildRateLimitHeaders(state),
      },
    })
  }

  rateLimitBuckets.set(key, bucket)
}

export const rateLimitAfterHandle = (context: unknown) => {
  const { request, set } = context as RateLimitContext
  const state = requestRateLimitState.get(request)

  if (!state) {
    return
  }

  set.headers = {
    ...set.headers,
    ...buildRateLimitHeaders(state),
  }

  requestRateLimitState.delete(request)
}

export const requestRateLimit = new Elysia({
  name: 'request-rate-limit',
})
  .onBeforeHandle(rateLimitBeforeHandle)
  .onAfterHandle(rateLimitAfterHandle)
