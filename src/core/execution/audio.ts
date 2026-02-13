import {
  experimental_generateSpeech as generateSpeech,
  type GeneratedAudioFile,
} from 'ai'
import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'
import { AppError } from '@/http/middlewares/error'

export const executeAudioTask = async ({
  model,
  prompt,
  voiceId,
}: ExecuteTextTaskInput): Promise<AITaskResult<GeneratedAudioFile>> => {
  if (!prompt) {
    throw AppError.BadRequest(
      'audio',
      'generation',
      'Prompt is required for audio generation'
    )
  }
  const { audio } = await generateSpeech({
    model: model.model,
    text: prompt,
    voice: voiceId ?? '21m00Tcm4TlvDq8ikWAM',
    outputFormat: 'mp3',
  })
  return { result: audio, provider: model.provider, modelId: model.id }
}
