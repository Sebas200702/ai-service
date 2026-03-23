import { supabase } from '@/infra/supabase/client'

import type { AIModalities, AIModelDescriptor } from '@/types'

type LatencyMetricRow = {
  model_id: string
  average_latency: number
  sample_count: number
  type: AIModalities
}

export async function withLowestLatency<T extends AIModelDescriptor<unknown>>(
  models: T[],
  type: AIModalities
) {
  const { data, error } = await supabase
    .from('model_latency_stats')
    .select('model_id, average_latency, sample_count, type')
    .eq('type', type)
    .order('average_latency', { ascending: true })

  if (error || !data?.length) {
    return models
  }

  const rows = data as LatencyMetricRow[]
  const scoredModels = models
    .map((model) => {
      const stat = rows.find((row) => row.model_id === model.id)

      return {
        model,
        averageLatency: stat?.average_latency ?? Number.POSITIVE_INFINITY,
        sampleCount: stat?.sample_count ?? 0,
      }
    })
    .sort((left, right) => {
      if (left.sampleCount === 0 && right.sampleCount === 0) {
        return 0
      }

      if (left.sampleCount === 0) {
        return -1
      }

      if (right.sampleCount === 0) {
        return 1
      }

      return left.averageLatency - right.averageLatency
    })

  const orderedModels = scoredModels.map(({ model }) => model)

  return orderedModels.length ? orderedModels : models
}
