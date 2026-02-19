import type { AIModelDescriptor, LanguageModel, Message } from 'ai'

export type AITaskResult<T> = {
  result: T
  provider: string
  modelId: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface ExecuteTextTaskInput {
  model: AIModelDescriptor<LanguageModel>
  messages?: Message[]
  audioFile?: File | Buffer
  voiceId?: string
  prompt?: string
}
