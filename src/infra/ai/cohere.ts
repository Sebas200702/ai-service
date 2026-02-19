import { createCohere } from '@ai-sdk/cohere'
import { CONFIG } from '@/config'
const cohere = createCohere({
  apiKey: CONFIG.COHERE_API_KEY,
})

export const cohereTextModel = cohere('command-a-reasoning-08-2025')
