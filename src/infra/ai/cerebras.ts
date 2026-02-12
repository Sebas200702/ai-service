import { createCerebras } from '@ai-sdk/cerebras'
import { CONFIG } from '@/config'

const cerebras = createCerebras({
  apiKey: CONFIG.CEREBRAS_API_KEY ?? '',
})

export const cerebrasTextModel = cerebras.languageModel('gpt-oss-120b')

