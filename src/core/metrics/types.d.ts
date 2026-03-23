import type {
  AISelectionMode,
  AISelectionStrategy,
  ModelMetadata,
} from '@/types'

export interface TokenUsage {
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
}

export interface Metrics extends ModelMetadata, TokenUsage {
  mode: AISelectionMode
  strategy: AISelectionStrategy
  reason: string | null
  latency: number
  timeToFirstToken?: number

  totalCost: number
  isCostEstimated: boolean
  success: boolean
  errorType: string | null
  fallbackUsed: boolean

  timestamp: number
}

export interface RecordedResult<T> {
  result: T
  metrics: Metrics
}
