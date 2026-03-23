import { executeAudioTask } from '@/core/execution/audio'
import { metricsRecorder } from '@/core/metrics/recorder'
import {
  getAudioModelCandidates,
  getNextAudioModel,
} from '@/core/orchestration'
import { AppError } from '@/http/middlewares/error'
import { processAudio } from '@/infra/processors/audio'
import { createFile } from '@/infra/storage'
import type { InputAudio } from '@/schemas/audio'
import type { StandardAudioResult } from '@/types'
export const audioService = {
  async generate({
    prompt,
    mode,
    strategy,
    modelId,
    voiceId,
  }: InputAudio & { voiceId?: string }): Promise<StandardAudioResult> {
    const selectedStrategy =
      mode === 'manual' ? 'manual' : (strategy ?? 'lowLatency')

    if (mode === 'manual' && !modelId) {
      throw new AppError({
        service: 'audio',
        operation: 'model_selection',
        reason: 'Manual mode requires a modelId',
      })
    }

    const candidates = await getAudioModelCandidates({
      mode,
      strategy: selectedStrategy,
      modelId,
    })
    const model = await getNextAudioModel({
      mode,
      strategy: selectedStrategy,
      modelId,
    })
    if (!model) {
      throw new AppError({
        service: 'audio',
        operation: 'model_selection',
        reason: 'No audio models available',
      })
    }

    const { result: generationResult, metrics } = await metricsRecorder(
      async () => {
        const taskResult = await executeAudioTask({
          model,
          fallbackModels: candidates
            .filter((candidate) => candidate.id !== model.id)
            .slice(0, 1),
          prompt,
          voiceId,
        })

        if (!taskResult.result) {
          throw new AppError({
            service: 'audio',
            operation: 'generation',
            reason: 'Audio generation returned empty result',
          })
        }

        const buffer = Buffer.from(taskResult.result.uint8Array)
        const processedAudio = await processAudio(buffer)

        return {
          taskResult,
          buffer,
          processedAudio,
        }
      },
      {
        provider: model.provider,
        modelId: model.id,
        type: 'voice',
        mode,
        strategy: selectedStrategy,
        pricing: model.pricing,
      },
      (result, base) => ({
        ...base,
        provider: result.taskResult.provider,
        modelId: result.taskResult.modelId,
        pricing: result.taskResult.pricing ?? base.pricing,
        fallbackUsed:
          (result.taskResult.attemptCount ?? 1) > 1 ||
          (result.taskResult.fallbackUsed ?? false),
        reason: result.taskResult.fallbackReason ?? base.reason ?? null,
      }),
      undefined,
      (result, context) => {
        const seconds = result.processedAudio.durationSeconds
        const perSecond = context.pricing?.perSecond

        if (
          typeof perSecond !== 'number' ||
          !Number.isFinite(perSecond) ||
          !Number.isFinite(seconds)
        ) {
          return { totalCost: 0, isCostEstimated: false }
        }

        return {
          totalCost: seconds * perSecond,
          isCostEstimated: true,
        }
      },
    )

    const {
      buffer,
      processedAudio: { durationSeconds, format, fileName },
    } = generationResult
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
        execution: {
          mode: metrics.mode,
          strategy: metrics.strategy,
          attemptCount: generationResult.taskResult.attemptCount,
          attemptedModelIds: generationResult.taskResult.attemptedModelIds,
          latencyMs: metrics.latency,
          inputTokens: metrics.inputTokens,
          outputTokens: metrics.outputTokens,
          totalTokens: metrics.totalTokens,
          totalCostUsd: metrics.totalCost,
          isCostEstimated: metrics.isCostEstimated,
          fallbackUsed: metrics.fallbackUsed,
          reason: metrics.reason,
          timestamp: metrics.timestamp,
          durationSeconds,
        },
      },
    }
  },
}
