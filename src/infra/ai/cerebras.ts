import { createCerebras } from '@ai-sdk/cerebras'
import { env } from '@/env'

const cerebras = createCerebras({
  apiKey: env.CEREBRAS_API_KEY ?? '',
})

export const cerebrasTextModel = cerebras.languageModel(
  'qwen-3-235b-a22b-instruct-2507'
)
