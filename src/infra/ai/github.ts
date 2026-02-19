import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { CONFIG } from '@/config'

const github = createOpenAICompatible({
  name: 'github',
  baseURL: 'https://models.inference.ai.azure.com',
  headers: {
    Authorization: `Bearer ${CONFIG.GITHUB_MODELS_API_KEY}`,
  },
})

export const githubTextModel = github.chatModel('gpt-4o')
export const githubTextModelV2 = github.chatModel(
  'Meta-Llama-3.1-405B-Instruct'
)
export const githubTextModelV3 = github.chatModel('Mistral-large-2407')
