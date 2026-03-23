import { executeStreamText, executeTextTask } from '@/core/execution/text'
import { metricsRecorder } from '@/core/metrics/recorder'
import { getNextTextModel, getTextModelCandidates } from '@/core/orchestration'
import { AppError } from '@/http/middlewares/error'
import type { InputText } from '@/schemas/text'

import type { StandardTextResult, TextStream } from '@/types'

export const textService = {
  async generate(input: InputText): Promise<StandardTextResult> {
    const strategy =
      input.mode === 'manual' ? 'manual' : (input.strategy ?? 'lowLatency')

    if (input.mode === 'manual' && !input.modelId) {
      throw new AppError({
        service: 'text',
        operation: 'model_selection',
        reason: 'Manual mode requires a modelId',
      })
    }

    const candidates = await getTextModelCandidates({
      mode: input.mode,
      strategy,
      modelId: input.modelId,
    })
    const model = await getNextTextModel({
      mode: input.mode,
      strategy,
      modelId: input.modelId,
    })
    if (!model) {
      throw new AppError({
        service: 'text',
        operation: 'model_selection',
        reason: 'No text models available',
      })
    }
    try {
      const { result: taskResult, metrics } = await metricsRecorder(
        () =>
          executeTextTask({
            model,
            fallbackModels: candidates
              .filter((candidate) => candidate.id !== model.id)
              .slice(0, 1),
            messages: [{ role: 'user', content: input.prompt }],
          }),
        {
          provider: model.provider,
          modelId: model.id,
          type: 'text',
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
        (res) => ({
          inputTokens: res.usage?.promptTokens ?? null,
          outputTokens: res.usage?.completionTokens ?? null,
          totalTokens: res.usage?.totalTokens ?? null,
        })
      )

      return {
        data: {
          text: taskResult.result,
          length: taskResult.result.length,
        },
        modelMetadata: {
          provider: metrics.provider,
          modelId: metrics.modelId,
          type: 'text',
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
          },
        },
      }
    } catch (error) {
      console.error('Error during text generation:', error)
      throw new AppError({
        service: 'text',
        operation: 'generation',
        reason:
          (error as Error).message || 'Unknown error during text generation',
      })
    }
  },

  async *stream(input: InputText): TextStream {
    const strategy =
      input.mode === 'manual' ? 'manual' : (input.strategy ?? 'lowLatency')

    if (input.mode === 'manual' && !input.modelId) {
      throw new AppError({
        service: 'text',
        operation: 'model_selection',
        reason: 'Manual mode requires a modelId',
      })
    }

    const candidates = await getTextModelCandidates({
      mode: input.mode,
      strategy,
      modelId: input.modelId,
    })
    const model = await getNextTextModel({
      mode: input.mode,
      strategy,
      modelId: input.modelId,
    })
    if (!model) {
      throw new AppError({
        service: 'text',
        operation: 'model_selection',
        reason: 'No text models available for streaming',
      })
    }

    const modelMetadata = {
      provider: model.provider,
      modelId: model.id,
      type: 'text' as const,
    }

    yield { type: 'start', modelMetadata }

    const result = executeStreamText({
      model,
      fallbackModels: candidates
        .filter((candidate) => candidate.id !== model.id)
        .slice(0, 1),
      messages: [{ role: 'user', content: input.prompt }],
    })

    for await (const chunk of result) {
      yield { type: 'delta', content: chunk }
    }

    yield { type: 'end' }
  },
}
