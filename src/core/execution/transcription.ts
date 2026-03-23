import { experimental_transcribe as transcribe } from 'ai'

import { getFamilyFallbackCandidates } from '@/core/execution/fallback'
import { AppError } from '@/http/middlewares/error'
import { getAudioDuration } from '@/infra/processors/audio'

import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'
import type { GeneratedTranscription } from '@/schemas/transcription'

export const executeTranscriptionTask = async ({
  model,
  fallbackModels,
  audioFile,
}: ExecuteTextTaskInput): Promise<AITaskResult<GeneratedTranscription>> => {
  if (!audioFile) {
    throw new AppError({
      service: 'transcription',
      operation: 'generation',
      reason: 'Audio file is required for transcription',
    })
  }
  const buffer = Buffer.isBuffer(audioFile)
    ? audioFile
    : Buffer.from(await audioFile.arrayBuffer())
  const durationSeconds = await getAudioDuration(buffer)

  const candidates = getFamilyFallbackCandidates(model, fallbackModels)
  let lastError: unknown
  const attemptedModelIds: string[] = []

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]
    attemptedModelIds.push(candidate.id)

    try {
      const { text } = await transcribe({
        model: candidate.model,
        audio: buffer,
        providerOptions: {
          assemblyai: {
            contentSafety: true,
          },
        },
      })

      return {
        result: {
          text,
          durationSeconds,
        },
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
