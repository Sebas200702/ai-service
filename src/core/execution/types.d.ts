import type { AIModelDescriptor, LanguageModel, Message } from 'ai'

export type AITaskResult<T> = {
  result: T
  provider: string
  modelId: string
}

export interface ExecuteTextTaskInput {
  model: AIModelDescriptor<LanguageModel>
  messages: Message[]
}
