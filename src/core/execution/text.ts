import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'
import { generateText, streamText } from 'ai'

export const executeTextTask = async ({
  model,
  messages,
}: ExecuteTextTaskInput): Promise<AITaskResult<string>> => {
  const { text } = await generateText({
    model: model.model,
    messages: messages ?? [],
  })

  return {
    result: text,
    provider: model.provider,
    modelId: model.id,
  }
}

export const executeStreamText = ({
  model,
  messages,
}: ExecuteTextTaskInput) => {
  const { textStream } = streamText({
    model: model.model,
    messages: messages ?? [],
  })
  return textStream
}
