import type { ApiResponse } from '@/types'

import { createEventStream } from '@/core/streaming/stream-builder'
import { textService } from '@/services/text'

import type { GeneratedText, InputText } from '@/schemas/text'

const generateText = async (input: InputText) => {
  const { data, modelMetadata } = await textService.generate(input)
  const response: ApiResponse<GeneratedText> = {
    success: true,
    data,
    error: null,
    modelMetadata,
  }

  return response
}

const streamGenerateText = (input: InputText) => {
  const stream = textService.stream(input)
  return {
    mode: 'streaming' as const,
    stream: createEventStream(stream),
  }
}

export const textController = {
  generateText,
  streamGenerateText,
}
