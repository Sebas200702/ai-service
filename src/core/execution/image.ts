import { generateText } from 'ai'
import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'

export const executeImageTask = async ({
  model,
  messages,
}: ExecuteTextTaskInput): Promise<
  AITaskResult<{
    base64: string
    uint8Array: Uint8Array
    mediaType: string
  } | null>
> => {
  const { files } = await generateText({
    model: model.model,
    messages,
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
