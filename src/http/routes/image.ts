import { Elysia } from 'elysia'

import { imageController } from '@/http/controllers/image'
import { createResponseSchema } from '@/http/openapi/open-api'
import { generatedImageSchema, inputImageSchema } from '@/schemas/image'

export const imageRoutes = new Elysia({ prefix: '/image' }).post(
  '/generate',
  async ({ body }) => {
    return await imageController.generateImage(body)
  },
  {
    body: inputImageSchema,
    response: {
      200: createResponseSchema(generatedImageSchema),
    },
  },
)
