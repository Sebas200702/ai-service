import { AppError } from '@/http/middlewares/error'
import type {
  AISelectionMode,
  AISelectionStrategy,
  ModelMetadata,
  ModelPricingUsd,
} from '@/types'

import type { Metrics, RecordedResult, TokenUsage } from '@/core/metrics/types'
import { saveMetrics } from '@/infra/supabase/metrics'

export interface MetricsRecorderContext extends ModelMetadata {
  mode: AISelectionMode
  strategy: AISelectionStrategy
  pricing?: ModelPricingUsd
  fallbackUsed?: boolean
  reason?: string | null
}

interface CostEstimationResult {
  totalCost: number
  isCostEstimated: boolean
}

const calculateTokenEstimatedCost = (
  usage: TokenUsage | undefined,
  pricing: ModelPricingUsd | undefined,
): CostEstimationResult => {
  if (
    !pricing ||
    usage?.inputTokens === null ||
    usage?.inputTokens === undefined ||
    usage?.outputTokens === null ||
    usage?.outputTokens === undefined
  ) {
    return { totalCost: 0, isCostEstimated: false }
  }

  return {
    totalCost:
      (usage.inputTokens * pricing.input +
        usage.outputTokens * pricing.output) /
      1_000_000,
    isCostEstimated: true,
  }
}

export const metricsRecorder = async <T>(
  fn: () => Promise<T>,
  modelMetadata: MetricsRecorderContext,
  resolveMetadata?: (
    result: T,
    base: MetricsRecorderContext,
  ) => MetricsRecorderContext,
  getUsage?: (result: T) => TokenUsage,
  resolveCost?: (
    result: T,
    context: MetricsRecorderContext,
    usage?: TokenUsage,
  ) => CostEstimationResult,
): Promise<RecordedResult<T>> => {
  const startTime = Date.now()

  try {
    const result = await fn()
    const endTime = Date.now()
    const usage = getUsage?.(result)
    const inputTokens = usage?.inputTokens ?? null
    const outputTokens = usage?.outputTokens ?? null
    const totalTokens = usage?.totalTokens ?? null
    const resolvedMetadata =
      resolveMetadata?.(result, modelMetadata) ?? modelMetadata
    const costEstimation =
      resolveCost?.(result, resolvedMetadata, usage) ??
      calculateTokenEstimatedCost(usage, resolvedMetadata.pricing)

    const metrics: Metrics = {
      ...resolvedMetadata,
      inputTokens,
      outputTokens,
      totalTokens,
      latency: endTime - startTime,
      reason: resolvedMetadata.reason ?? null,
      totalCost: costEstimation.totalCost,
      isCostEstimated: costEstimation.isCostEstimated,
      success: true,
      errorType: null,
      fallbackUsed: resolvedMetadata.fallbackUsed ?? false,
      timestamp: startTime,
    }

    await saveMetrics(metrics)

    return { result, metrics }
  } catch (error) {
    const endTime = Date.now()
    const failureMetrics: Metrics = {
      ...modelMetadata,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      latency: endTime - startTime,
      reason: error instanceof Error ? error.message : 'AI task failed',
      totalCost: 0,
      isCostEstimated: false,
      success: false,
      errorType: error instanceof Error ? error.name : 'UnknownError',
      fallbackUsed: modelMetadata.fallbackUsed ?? false,
      timestamp: startTime,
    }

    await saveMetrics(failureMetrics)

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
