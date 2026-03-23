import {
  type GeneratedFile,
  type ImageModel,
  type LanguageModel,
  generateImage,
  generateText,
} from 'ai'

import { getFamilyFallbackCandidates } from '@/core/execution/fallback'
import { generateApifreeImage } from '@/infra/ai/apifree'

import type { AITaskResult } from '@/core/execution/types'
import type { AIModelDescriptor } from '@/types'
type ImageTaskModel =
  | AIModelDescriptor<LanguageModel>
  | AIModelDescriptor<ImageModel>
  | AIModelDescriptor<string>

const runImageCandidate = async (
  candidate: ImageTaskModel,
  prompt: string,
): Promise<AITaskResult<GeneratedFile | null>> => {
  if (typeof candidate.model === 'string') {
    const { base64, mimeType } = await generateApifreeImage(prompt)
    const uint8Array = new Uint8Array(Buffer.from(base64, 'base64'))
    return {
      result: { uint8Array, mediaType: mimeType } as GeneratedFile,
      provider: candidate.provider,
      modelId: candidate.id,
      pricing: candidate.pricing,
    }
  }

  if ('maxImagesPerCall' in candidate.model) {
    const { images, usage } = await generateImage({
      model: candidate.model as ImageModel,
      prompt,
      size: '1024x1024',
      n: 1,
    })

    const image = images[0]
    if (!image) {
      throw new Error('Image generation returned empty result')
    }

    return {
      result: {
        uint8Array: image.uint8Array,
        mediaType: 'image/png',
      } as GeneratedFile,
      provider: candidate.provider,
      modelId: candidate.id,
      pricing: candidate.pricing,
      usage: {
        promptTokens: usage.inputTokens ?? null,
        completionTokens: usage.outputTokens ?? null,
        totalTokens: usage.totalTokens ?? null,
      },
    }
  }

  const { files, usage } = await generateText({
    model: candidate.model as LanguageModel,
    messages: [{ role: 'user', content: prompt }],
    providerOptions: {
      google: {
        responseModalities: ['IMAGE'],
      },
      openrouter: {
        responseModalities: ['IMAGE'],
      },
    },
  })

  const file = files?.[0]
  if (!file) {
    throw new Error('Image generation returned empty result')
  }

  return {
    result: file,
    provider: candidate.provider,
    modelId: candidate.id,
    pricing: candidate.pricing,
    usage: {
      promptTokens: usage.inputTokens ?? null,
      completionTokens: usage.outputTokens ?? null,
      totalTokens: usage.totalTokens ?? null,
    },
  }
}

export const executeImageTask = async ({
  model,
  fallbackModels,
  prompt,
}: {
  model: ImageTaskModel
  fallbackModels?: ImageTaskModel[]
  prompt: string
}): Promise<AITaskResult<GeneratedFile | null>> => {
  const candidates = getFamilyFallbackCandidates(model, fallbackModels)
  let lastError: unknown
  const attemptedModelIds: string[] = []

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]
    if (!candidate) {
      continue
    }
    attemptedModelIds.push(candidate.id)

    try {
      const result = await runImageCandidate(candidate, prompt)

      return {
        ...result,
        fallbackUsed: index > 0 || attemptedModelIds.length > 1,
        fallbackReason:
          index > 0 && lastError instanceof Error ? lastError.message : null,
        attemptCount: index + 1,
        attemptedModelIds,
      }
    } catch (error) {
      lastError = error
      if (index === candidates.length - 1) {
        throw error
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI task failed')
}
