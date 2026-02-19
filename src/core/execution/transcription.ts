import { experimental_transcribe as transcribe } from 'ai'

import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'
import { AppError } from '@/http/middlewares/error'
import { getAudioDuration } from '@/infra/processors/audio'
import type { GeneratedTranscription } from '@/schemas/transcription'

export const executeTranscriptionTask = async ({
  model,
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
  const { text } = await transcribe({
    model: model.model,
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
    provider: model.provider,
    modelId: model.id,
  }
}
