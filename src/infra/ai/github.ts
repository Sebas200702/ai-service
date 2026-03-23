import { env } from '@/env'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const github = createOpenAICompatible({
  name: 'github',
  baseURL: 'https://models.inference.ai.azure.com',
  headers: {
    Authorization: `Bearer ${env.GITHUB_MODELS_API_KEY}`,
  },
})

export const githubTextModel = github.chatModel('gpt-4o')
export const githubTextModelV2 = github.chatModel(
  'Meta-Llama-3.1-405B-Instruct',
)
export const githubTextModelV3 = github.chatModel('gpt-5')
