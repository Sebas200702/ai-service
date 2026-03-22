import { createCerebras } from '@ai-sdk/cerebras'
import { env } from '@/env'

const cerebras = createCerebras({
  apiKey: env.CEREBRAS_API_KEY ?? '',
})

export const cerebrasTextModel = cerebras.languageModel('gpt-oss-120b')
