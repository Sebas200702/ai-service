import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { CONFIG } from '@/config'

const nscale = createOpenAICompatible({
  name: 'nscale',
  baseURL: 'https://inference.api.nscale.com/v1',
  headers: {
    Authorization: `Bearer ${CONFIG.NSCALE_API_KEY}`,
  },
})

export const nscaleImageModel = nscale.imageModel(
  'ByteDance/SDXL-Lightning-4step',
)
