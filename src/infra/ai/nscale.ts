import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { env } from '@/env'

const nscale = createOpenAICompatible({
  name: 'nscale',
  baseURL: 'https://inference.api.nscale.com/v1',
  headers: {
    Authorization: `Bearer ${env.NSCALE_API_KEY}`,
  },
})

export const nscaleImageModel = nscale.imageModel(
  'ByteDance/SDXL-Lightning-4step'
)
