import { executeImageTask } from '@/core/execution/image'
import { metricsRecorder } from '@/core/metrics/recorder'
import { getNextImageModel } from '@/core/orchestration'
import { createFile } from '@/infra/storage'
import { proccesImage } from '@/infra/processors/sharp'
import type { GeneratedImage } from '@/schemas/image'
import type { ModelMetadata } from '@/types'
import { AppError } from '@/http/middlewares/error'

export const imageService = {
  async generateImage(prompt: string): Promise<{
    data: GeneratedImage
    modelMetadata: ModelMetadata
  }> {
    const model = getNextImageModel()

    if (!model) {
      throw new AppError({
        service: 'image',
        operation: 'model_selection',
        reason: 'No image models available',
      })
    }
    try {
      const { result: task, metrics } = await metricsRecorder(
        () =>
          executeImageTask({
            model,
            prompt,
          }),
        { provider: model.provider, modelId: model.id, type: 'image' }
      )

      if (!task.result) {
        throw new AppError({
          service: 'image',
          operation: 'generation',
          reason: 'Image generation returned empty result',
        })
      }

      const buffer = Buffer.from(task.result.uint8Array)

      const {
        buffer: webpBuffer,
        width,
        height,
        fileName,
      } = await proccesImage(buffer, 80)

      const file = new File([webpBuffer], `${fileName}.webp`, {
        type: 'image/webp',
      })

      const uploaded = await createFile({
        bucket: 'images',
        filePath: `${fileName}.webp`,
        file,
      })

      return {
        data: {
          imageUrl: uploaded.fullPath,
          width,
          height,
          altText: `Generated image for prompt: ${prompt}`,
        },
        modelMetadata: {
          provider: metrics.provider,
          modelId: metrics.modelId,
          type: 'image',
        },
      }
    } catch (error) {
      console.error('Error during image generation:', error)
      throw new AppError({
        service: 'image',
        operation: 'generation',
        reason:
          (error as Error).message || 'Unknown error during image generation',
      })
    }
  },
}
