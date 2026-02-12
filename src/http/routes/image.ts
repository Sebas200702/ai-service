import { imageController } from '@/http/controllers/image'
import { createOpenApiRouter } from '@/http/openapi/openapi-router'
import { generateImageRoute } from '@/http/openapi/image.openapi'

export const imageRouter = createOpenApiRouter()

imageRouter.openapi(generateImageRoute, imageController.generateImage)

