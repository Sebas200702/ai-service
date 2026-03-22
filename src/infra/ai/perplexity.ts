import { env } from '@/env'
import { createPerplexity } from '@ai-sdk/perplexity'
export const perplexity = createPerplexity({
  apiKey: env.PERPLEXITY_API_KEY,
})

export const perplexityModel = perplexity('sonar')
