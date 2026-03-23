import { supabase } from '@/infra/supabase/client'

import type { AIModalities } from '@/types'

export const updateModelLatencyStats = async ({
  provider,
  modelId,
  type,
  latency,
  timestamp,
}: {
  provider: string
  modelId: string
  type: AIModalities
  latency: number
  timestamp: number
}) => {
  const { error } = await supabase.rpc('upsert_model_latency_stat', {
    p_provider: provider,
    p_model_id: modelId,
    p_type: type,
    p_latency: latency,
    p_ts: timestamp,
  })

  if (error) {
    throw error
  }
}
