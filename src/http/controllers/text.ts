import { textService } from '@/services/text'
import {createEventStream} from '@/core/streaming/stream-builder'

const generateText = async (input: {
  prompt: string
}) => {
  const { data, modelMetadata } = await textService.generate(input.prompt)
  return {
    mode: 'standard' as const,
    text: data.text,
    modelMetadata: modelMetadata,
  }
}

const streamGenerateText = (input: {
  prompt: string
}) => {
  const stream = textService.stream(input.prompt)
  return cr




  
}

export const textController = {
  generateText,
  streamGenerateText,
}
