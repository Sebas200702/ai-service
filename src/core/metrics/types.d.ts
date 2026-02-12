import type { ModelMetadata } from '@/types'

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface Metrics extends ModelMetadata, TokenUsage {
  latency: number
  timeToFirstToken?: number

  totalCost?: number
  success: boolean
  errorType?: string
  fallbackUsed: boolean

  timestamp: number
}

export interface RecordedResult<T> {
  result: T
  metrics: Metrics
}
