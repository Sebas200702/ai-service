import { createMistral } from '@ai-sdk/mistral'
import { env } from '@/env'
const mistral = createMistral({
  apiKey: env.MINISTRAL_API_KEY,
})

export const ministralTextModel = mistral('mistral-large-latest')
