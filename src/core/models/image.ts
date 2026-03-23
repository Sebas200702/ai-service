import { geminiImageModel } from '@/infra/ai/gemini'

import { nscaleImageModel } from '@/infra/ai/nscale'

import { vertexImageModel } from '@/infra/ai/vertex'
import { imageModelPricing } from '@/core/models/pricing'

import type { AIModelDescriptor } from '@/types'
import type { ImageModel, LanguageModel } from 'ai'

const baseImageModels: (
  | AIModelDescriptor<LanguageModel>
  | AIModelDescriptor<ImageModel>
  | AIModelDescriptor<string>
)[] = [
  {
    id: 'nscale-sdxl-lightning',
    provider: 'nscale',
    type: 'image',
    model: nscaleImageModel,
  },
  {
    id: 'qwen-image-2512',
    provider: 'apifree',
    type: 'image',
    model: 'apifree-qwen-image',
  },
  {
    id: 'gemini-3.0-image',
    provider: 'gemini',
    type: 'image',
    model: geminiImageModel,
  },
  {
    id: 'vertex-gemini-3.0-image',
    provider: 'vertex',
    type: 'image',
    model: vertexImageModel,
  },
]

export const imageModels = baseImageModels.map((model) => ({
  ...model,
  pricing: imageModelPricing[model.id] ?? undefined,
}))
