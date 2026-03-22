import { executeTranscriptionTask } from '@/core/execution/transcription'
import { getNextTranscriptionModel } from '@/core/orchestration/index'
import { AppError } from '@/http/middlewares/error'
import { fetchAudioBuffer } from '@/infra/processors/audio'

import type { StandardTranscriptionResult } from '@/types'

export const transcriptionService = {
  async transcribe(
    audioFile: File | string
  ): Promise<StandardTranscriptionResult> {
    const model = getNextTranscriptionModel()
    if (!model) {
      throw new AppError({
        service: 'transcription',
        operation: 'model_selection',
        reason: 'No transcription models available',
      })
    }
    if (!audioFile) {
      throw new AppError({
        service: 'transcription',
        operation: 'input_validation',
        reason: 'No audio file provided for transcription',
      })
    }

    try {
      const { result } = await executeTranscriptionTask({
        model,
        audioFile:
          typeof audioFile === 'string'
            ? await fetchAudioBuffer(audioFile)
            : audioFile,
      })

      return {
        data: result,
        modelMetadata: {
          provider: model.provider,
          type: 'transcription',
          modelId: model.id,
        },
      }
    } catch (error) {
      console.error('Error during transcription:', error)
      throw new AppError({
        service: 'transcription',
        operation: 'generation',
        reason:
          (error as Error).message || 'Unknown error during transcription',
      })
    }
  },
}
