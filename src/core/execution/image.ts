import { generateImage, generateText, type GeneratedFile, type ImageModel, type LanguageModel } from 'ai'
import type { AITaskResult } from '@/core/execution/types'
import type { AIModelDescriptor } from '@/types'
import { generateApifreeImage } from '@/infra/ai/apifree'

type ImageTaskModel = AIModelDescriptor<LanguageModel> | AIModelDescriptor<ImageModel> | AIModelDescriptor<string>

export const executeImageTask = async ({
  model,
  prompt,
}: {
  model: ImageTaskModel
  prompt: string
}): Promise<AITaskResult<GeneratedFile | null>> => {
  if (typeof model.model === 'string') {
    const { base64, mimeType } = await generateApifreeImage(prompt)
    const uint8Array = new Uint8Array(Buffer.from(base64, 'base64'))
    return {
      result: { uint8Array, mediaType: mimeType } as GeneratedFile,
      provider: model.provider,
      modelId: model.id,
    }
  }

  if ('maxImagesPerCall' in model.model) {
    const { images } = await generateImage({
      model: model.model as ImageModel,
      prompt,
      size: '1024x1024',
      n: 1,
    })

    const image = images[0]
    if (!image) {
      return { result: null, provider: model.provider, modelId: model.id }
    }

    return {
      result: { uint8Array: image.uint8Array, mediaType: 'image/png' } as GeneratedFile,
      provider: model.provider,
      modelId: model.id,
    }
  }

  const {files} = await generateText({
    model: model.model as LanguageModel,
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
