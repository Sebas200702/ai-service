import { executeTextTask, executeStreamText } from '@/core/execution/text'
import { metricsRecorder } from '@/core/metrics/recorder'
import { getNextTextModel } from '@/core/orchestration'
import { AppError } from '@/http/middlewares/error'
import type { StandardTextResult, TextStream } from '@/types'

export const textService = {
  async generate(prompt: string): Promise<StandardTextResult> {
    const model = getNextTextModel()
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
            messages: [{ role: 'user', content: prompt }],
          }),
        { provider: model.provider, modelId: model.id, type: 'text' },
        (res) => ({
          inputTokens: res.usage?.promptTokens ?? 0,
          outputTokens: res.usage?.completionTokens ?? 0,
          totalTokens: res.usage?.totalTokens ?? 0,
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

  async *stream(prompt: string): TextStream {
    const model = getNextTextModel()
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
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const chunk of result) {
      yield { type: 'delta', content: chunk }
    }

    yield { type: 'end' }
  },
}
