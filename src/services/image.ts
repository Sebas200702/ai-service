import { executeImageTask } from '@/core/execution/image'
import { metricsRecorder } from '@/core/metrics/recorder'
import {
  getImageModelCandidates,
  getNextImageModel,
} from '@/core/orchestration'
import { createFile } from '@/infra/storage'
import { proccesImage } from '@/infra/processors/sharp'
import type { GeneratedImage, InputImage } from '@/schemas/image'
import type { ModelMetadata } from '@/types'
import { AppError } from '@/http/middlewares/error'

export const imageService = {
  async generateImage(input: InputImage): Promise<{
    data: GeneratedImage
    modelMetadata: ModelMetadata
  }> {
    const strategy =
      input.mode === 'manual' ? 'manual' : (input.strategy ?? 'lowLatency')

    if (input.mode === 'manual' && !input.modelId) {
      throw new AppError({
        service: 'image',
        operation: 'model_selection',
        reason: 'Manual mode requires a modelId',
      })
    }

    const candidates = await getImageModelCandidates({
      mode: input.mode,
      strategy,
      modelId: input.modelId,
    })
    const model = await getNextImageModel({
      mode: input.mode,
      strategy,
      modelId: input.modelId,
    })

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
            fallbackModels: candidates
              .filter((candidate) => candidate.id !== model.id)
              .slice(0, 1),
            prompt: input.prompt,
          }),
        {
          provider: model.provider,
          modelId: model.id,
          type: 'image',
          mode: input.mode,
          strategy,
          pricing: model.pricing,
        },
        (result, base) => ({
          ...base,
          provider: result.provider,
          modelId: result.modelId,
          pricing: result.pricing ?? base.pricing,
          fallbackUsed:
            (result.attemptCount ?? 1) > 1 || (result.fallbackUsed ?? false),
          reason: result.fallbackReason ?? base.reason ?? null,
        }),
        (result) => ({
          inputTokens: result.usage?.promptTokens ?? null,
          outputTokens: result.usage?.completionTokens ?? null,
          totalTokens: result.usage?.totalTokens ?? null,
        }),
        (_, context) => {
          const perImage = context.pricing?.perImage

          if (typeof perImage !== 'number' || !Number.isFinite(perImage)) {
            return { totalCost: 0, isCostEstimated: false }
          }

          return {
            totalCost: perImage,
            isCostEstimated: true,
          }
        }
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
        bucket: 'image',
        filePath: `${fileName}.webp`,
        file,
      })

      return {
        data: {
          imageUrl: uploaded.publicUrl,
          width,
          height,
          altText: `Generated image for prompt: ${input.prompt}`,
        },
        modelMetadata: {
          provider: metrics.provider,
          modelId: metrics.modelId,
          type: 'image',
          execution: {
            mode: metrics.mode,
            strategy: metrics.strategy,
            attemptCount: task.attemptCount,
            attemptedModelIds: task.attemptedModelIds,
            latencyMs: metrics.latency,
            inputTokens: metrics.inputTokens,
            outputTokens: metrics.outputTokens,
            totalTokens: metrics.totalTokens,
            totalCostUsd: metrics.totalCost,
            isCostEstimated: metrics.isCostEstimated,
            fallbackUsed: metrics.fallbackUsed,
            reason: metrics.reason,
            timestamp: metrics.timestamp,
          },
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
