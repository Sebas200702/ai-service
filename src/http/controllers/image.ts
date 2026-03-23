import { imageService } from '@/services/image'

import type { GeneratedImage, InputImage } from '@/schemas/image'
import type { ApiResponse } from '@/types'

const generateImage = async (input: InputImage) => {
  const { data, modelMetadata } = await imageService.generateImage(input)
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
