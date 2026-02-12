import type { AIModelDescriptor } from '@/types'
import {
  type LanguageModel,
  type TranscriptionModel,
  generateText,
  streamText,
  experimental_transcribe as transcribe,
} from 'ai'

export type AITaskResult<T> = {
  result: T
  provider: string
  modelId: string
}

type ExecuteTextTaskInput = {
  model: AIModelDescriptor<LanguageModel>
  messages: Parameters<typeof generateText>[0]['messages']
}

export const executeTextTask = async (
  input: ExecuteTextTaskInput,
): Promise<AITaskResult<string>> => {
  const { model, messages } = input

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

export const executeImageTask = async (input: {
  model: AIModelDescriptor<LanguageModel>
  prompt: string
}): Promise<
  AITaskResult<{
    base64: string
    uint8Array: Uint8Array
    mediaType: string
  } | null>
> => {
  const { model, prompt } = input
  const { files } = await generateText({
    model: model.model,
    messages: [{ role: 'user', content: prompt }],
    providerOptions: {
      google: {
        responseModalities: ['IMAGE'],
      },
      openrouter: {
        responseModalities: ['IMAGE'],
      },
    },
  })

  return {
    result: files?.[0] || null,
    provider: model.provider,
    modelId: model.id,
  }
}

export const executeTranscriptionTask = async (input: {
  model: AIModelDescriptor<TranscriptionModel>
  audioBuffer: Buffer
}): Promise<AITaskResult<string>> => {
  const { model, audioBuffer } = input
  const { text } = await transcribe({
    model: model.model,
    audio: audioBuffer,
  })

  return {
    result: text,
    provider: model.provider,
    modelId: model.id,
  }
}

export const executeStreamText = (input: {
  model: LanguageModel
  messages: Parameters<typeof generateText>[0]['messages']
}) => {
  const { model, messages } = input

  const { textStream } = streamText({
    model: model,
    messages: messages ?? [],
  })
  return textStream
}
