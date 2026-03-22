import { executeAudioTask } from '@/core/execution/audio'
import { metricsRecorder } from '@/core/metrics/recorder'
import { getNextAudioModel } from '@/core/orchestration'
import { AppError } from '@/http/middlewares/error'
import { processAudio } from '@/infra/processors/audio'
import { createFile } from '@/infra/storage'
import type { StandardAudioResult } from '@/types'
export const audioService = {
  async generate({
    prompt,
    voiceId,
  }: {
    prompt: string
    voiceId?: string
  }): Promise<StandardAudioResult> {
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
          prompt,
          voiceId,
        }),
      { provider: model.provider, modelId: model.id, type: 'voice' }
    )

    if (!taskResult.result) {
      throw new AppError({
        service: 'audio',
        operation: 'generation',
        reason: 'Audio generation returned empty result',
      })
    }

    const buffer = Buffer.from(taskResult.result.uint8Array)
    const { durationSeconds, format, fileName } = await processAudio(buffer)
    const file = new File([buffer], `${fileName}.${format}`, {
      type: `audio/${format}`,
    })

    const uploaded = await createFile({
      bucket: 'audio',
      file,
      filePath: `${fileName}.${format}`,
    })

    return {
      data: {
        audioUrl: uploaded.publicUrl,
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
