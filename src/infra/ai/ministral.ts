import { createMistral } from '@ai-sdk/mistral'
import { CONFIG } from '@/config'
const mistral = createMistral({
  apiKey: CONFIG.MINISTRAL_API_KEY,
})

export const ministralTextModel = mistral('mistral-large-latest')
