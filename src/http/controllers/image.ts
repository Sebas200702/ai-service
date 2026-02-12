import { imageService } from '@/services/image'
import type { GeneratedImage } from '@/schemas/generated-image'
import type { ApiResponse } from '@/types'

const generateImage = async (input: { prompt: string }) => {
  const { data, modelMetadata } = await imageService.generateImage(input.prompt)
  const response: ApiResponse<GeneratedImage> = {
    success: true,
    data: data,
    error: null,
    modelMetadata: modelMetadata,
  }
  return response
}

export const imageController = {
  generateImage,
}

