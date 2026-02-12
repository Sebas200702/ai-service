import { CONFIG } from '@/config'
import { createPerplexity } from '@ai-sdk/perplexity'
export const perplexity = createPerplexity({
  apiKey: CONFIG.PERPLEXITY_API_KEY,
})

export const perplexityModel = perplexity('sonar')

