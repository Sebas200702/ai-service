import { env } from '@/env'
import { createMistral } from '@ai-sdk/mistral'
const mistral = createMistral({
  apiKey: env.MINISTRAL_API_KEY,
})

export const ministralTextModel = mistral('mistral-large-latest')
