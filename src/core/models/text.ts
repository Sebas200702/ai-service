import { cerebrasTextModel } from '@/infra/ai/cerebras'
import { cohereTextModel } from '@/infra/ai/cohere'
import { geminiModel } from '@/infra/ai/gemini'
import {
  githubTextModel,
  githubTextModelV2,
  githubTextModelV3,
} from '@/infra/ai/github'
import { groqModel } from '@/infra/ai/groq'
import { ministralTextModel } from '@/infra/ai/ministral'
import { nvidiaTextModel } from '@/infra/ai/nvidia'
import { ollmTextModel } from '@/infra/ai/olm'
import {
  openRouterTextModel,
  openRouterTextModelV4,
} from '@/infra/ai/open-router'

import { textModelPricing } from '@/core/models/pricing'
import { vertexModel } from '@/infra/ai/vertex'
import type { AIModelDescriptor } from '@/types'
import type { LanguageModel } from 'ai'

const baseTextModels: AIModelDescriptor<LanguageModel>[] = [
  {
    id: 'cohere-command-a-reasoning-08-2025',
    provider: 'cohere',
    type: 'text',
    model: cohereTextModel,
  },
  {
    id: 'github-gpt-4o',
    provider: 'github',
    type: 'text',
    model: githubTextModel,
  },
  {
    id: 'ministral-3.0',
    provider: 'ministral',
    type: 'text',
    model: ministralTextModel,
  },
  {
    id: 'github-llama-3.1-405b',
    provider: 'github',
    type: 'text',
    model: githubTextModelV2,
  },
  {
    id: 'github-openai-gpt-5',
    provider: 'github',
    type: 'text',
    model: githubTextModelV3,
  },
  {
    id: 'arcee-ai/trinity-large-preview:free',
    provider: 'openrouter',
    type: 'text',
    model: openRouterTextModel,
  },
  {
    id: 'nvidia-nemotron-70b',
    provider: 'nvidia',
    type: 'text',
    model: nvidiaTextModel,
  },
  {
    id: 'qwen-3-235b-a22b-instruct-2507',
    provider: 'cerebras',
    type: 'text',
    model: cerebrasTextModel,
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    provider: 'openrouter',
    type: 'text',
    model: openRouterTextModelV4,
  },
  {
    id: 'groq-qwen-32b',
    provider: 'groq',
    type: 'text',
    model: groqModel,
  },
  {
    id: 'phala-kimi-k2.5',
    provider: 'ollm',
    type: 'text',
    model: ollmTextModel,
  },

  {
    id: 'gemini-3-flash',
    provider: 'gemini',
    type: 'text',
    model: geminiModel,
  },
  {
    id: 'vertex-gemini-3.0',
    provider: 'vertex',
    type: 'text',
    model: vertexModel,
  },
]

export const textModels: AIModelDescriptor<LanguageModel>[] =
  baseTextModels.map((model) => ({
    ...model,
    pricing: textModelPricing[model.id] ?? undefined,
  }))
