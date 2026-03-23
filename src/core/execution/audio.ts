import {
  experimental_generateSpeech as generateSpeech,
  type GeneratedAudioFile,
} from 'ai'

import { getFamilyFallbackCandidates } from '@/core/execution/fallback'
import { AppError } from '@/http/middlewares/error'

import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'
export const executeAudioTask = async ({
  model,
  fallbackModels,
  prompt,
}: ExecuteTextTaskInput): Promise<AITaskResult<GeneratedAudioFile>> => {
  if (!prompt) {
    throw AppError.BadRequest(
      'audio',
      'generation',
      'Prompt is required for audio generation'
    )
  }

  const candidates = getFamilyFallbackCandidates(model, fallbackModels)
  let lastError: unknown
  const attemptedModelIds: string[] = []

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]
    attemptedModelIds.push(candidate.id)

    try {
      const { audio } = await generateSpeech({
        model: candidate.model,
        text: prompt,
        voice: '21m00Tcm4TlvDq8ikWAM',
        outputFormat: 'mp3',
      })

      return {
        result: audio,
        provider: candidate.provider,
        modelId: candidate.id,
        pricing: candidate.pricing,
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
