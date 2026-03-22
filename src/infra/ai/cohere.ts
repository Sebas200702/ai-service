import { createCohere } from '@ai-sdk/cohere'
import { env } from '@/env'
const cohere = createCohere({
  apiKey: env.COHERE_API_KEY,
})

export const cohereTextModel = cohere('command-a-reasoning-08-2025')
