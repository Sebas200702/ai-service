import type { AIModelDescriptor } from '@/types'

export const getFamilyFallbackCandidates = <
  T extends AIModelDescriptor<unknown>,
>(
  primary: T,
  fallbackModels: T[] = [],
  maxAttempts = 2
) => {
  if (maxAttempts <= 1) {
    return [primary]
  }

  const crossProviderFallbacks = fallbackModels.filter(
    (candidate) => candidate.provider !== primary.provider
  )
  const familyFallbacks = fallbackModels.filter(
    (candidate) => candidate.provider === primary.provider
  )

  const orderedFallbacks = [...crossProviderFallbacks, ...familyFallbacks]

  return [primary, ...orderedFallbacks.slice(0, maxAttempts - 1)]
}
