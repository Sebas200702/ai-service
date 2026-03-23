import { executeTranscriptionTask } from '@/core/execution/transcription'
import { metricsRecorder } from '@/core/metrics/recorder'
import {
  getNextTranscriptionModel,
  getTranscriptionModelCandidates,
} from '@/core/orchestration/index'
import { AppError } from '@/http/middlewares/error'
import { fetchAudioBuffer } from '@/infra/processors/audio'
import type { InputTranscription } from '@/schemas/transcription'

import type { StandardTranscriptionResult } from '@/types'

export const transcriptionService = {
  async transcribe({
    audioFile,
    mode,
    strategy,
    modelId,
  }: InputTranscription): Promise<StandardTranscriptionResult> {
    const selectedStrategy =
      mode === 'manual' ? 'manual' : (strategy ?? 'lowLatency')

    if (mode === 'manual' && !modelId) {
      throw new AppError({
        service: 'transcription',
        operation: 'model_selection',
        reason: 'Manual mode requires a modelId',
      })
    }

    const candidates = await getTranscriptionModelCandidates({
      mode,
      strategy: selectedStrategy,
      modelId,
    })
    const model = await getNextTranscriptionModel({
      mode,
      strategy: selectedStrategy,
      modelId,
    })
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
      const { result: taskResult, metrics } = await metricsRecorder(
        async () =>
          executeTranscriptionTask({
            model,
            fallbackModels: candidates
              .filter((candidate) => candidate.id !== model.id)
              .slice(0, 1),
            audioFile:
              typeof audioFile === 'string'
                ? await fetchAudioBuffer(audioFile)
                : audioFile,
          }),
        {
          provider: model.provider,
          modelId: model.id,
          type: 'transcription',
          mode,
          strategy: selectedStrategy,
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
        undefined,
        (result, context) => {
          const seconds = result.result.durationSeconds
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

      return {
        data: taskResult.result,
        modelMetadata: {
          provider: metrics.provider,
          type: 'transcription',
          modelId: metrics.modelId,
          execution: {
            mode: metrics.mode,
            strategy: metrics.strategy,
            attemptCount: taskResult.attemptCount,
            attemptedModelIds: taskResult.attemptedModelIds,
            latencyMs: metrics.latency,
            inputTokens: metrics.inputTokens,
            outputTokens: metrics.outputTokens,
            totalTokens: metrics.totalTokens,
            totalCostUsd: metrics.totalCost,
            isCostEstimated: metrics.isCostEstimated,
            fallbackUsed: metrics.fallbackUsed,
            reason: metrics.reason,
            timestamp: metrics.timestamp,
            durationSeconds: taskResult.result.durationSeconds,
          },
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
