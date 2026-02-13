import { executeAudioTask } from '@/core/execution/audio'
import { metricsRecorder } from '@/core/metrics/recorder'
import { getNextAudioModel } from '@/core/orchestration'
import { AppError } from '@/http/middlewares/error'
import { processAudio } from '@/infra/processors/audio'
import { createFile, getPublicFilePreviewUrl } from '@/infra/storage/appwrite'
import type { GeneratedAudio } from '@/schemas/generated-audio'
import type { ModelMetadata } from '@/types'
export const audioService = {
  async generate(prompt: string): Promise<{
    audio: GeneratedAudio
    modelMetadata: ModelMetadata
  }> {
    const model = getNextAudioModel()
    if (!model) {
      throw new AppError({
        service: 'audio',
        operation: 'model_selection',
        reason: 'No audio models available',
      })
    }

    const { result: taskResult, metrics } = await metricsRecorder(
      () =>
        executeAudioTask({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      { provider: model.provider, modelId: model.id, type: 'voice' }
    )
    console.log('Audio task result:', taskResult)

    if (!taskResult.result) {
      throw new AppError({
        service: 'audio',
        operation: 'generation',
        reason: 'Audio generation returned empty result',
      })
    }

    const buffer = Buffer.from(taskResult.result.uint8Array)
    const { durationSeconds, format, fileName } = await processAudio(buffer)

    const uploaded = await createFile({
      buffer,
      name: fileName,
      type: 'audio',
    })
    const audioUrl = getPublicFilePreviewUrl(uploaded.$id, 'audio')

    return {
      audio: {
        audioUrl,
        durationSeconds,
        format,
      },
      modelMetadata: {
        provider: metrics.provider,
        modelId: metrics.modelId,
        type: 'voice',
      },
    }
  },
}
