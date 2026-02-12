import { imageService } from '@/services/image'
import type { generateImageRoute } from '@/http/openapi/image.openapi'
import type { RouteHandler } from '@hono/zod-openapi'
import type { GeneratedImage } from '@/schemas/generated-image'
import type { ApiResponse } from '@/types'

const generateImage: RouteHandler<typeof generateImageRoute> = async (c) => {
  const { prompt } = c.req.valid('json')
  const { data, modelMetadata } = await imageService.generateImage(prompt)
  const response: ApiResponse<GeneratedImage> = {
    success: true,
    data: data,
    error: null,
    modelMetadata: modelMetadata,
  }
  return c.json(response)
}

export const imageController = {
  generateImage,
}

