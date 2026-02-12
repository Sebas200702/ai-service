import { executeImageTask } from '@/core/execution/image'
import { getNextImageModel } from '@/core/orchestration'
import { createFile, getPublicFilePreviewUrl } from '@/infra/storage/appwrite'
import { getImageSize, toWebp } from '@/infra/processors/sharp'
import type { GeneratedImage } from '@/schemas/generated-image'
import type { ModelMetadata } from '@/types'

export const imageService = {
  async generateImage(prompt: string): Promise<{
    data: GeneratedImage
    modelMetadata: ModelMetadata
  }> {
    const model = getNextImageModel()

    if (!model) {
      throw new Error('No image models available')
    }

    const task = await executeImageTask({
      model,
      messages: [{ role: 'user', content: prompt }],
    })

    if (!task.result) {
      throw new Error('Image generation failed')
    }

    const buffer = task.result.uint8Array
      ? Buffer.from(task.result.uint8Array)
      : Buffer.from(task.result.base64, 'base64')

    // Convert to WebP before uploading to ensure allowed extension
    const webpBuffer = await toWebp(buffer, 80)
    const fileName = `generated-image-${Date.now()}.webp`

    const uploaded = await createFile({
      buffer: webpBuffer,
      name: fileName,
    })
    const imageUrl = getPublicFilePreviewUrl(uploaded.$id)

    const { width, height } = await getImageSize(webpBuffer)

    return {
      data: {
        imageUrl,
        width,
        height,
        altText: `Generated image for prompt: ${prompt}`,
      },
      modelMetadata: {
        provider: model.provider,
        modelId: model.id,
        type: 'image',
      },
    }
  },
}
