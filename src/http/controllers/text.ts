import { createEventStream } from '@/core/streaming/stream-builder'
import { textService } from '@/services/text'

import type { InputText } from '@/schemas/text'

const generateText = async (input: InputText) => {
  const { data, modelMetadata } = await textService.generate(input)
  return {
    mode: 'standard' as const,
    text: data.text,
    modelMetadata: modelMetadata,
  }
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
