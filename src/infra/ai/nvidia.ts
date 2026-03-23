import { env } from '@/env'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const nim = createOpenAICompatible({
  name: 'nim',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  headers: {
    Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
  },
})

export const nvidiaTextModel = nim.chatModel('deepseek-ai/deepseek-v3.2')
