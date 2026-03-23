import { supabase } from '@/infra/supabase/client'

import type { Metrics } from '@/core/metrics/types'
import { updateModelLatencyStats } from '@/infra/supabase/model-latency-stats'

export const saveMetrics = async (metrics: Metrics) => {
  const { error } = await supabase.from('metrics').insert({
    provider: metrics.provider,
    model_id: metrics.modelId,
    type: metrics.type,
    reason: metrics.reason,
    input_tokens: metrics.inputTokens ?? null,
    output_tokens: metrics.outputTokens ?? null,
    total_tokens: metrics.totalTokens ?? null,
    latency: metrics.latency,
    total_cost: metrics.totalCost,
    is_cost_estimated: metrics.isCostEstimated,
    success: metrics.success,
    error_type: metrics.errorType,
    fallback_used: metrics.fallbackUsed,
    mode: metrics.mode,
    strategy: metrics.strategy,
    ts: metrics.timestamp,
  })

  if (error) {
    console.error('Failed to persist metrics:', error.message)
    return
  }

  if (metrics.success) {
    try {
      await updateModelLatencyStats({
        provider: metrics.provider,
        modelId: metrics.modelId,
        type: metrics.type,
        latency: metrics.latency,
        timestamp: metrics.timestamp,
      })
    } catch (statsError) {
      console.error('Failed to update latency stats:', statsError)
    }
  }
}
