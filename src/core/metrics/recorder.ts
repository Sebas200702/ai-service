import type { ModelMetadata } from '@/types'
import { AppError } from '@/http/middlewares/error'
import type { Metrics, RecordedResult, TokenUsage } from '@/core/metrics/types'

export const metricsRecorder = async <T>(
  fn: () => Promise<T>,
  modelMetadata: ModelMetadata,
  getUsage?: (result: T) => TokenUsage
): Promise<RecordedResult<T>> => {
  const startTime = Date.now()

  try {
    const result = await fn()
    const endTime = Date.now()
    const usage = getUsage?.(result)

    const metrics: Metrics = {
      ...modelMetadata,
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      totalTokens: usage?.totalTokens ?? 0,
      latency: endTime - startTime,
      success: true,
      fallbackUsed: false,
      timestamp: startTime,
    }

    return { result, metrics }
  } catch (error) {
    const endTime = Date.now()

    const metrics: Metrics = {
      ...modelMetadata,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latency: endTime - startTime,
      success: false,
      errorType: error instanceof Error ? error.name : 'UnknownError',
      fallbackUsed: false,
      timestamp: startTime,
    }

    throw new AppError({
      service: modelMetadata.type,
      operation: 'execution',
      reason: 'AI task failed during execution',
      metadata: {
        provider: modelMetadata.provider,
        modelId: modelMetadata.modelId,
        latency: endTime - startTime,
      },
      cause: error,
    })
  }
}
