import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { env } from '@/env'

export const openRouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

export const openRouterTextModel = openRouter.chat(
  'arcee-ai/trinity-large-preview:free'
)
export const openRouterTextModelV2 = openRouter.chat(
  'tngtech/deepseek-r1t2-chimera:free'
)

export const openRouterTextModelV3 = openRouter.chat(
  'qwen/qwen3-next-80b-a3b-instruct:free'
)

export const openRouterTextModelV4 = openRouter.chat('z-ai/glm-4.5-air:free')
