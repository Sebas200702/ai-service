import type { ModelMetadata } from '@/types'
export interface Metrics extends ModelMetadata {
  inputTokens: number
  outputTokens: number
  totalTokens: number

  latency: number
  timeToFirstToken?: number

  totalCost?: number
  success: boolean
  errorType?: string
  fallbackUsed: boolean

  timestamp: number
}
