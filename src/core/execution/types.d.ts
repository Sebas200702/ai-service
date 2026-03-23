import type { ModelPricingUsd } from '@/types'
import type { AIModelDescriptor, LanguageModel, Message } from 'ai'

export type AITaskResult<T> = {
  result: T
  provider: string
  modelId: string
  pricing?: ModelPricingUsd
  fallbackUsed?: boolean
  fallbackReason?: string | null
  attemptCount?: number
  attemptedModelIds?: string[]
  usage?: {
    promptTokens: number | null
    completionTokens: number | null
    totalTokens: number | null
  }
}

export interface ExecuteTextTaskInput {
  model: AIModelDescriptor<LanguageModel>
  fallbackModels?: AIModelDescriptor<LanguageModel>[]
  messages?: Message[]
  audioFile?: File | Buffer
  voiceId?: string
  prompt?: string
}
