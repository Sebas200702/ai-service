import { env } from '@/env'
import { createCohere } from '@ai-sdk/cohere'
const cohere = createCohere({
  apiKey: env.COHERE_API_KEY,
})

export const cohereTextModel = cohere('command-a-reasoning-08-2025')
